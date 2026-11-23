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
// Una sola instancia compartida: main.ts la inicializa antes de arrancar Angular y
// MSAL_INSTANCE entrega esa misma instancia al resto de la app.
const msalInstance: IPublicClientApplication = new PublicClientApplication({
  auth: {
    clientId: environment.azure.clientId,
    authority: `https://login.microsoftonline.com/${environment.azure.tenantId}`,
    redirectUri: environment.azure.redirectUri,
    postLogoutRedirectUri: environment.azure.redirectUri,
    // El retorno de Microsoft se procesa en la propia redirectUri (raíz). Sin esto, MSAL navega a
    // la página donde empezó el login y compite con el router de Angular por el mismo #code=...
    navigateToLoginRequestUrl: false
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

export function MSALInstanceFactory(): IPublicClientApplication {
  return msalInstance;
}

/**
 * Inicializa MSAL, procesa el retorno de Microsoft (si lo hay) y deja fijada la cuenta activa.
 * Se llama desde main.ts antes de bootstrapApplication.
 */
export async function inicializarMsal(): Promise<void> {
  await msalInstance.initialize();
  const resultado = await msalInstance.handleRedirectPromise();
  if (resultado?.account) {
    msalInstance.setActiveAccount(resultado.account);
  } else if (!msalInstance.getActiveAccount()) {
    const cuentas = msalInstance.getAllAccounts();
    if (cuentas.length > 0) {
      msalInstance.setActiveAccount(cuentas[0]);
    }
  }
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
  // EP5: analítica de ventas (lanas-service, alimentada por Kafka). Mismo scope y mismo patrón con "/*".
  protectedResourceMap.set(`${environment.apiGatewayUrl}/api/analitica/*`, [environment.azure.apiScope]);

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
