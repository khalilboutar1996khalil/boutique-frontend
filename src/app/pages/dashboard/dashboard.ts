import { Component, OnInit, signal, computed } from '@angular/core';
import { DashboardService } from '../../services/dashboard';
import { CommandeService } from '../../services/commande';
import { ProduitService } from '../../services/produit';
import { AuthService } from '../../services/auth';
import { DashboardStats } from '../../models/DashboardStats';
import { Commande } from '../../models/commande';
import { Produit } from '../../models/produit';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  stats = signal<DashboardStats | null>(null);
  statsError = signal<boolean>(false);
  username = signal<string | null>(null);
  allCommandes = signal<Commande[]>([]);
  lowStockProduits = signal<Produit[]>([]);

  // Filter signals
  searchQuery = signal<string>('');
  statusFilter = signal<string>('TOUS');

  // Vue du graphique de ventes : par mois ou par année
  vueVentes = signal<'mois' | 'annee'>('mois');

  // Objectif de vente mensuel (stocké localement, pas de champ backend pour l'instant)
  private readonly cleObjectif = 'objectifMensuelCA';
  objectifMensuel = signal<number>(Number(localStorage.getItem(this.cleObjectif)) || 0);
  objectifEnEdition = signal<boolean>(false);
  objectifSaisi: number | null = null;

  // Computed signal for filtered orders (returns top 5 match)
  filteredCommandes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    let list = this.allCommandes();

    if (query) {
      list = list.filter(c => c.clientNom && c.clientNom.toLowerCase().includes(query));
    }
    if (status !== 'TOUS') {
      list = list.filter(c => c.statut === status);
    }

    // Sort by date desc
    return list.sort((a, b) => {
      const dateA = a.dateCommande ? new Date(a.dateCommande).getTime() : 0;
      const dateB = b.dateCommande ? new Date(b.dateCommande).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA;
      return b.id - a.id;
    }).slice(0, 5);
  });

  // Computed signal for last 6 months sales evolution
  monthlySales = computed(() => {
    const list = this.allCommandes();
    const monthsData: { label: string; monthIndex: number; year: number; amount: number; count: number; percentage: number }[] = [];

    const today = new Date();
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('fr-FR', { month: 'short' });
      const label = monthName.charAt(0).toUpperCase() + monthName.slice(1).replace('.', '');
      monthsData.push({
        label,
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        amount: 0,
        count: 0,
        percentage: 0
      });
    }

    // Group orders sum
    list.forEach(cmd => {
      if (!cmd.dateCommande) return;
      const d = new Date(cmd.dateCommande);
      const m = d.getMonth();
      const y = d.getFullYear();

      const bucket = monthsData.find(b => b.monthIndex === m && b.year === y);
      if (bucket) {
        bucket.amount += cmd.montantTotal || 0;
        bucket.count += 1;
      }
    });

    // Calculate percentage relative to max month amount
    const maxAmount = Math.max(...monthsData.map(m => m.amount), 1);
    monthsData.forEach(b => {
      b.percentage = Math.round((b.amount / maxAmount) * 100);
    });

    return monthsData;
  });

  // Computed signal for sales evolution grouped by year
  yearlySales = computed(() => {
    const list = this.allCommandes();
    const totauxParAnnee = new Map<number, number>();

    list.forEach(cmd => {
      if (!cmd.dateCommande) return;
      const annee = new Date(cmd.dateCommande).getFullYear();
      totauxParAnnee.set(annee, (totauxParAnnee.get(annee) || 0) + (cmd.montantTotal || 0));
    });

    const annees = Array.from(totauxParAnnee.keys()).sort((a, b) => a - b);
    const maxAmount = Math.max(...annees.map(a => totauxParAnnee.get(a)!), 1);

    return annees.map(annee => ({
      label: String(annee),
      amount: totauxParAnnee.get(annee)!,
      percentage: Math.round((totauxParAnnee.get(annee)! / maxAmount) * 100)
    }));
  });

  // Données affichées dans le graphique, selon la vue sélectionnée (mois/année)
  chartData = computed(() => {
    return this.vueVentes() === 'mois' ? this.monthlySales() : this.yearlySales();
  });

  // Computed signal for top 5 clients by total spend
  topClients = computed(() => {
    const totauxParClient = new Map<string, { nom: string; total: number; nbCommandes: number }>();

    this.allCommandes().forEach(cmd => {
      if (!cmd.clientNom) return;
      const entree = totauxParClient.get(cmd.clientNom) || { nom: cmd.clientNom, total: 0, nbCommandes: 0 };
      entree.total += cmd.montantTotal || 0;
      entree.nbCommandes += 1;
      totauxParClient.set(cmd.clientNom, entree);
    });

    return Array.from(totauxParClient.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  });

  // Computed signal for pending orders older than the threshold (in days)
  commandesEnAttenteAnciennes = computed(() => {
    const seuilJours = 3;
    const maintenant = Date.now();

    return this.allCommandes()
      .filter(cmd => {
        if (cmd.statut !== 'EN_ATTENTE' || !cmd.dateCommande) return false;
        const ageJours = (maintenant - new Date(cmd.dateCommande).getTime()) / (1000 * 60 * 60 * 24);
        return ageJours >= seuilJours;
      })
      .sort((a, b) => new Date(a.dateCommande).getTime() - new Date(b.dateCommande).getTime());
  });

  // Computed signal for the current month's progress toward the monthly sales target
  progressionObjectif = computed(() => {
    const objectif = this.objectifMensuel();
    if (objectif <= 0) return null;

    const mois = this.monthlySales();
    const caMoisActuel = mois.length > 0 ? mois[mois.length - 1].amount : 0;

    return {
      ca: caMoisActuel,
      objectif,
      pourcentage: Math.min(100, Math.round((caMoisActuel / objectif) * 100))
    };
  });

  // Computed signal comparing the current month to the previous one (CA & nombre de commandes)
  periodComparison = computed(() => {
    const months = this.monthlySales();
    if (months.length < 2) return null;

    const moisActuel = months[months.length - 1];
    const moisPrecedent = months[months.length - 2];

    const calculerVariation = (actuel: number, precedent: number): number => {
      if (precedent === 0) return actuel > 0 ? 100 : 0;
      return Math.round(((actuel - precedent) / precedent) * 100);
    };

    return {
      caVariation: calculerVariation(moisActuel.amount, moisPrecedent.amount),
      commandesVariation: calculerVariation(moisActuel.count, moisPrecedent.count)
    };
  });

  // Computed signal for donut chart SVG segments
  donutSegments = computed(() => {
    const stats = this.stats();
    if (!stats || stats.totalCommandes === 0) {
      return [];
    }

    const total = stats.totalCommandes;
    const attente = stats.commandesEnAttente;
    const confirmee = stats.commandesConfirmees;
    const livree = stats.commandesLivrees;

    const parts = [
      { label: 'En attente', count: attente, color: '#f59e0b', class: 'stroke-warning' },
      { label: 'Confirmées', count: confirmee, color: '#10b981', class: 'stroke-success' },
      { label: 'Livrées', count: livree, color: '#3b82f6', class: 'stroke-info' }
    ];

    const circumference = 2 * Math.PI * 40; // ~251.327
    let accumulatedLength = 0;

    return parts.map(part => {
      const percentage = (part.count / total) * 100;
      const segmentLength = (part.count / total) * circumference;
      const strokeDasharray = `${segmentLength} ${circumference}`;
      const strokeDashoffset = -accumulatedLength;

      accumulatedLength += segmentLength;

      return {
        ...part,
        percentage: Math.round(percentage),
        strokeDasharray,
        strokeDashoffset
      };
    });
  });

  constructor(
    private dashboardService: DashboardService,
    private commandeService: CommandeService,
    private produitService: ProduitService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.username.set(this.authService.getUsername());
    this.chargerStats();
    this.chargerRecentCommandes();
    this.chargerLowStockProduits();
  }

  chargerStats() {
    this.statsError.set(false);
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (error) => {
        console.error('Erreur stats dashboard :', error);
        this.statsError.set(true);
      }
    });
  }

  chargerRecentCommandes() {
    this.commandeService.findAll().subscribe({
      next: (commandes) => {
        this.allCommandes.set(commandes);
      },
      error: (error) => console.error('Erreur commandes dashboard :', error)
    });
  }

  chargerLowStockProduits() {
    this.produitService.findAll().subscribe({
      next: (produits) => {
        const filtered = produits
          .filter(p => p.stock <= 5)
          .sort((a, b) => a.stock - b.stock);
        this.lowStockProduits.set(filtered.slice(0, 5));
      },
      error: (error) => console.error('Erreur produits dashboard :', error)
    });
  }

  onSearchChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  onStatusChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(val);
  }

  definirVueVentes(vue: 'mois' | 'annee'): void {
    this.vueVentes.set(vue);
  }

  ouvrirEditionObjectif(): void {
    this.objectifSaisi = this.objectifMensuel() || null;
    this.objectifEnEdition.set(true);
  }

  annulerEditionObjectif(): void {
    this.objectifEnEdition.set(false);
  }

  enregistrerObjectif(): void {
    const valeur = this.objectifSaisi ?? 0;
    if (valeur <= 0) return;
    this.objectifMensuel.set(valeur);
    localStorage.setItem(this.cleObjectif, String(valeur));
    this.objectifEnEdition.set(false);
  }

  exporterCommandes(): void {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    let list = this.allCommandes();

    if (query) {
      list = list.filter(c => c.clientNom && c.clientNom.toLowerCase().includes(query));
    }
    if (status !== 'TOUS') {
      list = list.filter(c => c.statut === status);
    }

    if (list.length === 0) return;

    const entetes = ['Client', 'Montant (TND)', 'Date', 'Statut'];
    const echapper = (valeur: string) => `"${valeur.replace(/"/g, '""')}"`;

    const lignes = list.map(c => [
      echapper(c.clientNom || ''),
      c.montantTotal?.toFixed(2) ?? '0.00',
      c.dateCommande ? new Date(c.dateCommande).toLocaleString('fr-FR') : '',
      c.statut
    ].join(';'));

    const csv = [entetes.join(';'), ...lignes].join('\n');
    const bom = '﻿';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const lien = document.createElement('a');
    lien.href = url;
    lien.download = `commandes_${new Date().toISOString().slice(0, 10)}.csv`;
    lien.click();
    URL.revokeObjectURL(url);
  }
}
