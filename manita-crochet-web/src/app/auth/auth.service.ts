import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';

interface DecodedTokenClaims {
  roles?: string[];
  scp?: string;
  [key: string]: unknown;
}

/**
 * Centraliza la lectura de roles y scopes desde los claims del token, tal como pide la pauta
 * ("se obtienen los tokens ... y se leen roles y scopes desde los claims del token").
 *
 * - Los roles (App Roles de Azure AD) vienen en el claim "roles" y MSAL ya los deja disponibles
 *   sin llamadas extra en `account.idTokenClaims`.
 * - Los scopes (claim "scp") solo viajan en el Access Token, así que para leerlos pedimos el
 *   token silenciosamente y decodificamos su payload.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private msal: MsalService) {}

  private get activeAccount() {
    return this.msal.instance.getActiveAccount() ?? this.msal.instance.getAllAccounts()[0] ?? null;
  }

  get isLoggedIn(): boolean {
    return this.activeAccount !== null;
  }

  get userName(): string | null {
    const acc = this.activeAccount;
    return acc ? (acc.name ?? acc.username) : null;
  }

  /** Roles leídos directamente desde los claims del ID Token. */
  get roles(): string[] {
    const claims = this.activeAccount?.idTokenClaims as DecodedTokenClaims | undefined;
    const roles = claims?.roles;
    return Array.isArray(roles) ? roles : [];
  }

  isAdmin(): boolean {
    return this.roles.includes('Admin');
  }

  /** Pide el Access Token vigente y decodifica sus claims (incluye el scope "scp"). */
  async getAccessTokenClaims(): Promise<DecodedTokenClaims | null> {
    const account = this.activeAccount;
    if (!account) {
      return null;
    }
    try {
      const result = await this.msal.instance.acquireTokenSilent({
        scopes: [environment.azure.apiScope],
        account
      });
      return this.decodeJwt(result.accessToken);
    } catch {
      return null;
    }
  }

  private decodeJwt(token: string): DecodedTokenClaims | null {
    try {
      const payload = token.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(normalized)
          .split('')
          .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('')
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}