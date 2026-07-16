export interface Commande {
  id: number;
  dateCommande: string;
  statut: string;
  montantTotal: number;
  clientNom: string;
}

export interface HistoriqueStatut {
  statut: string;
  dateChangement: string;
}
