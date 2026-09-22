import {
  BrowserCacheLocation,
  InteractionType,
  IPublicClientApplication,
  LogLevel,
  PublicClientApplication
} from '@azure/msal-browser';
import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration
} from '@azure/msal-angular';
import { environment } from '../environments/environment';

// Authorization Code + PKCE: MSAL Browser v3 lo aplica por defecto (SPA redirect URI).
export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.azure.clientId,
      authority: environment.azure.authority,
      // Entra External ID: fuerza a MSAL a confiar en el dominio ciamlogin.com de este tenant.
      // Evita el error "issuer_validation_failed" que puede aparecer en versiones recientes de
      // msal-browser cuando el issuer devuelto usa el GUID del tenant en vez del subdominio.
      knownAuthorities: [`${environment.azure.tenantSubdomain}.ciamlogin.com`],
      redirectUri: environment.azure.redirectUri,
      postLogoutRedirectUri: environment.azure.redirectUri
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage
    },
    system: {
      loggerOptions: {
        logLevel: LogLevel.Warning,
        piiLoggingEnabled: false
      }
    }
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(`${environment.apiGatewayUrl}/api/lanas`, [environment.azure.apiScope]);
  protectedResourceMap.set(`${environment.pedidosApiUrl}/api/pedidos`, [environment.azure.apiScope]);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [environment.azure.apiScope]
    }
  };
}
