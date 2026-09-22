// Reemplaza estos 2 valores por los del App Registration que crees en Entra External ID (ver guía).
const tenantSubdomain = 'YOUR_TENANT_SUBDOMAIN'; // el subdominio del tenant, NO el Tenant ID/GUID
const clientId = 'YOUR_AZURE_CLIENT_ID';

export const environment = {
  production: false,
  // EP1: probamos todo en local contra los backends en localhost.
  // EP2: estos valores se reemplazan por la URL real del API Manager/API Gateway en AWS.
  apiGatewayUrl: 'http://localhost:8080', // lanas-service
  pedidosApiUrl: 'http://localhost:8081', // pedidos-service
  azure: {
    tenantSubdomain,
    clientId,
    // Microsoft Entra External ID (CIAM): la autoridad usa el SUBDOMINIO del tenant
    // (https://<subdominio>.ciamlogin.com/), NO login.microsoftonline.com.
    authority: `https://${tenantSubdomain}.ciamlogin.com/`,
    redirectUri: 'http://localhost:4200',
    // Scope expuesto en "Expose an API" del App Registration (mismo clientId).
    apiScope: `api://${clientId}/access_as_user`
  }
};
