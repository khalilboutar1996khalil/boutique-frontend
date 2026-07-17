export interface Produit {
  id: number;
  nom: string;
  prix: number;
  stock: number;
  categorieNom: string;
  categorieId: number;
  imageUrl?: string;
}
