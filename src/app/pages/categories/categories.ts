import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategorieService } from '../../services/categorie';
import { Categorie } from '../../models/categorie';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {

  categories = signal<Categorie[]>([]);
  chargement = signal<boolean>(true);

  nom: string = '';
  description: string = '';
  categorieEnEdition: number | null = null;
  afficherFormulaire = signal(false);
  messageErreur = signal('');
  idASupprimer: number | null = null;

  constructor(private categorieService: CategorieService) { }

  ngOnInit(): void {
    this.chargerCategories();
  }

  chargerCategories(): void {
    this.chargement.set(true);
    this.categorieService.findAll().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.chargement.set(false);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des catégories :', error);
        this.chargement.set(false);
      }
    });
  }

  ouvrirFormulaireCreation(): void {
    this.categorieEnEdition = null;
    this.nom = '';
    this.description = '';
    this.messageErreur.set('');
    this.afficherFormulaire.set(true);
  }

  ouvrirFormulaireEdition(categorie: Categorie): void {
    this.categorieEnEdition = categorie.id;
    this.nom = categorie.nom;
    this.description = categorie.description;
    this.messageErreur.set('');
    this.afficherFormulaire.set(true);
  }

  fermerFormulaire(): void {
    this.afficherFormulaire.set(false);
  }

  enregistrer(): void {
    const dto = { nom: this.nom, description: this.description };
    this.messageErreur.set('');

    if (this.categorieEnEdition !== null) {
      this.categorieService.update(this.categorieEnEdition, dto).subscribe({
        next: () => {
          this.chargerCategories();
          this.fermerFormulaire();
        },
        error: (error) => {
          console.error('Erreur lors de la modification de la catégorie :', error);
          this.messageErreur.set(error.error?.message || "Impossible d'enregistrer la catégorie.");
        }
      });
    } else {
      this.categorieService.save(dto).subscribe({
        next: () => {
          this.chargerCategories();
          this.fermerFormulaire();
        },
        error: (error) => {
          console.error('Erreur lors de la création de la catégorie :', error);
          this.messageErreur.set(error.error?.message || "Impossible d'enregistrer la catégorie.");
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
    if (this.idASupprimer === null) {
      return;
    }
    this.categorieService.deleteById(this.idASupprimer).subscribe({
      next: () => {
        this.idASupprimer = null;
        this.chargerCategories();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de la catégorie :', error);
        this.idASupprimer = null;
      }
    });
  }
}
