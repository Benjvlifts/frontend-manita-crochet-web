export const environment = {
  production: false,
  // Una sola AWS API Gateway (API Manager) enruta a ambos microservicios:
  // {apiGatewayUrl}/api/lanas   -> lanas-service
  // {apiGatewayUrl}/api/pedidos -> pedidos-service
  apiGatewayUrl: 'https://abc123xyz.execute-api.us-east-1.amazonaws.com', // sin barra final
  azure: {
    tenantId: '522bdf93-3bcf-46ce-83e7-ec4538db5496', // ManitasCrochet (manitascrochet.onmicrosoft.com)
    clientId: '3e1ac9d8-06dd-4ed2-a236-5d8397ad4944',
    redirectUri: 'http://localhost:4200',
    // Scope expuesto en "Exponer una API" del App Registration
    apiScope: 'api://3e1ac9d8-06dd-4ed2-a236-5d8397ad4944/access_as_user'
  }
};
