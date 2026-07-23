import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  username: string = '';
  email: string = '';
  password: string = '';
  role: string = 'CLIENT';

  messageErreur = signal('');
  messageSucces = signal('');
  isLoading = signal(false);
  masquerMotDePasse = signal(true);

  constructor(private authService: AuthService, private route: Router) { }

  toggleMotDePasse() {
    this.masquerMotDePasse.set(!this.masquerMotDePasse());
  }

  inscrire() {
    this.isLoading.set(true);
    this.messageErreur.set('');
    this.messageSucces.set('');

    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password,
      role: this.role
    }).subscribe({
      next: () => {
        this.messageSucces.set("Inscription réussie ! Redirection vers la page de connexion...");
        this.isLoading.set(false);
        setTimeout(() => this.route.navigate(['/login']), 1800);
      },
      error: (error) => {
        try {
          const erreurParsee = JSON.parse(error.error);
          this.messageErreur.set(erreurParsee.message);
        } catch {
          this.messageErreur.set(typeof error.error === 'string' ? error.error : "Une erreur est survenue lors de l'inscription.");
        }
        this.isLoading.set(false);
      }
    });
  }
}
