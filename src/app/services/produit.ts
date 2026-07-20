import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produit } from '../models/produit';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  //private apiUrl = 'https://boutique-springboot.onrender.com/api/produits';
  private apiUrl = 'http://localhost:8080/api/produits';
  constructor(private http: HttpClient) { }

  findAll(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.apiUrl);
  }

  findById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }

  save(produit: any): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, produit);
  }

  update(id: number, produit: any): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/${id}`, produit);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
