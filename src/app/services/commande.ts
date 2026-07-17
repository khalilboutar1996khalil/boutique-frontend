import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande, HistoriqueStatut } from '../models/commande';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {

  private apiUrl = 'https://boutique-springboot.onrender.com/api/commandes';

  constructor(private http: HttpClient) { }

  findAll(): Observable<Commande[]> {
    return this.http.get<Commande[]>(this.apiUrl);
  }

  passerCommande(clientId: number, produitId: number, quantite: number): Observable<Commande> {
    return this.http.post<Commande>(this.apiUrl, { clientId, produitId, quantite });
  }

  changerStatut(id: number, statut: string): Observable<Commande> {
    return this.http.put<Commande>(`${this.apiUrl}/${id}/statut?statut=${statut}`, {});
  }

  getHistorique(id: number): Observable<HistoriqueStatut[]> {
    return this.http.get<HistoriqueStatut[]>(`${this.apiUrl}/${id}/historique`);
  }
}
