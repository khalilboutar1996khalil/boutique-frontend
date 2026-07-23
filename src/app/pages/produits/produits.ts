import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProduitService } from '../../services/produit';
import { Produit } from '../../models/produit';
import { FormsModule } from '@angular/forms';
import { CategorieService } from '../../services/categorie';
import { Categorie } from '../../models/categorie';

@Component({
  selector: 'app-produits',
  imports: [CommonModule, FormsModule],
  templateUrl: './produits.html',
  styleUrl: './produits.css',
})
export class Produits implements OnInit {
  nom: string = '';
  prix: number = 0;
  stock: number = 0;
  categorieId: number = 0;
  imageUrl: string = '';

  produits = signal<Produit[]>([]);
  categories = signal<Categorie[]>([]);
  produitEnEdition: number | null = null;
  afficherFormulaire = signal(false);
  messageErreur = signal('');
  idASupprimer: number | null = null;

  // Filter & Search Signals
  searchQuery = signal<string>('');
  selectedCategoryFilter = signal<number>(0);
  stockFilter = signal<string>('TOUS'); // 'TOUS' | 'EN_STOCK' | 'RUPTURE'
  vueMode = signal<'grille' | 'liste'>('grille');

  // Computed property for filtered product list
  filteredProduits = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const catId = this.selectedCategoryFilter();
    const stockF = this.stockFilter();

    return this.produits().filter(p => {
      const matchSearch = !query || p.nom.toLowerCase().includes(query) || (p.categorieNom && p.categorieNom.toLowerCase().includes(query));
      const matchCat = catId === 0 || p.categorieId === catId;
      const matchStock = stockF === 'TOUS' || (stockF === 'EN_STOCK' ? p.stock > 0 : p.stock === 0);

      return matchSearch && matchCat && matchStock;
    });
  });

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService
  ) { }

  ngOnInit(): void {
    this.chargerProduits();
    this.chargerCategories();
  }

  chargerProduits() {
    this.produitService.findAll().subscribe({
      next: (produits) => {
        this.produits.set(produits);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des produits :', error);
      }
    });
  }

  demanderSuppression(id: number): void {
    this.idASupprimer = id;
  }

  annulerSuppression(): void {
    this.idASupprimer = null;
  }

  confirmerSuppression(): void {
    if (this.idASupprimer === null) return;
    this.produitService.deleteById(this.idASupprimer).subscribe({
      next: () => {
        this.idASupprimer = null;
        this.chargerProduits();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du produit :', error);
        this.idASupprimer = null;
      }
    });
  }

  ouvrirFormulaireCreation() {
    this.produitEnEdition = null;
    this.nom = '';
    this.prix = 0;
    this.stock = 0;
    this.categorieId = this.categories().length > 0 ? this.categories()[0].id : 0;
    this.imageUrl = '';
    this.afficherFormulaire.set(true);
    this.messageErreur.set('');
  }

  ouvrirFormulaireEdition(produit: Produit) {
    this.produitEnEdition = produit.id;
    this.nom = produit.nom;
    this.prix = produit.prix;
    this.stock = produit.stock;
    this.categorieId = produit.categorieId;
    this.imageUrl = produit.imageUrl || '';
    this.messageErreur.set('');
    this.afficherFormulaire.set(true);
  }

  enregistrer() {
    const dto = {
      nom: this.nom,
      prix: this.prix,
      stock: this.stock,
      categorieId: Number(this.categorieId),
      imageUrl: this.imageUrl
    };
    this.messageErreur.set('');

    if (this.produitEnEdition !== null) {
      this.produitService.update(this.produitEnEdition, dto).subscribe({
        next: () => {
          this.chargerProduits();
          this.fermerFormulaire();
        },
        error: (error) => {
          this.messageErreur.set(error.error?.message || 'Une erreur est survenue.');
        }
      });
    } else {
      this.produitService.save(dto).subscribe({
        next: () => {
          this.chargerProduits();
          this.fermerFormulaire();
        },
        error: (error) => {
          this.messageErreur.set(error.error?.message || 'Une erreur est survenue.');
        }
      });
    }
  }

  fermerFormulaire() {
    this.afficherFormulaire.set(false);
  }

  chargerCategories() {
    this.categorieService.findAll().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (error) => console.error('Erreur :', error)
    });
  }

  setVueMode(mode: 'grille' | 'liste'): void {
    this.vueMode.set(mode);
  }
}
