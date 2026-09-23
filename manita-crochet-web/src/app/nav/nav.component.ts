import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav style="display:flex;gap:1rem;align-items:center;padding:1rem;background:#f4e4ec">
      <strong>🧶 Manita Crochet</strong>
      <a routerLink="/lanas">Lanas</a>
      <a *ngIf="usuario" routerLink="/pedidos">Pedidos</a>
      <a *ngIf="auth.isAdmin()" routerLink="/lanas/agregar">Agregar lana</a>
      <span style="flex:1"></span>
      <span *ngIf="usuario">{{ usuario }}</span>
      <button *ngIf="!usuario" (click)="login()">Iniciar sesión</button>
      <button *ngIf="usuario" (click)="logout()">Cerrar sesión</button>
    </nav>
  `
})
export class NavComponent {
  constructor(private msal: MsalService, public auth: AuthService) {}

  get usuario(): string | null {
    const acc = this.msal.instance.getActiveAccount() ?? this.msal.instance.getAllAccounts()[0];
    return acc ? (acc.name ?? acc.username) : null;
  }

  login(): void {
    this.msal.loginRedirect({ scopes: [environment.azure.apiScope] });
  }

  logout(): void {
    this.msal.logoutRedirect();
  }
}
