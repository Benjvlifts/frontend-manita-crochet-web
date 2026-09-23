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
      authority: `https://login.microsoftonline.com/${environment.azure.tenantId}`,
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
  // Un solo scope (expuesto en "Exponer una API") protege ambos microservicios detrás del
  // mismo API Gateway. IMPORTANTE: sin "/*" al final, MsalInterceptor solo matchea la URL
  // EXACTA (msal-angular v2+). Sin el wildcard, PATCH /api/pedidos/{id}/estado no matcheaba
  // la entrada "/api/pedidos" y el interceptor nunca adjuntaba el Bearer token -> 401 siempre
  // al marcar un pedido como enviado, incluso siendo Admin.
  protectedResourceMap.set(`${environment.apiGatewayUrl}/api/lanas`, [environment.azure.apiScope]);
  protectedResourceMap.set(`${environment.apiGatewayUrl}/api/lanas/*`, [environment.azure.apiScope]);
  protectedResourceMap.set(`${environment.apiGatewayUrl}/api/pedidos`, [environment.azure.apiScope]);
  protectedResourceMap.set(`${environment.apiGatewayUrl}/api/pedidos/*`, [environment.azure.apiScope]);

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
