import { Component, OnInit } from '@angular/core';
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
      <a *ngIf="auth.isAdmin()" routerLink="/lanas/nueva">+ Agregar lana</a>
      <a *ngIf="auth.userName" routerLink="/pedidos">Pedidos</a>
      <span style="flex:1"></span>
      <span *ngIf="auth.userName">
        {{ auth.userName }}
        <em *ngIf="auth.roles.length"> · rol: {{ auth.roles.join(', ') }}</em>
        <em *ngIf="scope"> · scope: {{ scope }}</em>
      </span>
      <button *ngIf="!auth.userName" (click)="login()">Iniciar sesión</button>
      <button *ngIf="auth.userName" (click)="logout()">Cerrar sesión</button>
    </nav>
  `
})
export class NavComponent implements OnInit {
  scope: string | null = null;

  constructor(private msal: MsalService, public auth: AuthService) {}

  ngOnInit(): void {
    // Lee el scope (claim "scp") desde el Access Token, además de los roles ya disponibles
    // sincrónicamente en auth.roles (claims del ID Token).
    this.auth.getAccessTokenClaims().then(claims => {
      this.scope = (claims?.['scp'] as string) ?? null;
    });
  }

  login(): void {
    this.msal.loginRedirect({ scopes: [environment.azure.apiScope] });
  }

  logout(): void {
    this.msal.logoutRedirect();
  }
}
