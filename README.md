# 🛍️ Boutique - Frontend Angular

Interface d'administration complète pour la gestion de boutique en ligne, développée avec Angular 21 et connectée à l'API Spring Boot.

## 🚀 Fonctionnalités

- **Authentification JWT** avec Login/Register et gestion de session
- **Dashboard** avec statistiques en temps réel (chiffre d'affaires, commandes, clients)
- **Gestion des produits** — CRUD complet avec upload d'image et sélection de catégorie
- **Gestion des catégories** — CRUD complet
- **Gestion des clients** — CRUD complet
- **Gestion des commandes** — création, changement de statut
- **Page détails commande** avec timeline de suivi visuelle
- **Routes protégées** avec AuthGuard
- **Interceptor JWT** — ajout automatique du token dans les requêtes

## 🛠️ Stack technique

- Angular 21 (Standalone Components)
- TypeScript
- RxJS
- Angular Signals
- HttpClient + Interceptors
- Angular Router (routes imbriquées + guards)

## 📦 Installation

\`\`\`bash
git clone https://github.com/khalilboutar1996khalil/boutique-frontend.git
cd boutique-frontend
npm install
ng serve
\`\`\`

L'application démarre sur `http://localhost:4200`

⚠️ Le backend Spring Boot doit être lancé sur `http://localhost:8080`

## 🔐 Comptes de test

| Username | Password | Rôle |
|----------|----------|------|
| admin    | 123456   | ADMIN |
| vendeur  | 123456   | VENDEUR |
| client   | 123456   | CLIENT |

## 📄 Architecture

\`\`\`
src/app/
├── models/         # Interfaces TypeScript
├── services/       # Services HTTP (Auth, Produit, Client...)
├── pages/          # Components des pages
├── layout/         # Layout commun (sidebar + topbar)
├── guards/         # AuthGuard
└── interceptors/   # JwtInterceptor
\`\`\`
