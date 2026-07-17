import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class Login {

  username: string = ''
  password: string = ''
  messageErreur: string = ''

  constructor(private route: Router, private authService: AuthService) { }

  seConnecter() {
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (response) => {
        this.authService.sauvegarderToken(response);
        this.route.navigate(['/']);
      },
      error: (error) => {
        console.error('Erreur lors de la connexion :', error);
        this.messageErreur = "Nom d'utilisateur ou mot de passe incorrect.";
      }
    });
  }
}
