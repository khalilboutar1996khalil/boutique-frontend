import { Component, OnInit, signal, computed } from '@angular/core';
import { DashboardService } from '../../services/dashboard';
import { CommandeService } from '../../services/commande';
import { ProduitService } from '../../services/produit';
import { AuthService } from '../../services/auth';
import { DashboardStats } from '../../models/DashboardStats';
import { Commande } from '../../models/commande';
import { Produit } from '../../models/produit';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  stats = signal<DashboardStats | null>(null);
  username = signal<string | null>(null);
  allCommandes = signal<Commande[]>([]);
  lowStockProduits = signal<Produit[]>([]);

  // Filter signals
  searchQuery = signal<string>('');
  statusFilter = signal<string>('TOUS');

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
    const monthsData: { label: string; monthIndex: number; year: number; amount: number; percentage: number }[] = [];

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
      }
    });

    // Calculate percentage relative to max month amount
    const maxAmount = Math.max(...monthsData.map(m => m.amount), 1);
    monthsData.forEach(b => {
      b.percentage = Math.round((b.amount / maxAmount) * 100);
    });

    return monthsData;
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
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (error) => {
        console.error('Erreur stats dashboard :', error);
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
}
