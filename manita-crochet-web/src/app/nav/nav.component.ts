import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="topbar">
      <nav class="nav-inner" aria-label="Navegación principal">
        <a class="brand" routerLink="/lanas" (click)="cerrarMenu()">
          <span class="brand-icon" aria-hidden="true">🧶</span>
          <span>
            <strong>Manita Crochet</strong>
            <small>Pedidos360</small>
          </span>
        </a>

        <button
          type="button"
          class="menu-toggle"
          aria-label="Abrir menú"
          [attr.aria-expanded]="menuAbierto"
          (click)="menuAbierto = !menuAbierto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
          </svg>
        </button>

        <div class="nav-links" [class.open]="menuAbierto">
          <a class="nav-link" routerLink="/lanas" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="cerrarMenu()">
            Catálogo
          </a>
          <a *ngIf="usuario" class="nav-link" routerLink="/pedidos" routerLinkActive="active" (click)="cerrarMenu()">
            Pedidos
          </a>
          <a *ngIf="usuario" class="nav-link" routerLink="/analitica" routerLinkActive="active" (click)="cerrarMenu()">
            Analítica
          </a>
          <a *ngIf="auth.isAdmin()" class="nav-link" routerLink="/lanas/agregar" routerLinkActive="active" (click)="cerrarMenu()">
            + Agregar lana
          </a>
        </div>

        <div class="nav-user">
          <span *ngIf="usuario" class="user-chip" [title]="usuario">
            <span class="avatar">{{ iniciales }}</span>
            <span>{{ usuario }}</span>
            <span *ngIf="auth.isAdmin()" class="badge badge-info">Admin</span>
          </span>
          <button *ngIf="!usuario" type="button" class="btn btn-primary btn-sm" (click)="login()">
            Iniciar sesión
          </button>
          <button *ngIf="usuario" type="button" class="btn btn-secondary btn-sm" (click)="logout()">
            Cerrar sesión
          </button>
        </div>
      </nav>
    </header>
  `
})
export class NavComponent {
  menuAbierto = false;

  constructor(private msal: MsalService, public auth: AuthService) {}

  get usuario(): string | null {
    const acc = this.msal.instance.getActiveAccount() ?? this.msal.instance.getAllAccounts()[0];
    return acc ? (acc.name ?? acc.username) : null;
  }

  get iniciales(): string {
    const nombre = this.usuario ?? 'MC';
    const partes = nombre.trim().split(/\s+/);
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombre.slice(0, 2).toUpperCase();
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  login(): void {
    this.msal.loginRedirect({ scopes: [environment.azure.apiScope] });
  }

  logout(): void {
    this.msal.logoutRedirect();
  }
}