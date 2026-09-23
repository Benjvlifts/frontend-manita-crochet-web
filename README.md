# Pedidos360 — Frontend

Frontend en **Angular 17 (standalone components)** del sistema **Pedidos360**, con autenticación
mediante **MSAL** (`@azure/msal-browser` + `@azure/msal-angular`) contra **Microsoft Entra ID**
(tenant normal — `login.microsoftonline.com`).

```
frontend/manita-crochet-web/
└── src/app/
    ├── auth/          AuthService (lectura de roles/scopes del token) + adminGuard
    ├── lanas/         Catálogo de lanas + alta de lana (solo Admin)
    ├── pedidos/       Pedidos del cliente + cambio de estado (solo Admin)
    ├── nav/           Barra de navegación (login/logout + links condicionales por rol)
    └── auth-config.ts Configuración de MSAL (instancia, guard, interceptor)
```

## Rutas

| Ruta | Componente | Acceso |
|---|---|---|
| `/lanas` | Catálogo de lanas | cualquier usuario autenticado (`MsalGuard`) |
| `/lanas/agregar` | Formulario para agregar lana | solo `Admin` (`MsalGuard` + `adminGuard`) |
| `/pedidos` | Mis pedidos / gestión de estado | cualquier usuario autenticado (`MsalGuard`) |

## Configurar antes de ejecutar

Editar `src/environments/environment.ts` con los valores reales del App Registration:

```ts
export const environment = {
  production: false,
  apiGatewayUrl: 'https://xxxx.execute-api.us-east-1.amazonaws.com/prod', // AWS API Gateway
  azure: {
    tenantId: '...',        // Directory (tenant) ID
    clientId: '...',        // Application (client) ID de la SPA
    redirectUri: 'http://localhost:4200',
    apiScope: 'api://<clientId>/access_as_user' // scope expuesto en "Exponer una API"
  }
};
```

`apiGatewayUrl` es **una sola URL** (el API Gateway/API Manager de AWS) que enruta tanto a
`/api/lanas` como a `/api/pedidos` hacia el microservicio correspondiente.

## Cómo ejecutar

```bash
npm install
ng serve
```

Abrir `http://localhost:4200`. El botón "Iniciar sesión" dispara `loginRedirect` hacia Entra ID;
al volver, `MsalInterceptor` adjunta automáticamente `Authorization: Bearer <token>` en cada llamada
a las rutas registradas en `protectedResourceMap` (`auth-config.ts`).

## Verificado

- `ng build --configuration development` y `ng build --configuration production` compilan sin errores
  (`strictTemplates` activado en `tsconfig.json`).
- Los roles (`Admin`/`User`) se leen del claim `roles` del ID Token (`AuthService.roles`), y
  determinan qué botones/rutas se muestran (`*ngIf="auth.isAdmin()"`) — la autorización real,
  sin embargo, siempre la aplica el backend.

## Configuración necesaria en Azure Entra ID

Requiere haber completado el registro de la aplicación (SPA) en el mismo tenant y App Registration
que usa el backend: **Redirect URI** tipo SPA apuntando a `http://localhost:4200` (y a la URL de
producción cuando corresponda), y el usuario de prueba con su **App Role** (`Admin` o `User`) asignado.
