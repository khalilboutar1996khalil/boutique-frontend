import { Component, OnInit, signal } from '@angular/core';
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
  imports:  [CommonModule, FormsModule, RouterLink],
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
    this.clientId = 0;
    this.produitId = 0;
    this.quantite = 1;
    this.messageErreur.set('');
    this.afficherFormulaire.set(true);
  }

  fermerFormulaire() {
    this.afficherFormulaire.set(false);
  }
  passer() {
    this.messageErreur.set('');

    this.commandeService.passerCommande(this.clientId, this.produitId, this.quantite).subscribe({
      next: () => {
        this.chargerCommandes();
        this.fermerFormulaire();
      },
      error: (error) => {
        this.messageErreur.set(error.error?.message || 'Une erreur est survenue.');
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
