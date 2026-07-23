import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client';
import { Client } from '../../models/client';

@Component({
  selector: 'app-clients',
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients implements OnInit {

  clients = signal<Client[]>([]);
  chargement = signal<boolean>(true);

  nom: string = '';
  email: string = '';
  telephone: string = '';
  clientEnEdition: number | null = null;
  afficherFormulaire = signal(false);
  messageErreur = signal('');
  idASupprimer: number | null = null;

  // Search filter signal
  searchQuery = signal<string>('');

  filteredClients = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    return this.clients().filter(c => 
      !query || 
      c.nom.toLowerCase().includes(query) || 
      c.email.toLowerCase().includes(query) || 
      c.telephone.includes(query)
    );
  });

  constructor(private clientService: ClientService) { }

  ngOnInit(): void {
    this.chargerClients();
  }

  chargerClients(): void {
    this.chargement.set(true);
    this.clientService.findAll().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.chargement.set(false);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des clients :', error);
        this.chargement.set(false);
      }
    });
  }

  ouvrirFormulaireCreation(): void {
    this.clientEnEdition = null;
    this.nom = '';
    this.email = '';
    this.telephone = '';
    this.messageErreur.set('');
    this.afficherFormulaire.set(true);
  }

  ouvrirFormulaireEdition(client: Client): void {
    this.clientEnEdition = client.id;
    this.nom = client.nom;
    this.email = client.email;
    this.telephone = client.telephone;
    this.messageErreur.set('');
    this.afficherFormulaire.set(true);
  }

  fermerFormulaire(): void {
    this.afficherFormulaire.set(false);
  }

  enregistrer(): void {
    const dto = { nom: this.nom, email: this.email, telephone: this.telephone };
    this.messageErreur.set('');

    if (this.clientEnEdition !== null) {
      this.clientService.update(this.clientEnEdition, dto).subscribe({
        next: () => {
          this.chargerClients();
          this.fermerFormulaire();
        },
        error: (error) => {
          console.error('Erreur lors de la modification du client :', error);
          this.messageErreur.set(error.error?.message || "Impossible d'enregistrer le client.");
        }
      });
    } else {
      this.clientService.save(dto).subscribe({
        next: () => {
          this.chargerClients();
          this.fermerFormulaire();
        },
        error: (error) => {
          console.error('Erreur lors de la création du client :', error);
          this.messageErreur.set(error.error?.message || "Impossible d'enregistrer le client.");
        }
      });
    }
  }

  demanderSuppression(id: number): void {
    this.idASupprimer = id;
  }

  annulerSuppression(): void {
    this.idASupprimer = null;
  }

  confirmerSuppression(): void {
    if (this.idASupprimer === null) return;
    this.clientService.deleteById(this.idASupprimer).subscribe({
      next: () => {
        this.idASupprimer = null;
        this.chargerClients();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du client :', error);
        this.idASupprimer = null;
      }
    });
  }
}
