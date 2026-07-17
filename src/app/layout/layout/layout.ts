import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {

  constructor(private authService: AuthService, private router: Router) { }

  get username(): string | null {
    return this.authService.getUsername();
  }

  get role(): string | null {
    return this.authService.getRole();
  }

  deconnecter() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
