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

  afficherFormulaire = false;
  modeEdition = false;
  categorieEnCours: { id: number | null; nom: string; description: string } = { id: null, nom: '', description: '' };

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

  ouvrirAjout(): void {
    this.modeEdition = false;
    this.categorieEnCours = { id: null, nom: '', description: '' };
    this.messageErreur.set('');
    this.afficherFormulaire = true;
  }

  ouvrirEdition(categorie: Categorie): void {
    this.modeEdition = true;
    this.categorieEnCours = { id: categorie.id, nom: categorie.nom, description: categorie.description };
    this.messageErreur.set('');
    this.afficherFormulaire = true;
  }

  fermerFormulaire(): void {
    this.afficherFormulaire = false;
  }

  enregistrer(): void {
    const payload = { nom: this.categorieEnCours.nom, description: this.categorieEnCours.description };

    if (this.modeEdition && this.categorieEnCours.id !== null) {
      this.categorieService.update(this.categorieEnCours.id, payload).subscribe({
        next: () => {
          this.afficherFormulaire = false;
          this.chargerCategories();
        },
        error: (error) => {
          console.error('Erreur lors de la modification de la catégorie :', error);
          this.messageErreur.set("Impossible d'enregistrer la catégorie.");
        }
      });
    } else {
      this.categorieService.save(payload).subscribe({
        next: () => {
          this.afficherFormulaire = false;
          this.chargerCategories();
        },
        error: (error) => {
          console.error('Erreur lors de la création de la catégorie :', error);
          this.messageErreur.set("Impossible d'enregistrer la catégorie.");
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
