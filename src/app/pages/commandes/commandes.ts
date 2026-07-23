import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Commande } from '../../models/commande';
import { Client } from '../../models/client';
import { Produit } from '../../models/produit';
import { ProduitService } from '../../services/produit';
import { CommandeService } from '../../services/commande';
import { ClientService } from '../../services/client';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-commandes',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './commandes.html',
  styleUrl: './commandes.css',
})
export class Commandes implements OnInit {

  commandes = signal<Commande[]>([]);
  clients = signal<Client[]>([]);
  produits = signal<Produit[]>([]);

  afficherFormulaire = signal(false);
  messageErreur = signal('');

  clientId: number = 0;
  produitId: number = 0;
  quantite: number = 1;

  // Filter signals
  searchQuery = signal<string>('');
  statusFilter = signal<string>('TOUS');

  // Filtered orders list
  filteredCommandes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();

    return this.commandes().filter(c => {
      const matchQuery = !query || (c.clientNom && c.clientNom.toLowerCase().includes(query)) || c.id.toString().includes(query);
      const matchStatus = status === 'TOUS' || c.statut === status;
      return matchQuery && matchStatus;
    }).sort((a, b) => {
      const dateA = a.dateCommande ? new Date(a.dateCommande).getTime() : 0;
      const dateB = b.dateCommande ? new Date(b.dateCommande).getTime() : 0;
      return dateB - dateA;
    });
  });

  // Selected product price estimation
  prixEstime = computed(() => {
    if (!this.produitId || this.quantite <= 0) return 0;
    const prod = this.produits().find(p => p.id === Number(this.produitId));
    return prod ? prod.prix * this.quantite : 0;
  });

  constructor(
    private commandeService: CommandeService,
    private clientService: ClientService,
    private produitService: ProduitService
  ) { }

  ngOnInit(): void {
    this.chargerCommandes();
    this.chargerClients();
    this.chargerProduits();
  }

  chargerCommandes() {
    this.commandeService.findAll().subscribe({
      next: (commandes) => this.commandes.set(commandes),
      error: (error) => console.error('Erreur commandes :', error)
    });
  }

  chargerClients() {
    this.clientService.findAll().subscribe({
      next: (clients) => this.clients.set(clients),
      error: (error) => console.error('Erreur clients :', error)
    });
  }

  chargerProduits() {
    this.produitService.findAll().subscribe({
      next: (produits) => this.produits.set(produits),
      error: (error) => console.error('Erreur produits :', error)
    });
  }

  ouvrirFormulaire() {
    this.clientId = this.clients().length > 0 ? this.clients()[0].id : 0;
    this.produitId = this.produits().length > 0 ? this.produits()[0].id : 0;
    this.quantite = 1;
    this.messageErreur.set('');
    this.afficherFormulaire.set(true);
  }

  fermerFormulaire() {
    this.afficherFormulaire.set(false);
  }

  passer() {
    this.messageErreur.set('');
    if (!this.clientId || !this.produitId || this.quantite <= 0) {
      this.messageErreur.set('Veuillez remplir tous les champs correctement.');
      return;
    }

    this.commandeService.passerCommande(Number(this.clientId), Number(this.produitId), this.quantite).subscribe({
      next: () => {
        this.chargerCommandes();
        this.fermerFormulaire();
      },
      error: (error) => {
        this.messageErreur.set(error.error?.message || 'Une erreur est survenue lors de la création de la commande.');
      }
    });
  }

  changerStatut(id: number, nouveauStatut: string) {
    this.commandeService.changerStatut(id, nouveauStatut).subscribe({
      next: () => {
        this.chargerCommandes();
      },
      error: (error) => {
        console.error('Erreur changement statut :', error);
      }
    });
  }
}
