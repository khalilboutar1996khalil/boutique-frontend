import { Component, OnInit, signal } from '@angular/core';
import { DashboardService } from '../../services/dashboard';
import { DashboardStats } from '../../models/DashboardStats';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  stats = signal<DashboardStats | null>(null);

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
    next: (stats) => {
  console.log('Statistiques du dashboard :', stats); // ← vois-tu CECI dans F12 Console ?
  this.stats.set(stats);
},
      error: (error) => {
        console.error('Erreur lors de la récupération des statistiques du dashboard :', error);
      }
    });
  }
}
