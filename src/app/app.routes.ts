import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';
import { Layout } from './layout/layout/layout';
import { Categories } from './pages/categories/categories';
import { Produits } from './pages/produits/produits';
import { Clients } from './pages/clients/clients';
import { Commandes } from './pages/commandes/commandes';
import { CommandeDetails } from './pages/commande-details/commande-details';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
       { path: 'produits', component: Produits},
      { path: 'categories', component: Categories },
      { path: 'clients', component: Clients },
      {path: 'commandes', component: Commandes},
      { path: 'commandes/:id', component: CommandeDetails },

    ]
  },
  { path: '**', redirectTo: '/login' }
];
