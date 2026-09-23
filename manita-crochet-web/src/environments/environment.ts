export const environment = {
  production: false,
  // Una sola AWS API Gateway (API Manager) enruta a ambos microservicios:
  // {apiGatewayUrl}/api/lanas   -> lanas-service
  // {apiGatewayUrl}/api/pedidos -> pedidos-service
  apiGatewayUrl: 'YOUR_AWS_API_GATEWAY_URL', // ej: https://abc123.execute-api.us-east-1.amazonaws.com/prod
  azure: {
    tenantId: 'YOUR_AZURE_TENANT_ID',
    clientId: 'YOUR_AZURE_CLIENT_ID',
    redirectUri: 'http://localhost:4200',
    // Scope expuesto en "Expose an API" del App Registration
    apiScope: 'api://YOUR_AZURE_CLIENT_ID/access_as_user'
  }
};
