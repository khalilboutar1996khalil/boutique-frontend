import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CommandeService } from '../../services/commande';
import { Commande, HistoriqueStatut } from '../../models/commande';

@Component({
  selector: 'app-commande-details',
  imports: [CommonModule],
  templateUrl: './commande-details.html',
  styleUrl: './commande-details.css',
})
export class CommandeDetails implements OnInit {
  private ordreStatuts = ['EN_ATTENTE', 'CONFIRMEE', 'LIVREE'];

  commande = signal<Commande | null>(null);
  historique = signal<HistoriqueStatut[]>([]);
  commandeId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commandeService: CommandeService
  ) { }

  ngOnInit(): void {
    this.commandeId = Number(this.route.snapshot.paramMap.get('id'));
    this.chargerCommande();
    this.chargerHistorique(); // ← bien présent ?
  }
  chargerHistorique() {
    this.commandeService.getHistorique(this.commandeId).subscribe({
      next: (historique) => {
        this.historique.set(historique);
      },
      error: (error) => console.error('Erreur historique :', error)
    });
  }


  retour() {
    this.router.navigate(['/commandes']);
  }
  chargerCommande() {
    this.commandeService.findAll().subscribe({
      next: (commandes) => {
        const trouvee = commandes.find(c => c.id === this.commandeId);
        this.commande.set(trouvee || null);
      },
      error: (error) => console.error('Erreur :', error)
    });
  }

  estComplete(statut: string): boolean {
    const statutActuel = this.commande()?.statut;
    if (!statutActuel) return false;
    const indexActuel = this.ordreStatuts.indexOf(statutActuel);
    const indexStatut = this.ordreStatuts.indexOf(statut);
    return indexStatut <= indexActuel;
  }

  estActuel(statut: string): boolean {
    return this.commande()?.statut === statut;
  }
}
