export interface Produit {
  id: number;
  nom: string;
  prix: number;
  stock: number;
  categorieNom: string;
  imageUrl?: string;
}
