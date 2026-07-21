import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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

export class Login implements OnInit {

  username: string = ''
  password: string = ''
  messageErreur: string = ''

  constructor(private route: Router, private authService: AuthService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.queryParamMap.get('sessionExpiree')) {
      this.messageErreur = 'Votre session a expiré ou votre compte est introuvable. Veuillez vous reconnecter.';
    }
  }

  seConnecter() {
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (response) => {
        this.authService.sauvegarderToken(response);
        this.route.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Erreur lors de la connexion :', error);
        this.messageErreur = "Nom d'utilisateur ou mot de passe incorrect.";
      }
    });
  }
}
