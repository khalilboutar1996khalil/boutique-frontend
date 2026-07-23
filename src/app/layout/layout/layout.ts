import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {

  isDarkMode = signal<boolean>(false);
  sidebarCollapsed = signal<boolean>(false);

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.setTheme(true);
    } else {
      this.setTheme(false);
    }
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkMode());
  }

  private setTheme(dark: boolean): void {
    this.isDarkMode.set(dark);
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

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
