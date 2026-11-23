
Frontend en **Angular 17 (standalone components)** del sistema **Pedidos360**, con autenticación
mediante **MSAL** (`@azure/msal-browser` + `@azure/msal-angular`) contra **Microsoft Entra ID**
(tenant normal — `login.microsoftonline.com`).

```
frontend/manita-crochet-web/
└── src/app/
    ├── auth/          AuthService (lectura de roles/scopes del token) + adminGuard
    ├── lanas/         Catálogo de lanas + alta de lana (solo Admin)
    ├── pedidos/       Pedidos del cliente + cambio de estado (solo Admin)
    ├── analitica/     Ventas por lana en tiempo real (EP5, alimentada por Kafka)
    ├── nav/           Barra de navegación (login/logout + links condicionales por rol)
    └── auth-config.ts Configuración de MSAL (instancia, guard, interceptor) e inicialización previa al arranque
```

## Rutas

| Ruta | Componente | Acceso |
|---|---|---|
| `/lanas` | Catálogo de lanas | cualquier usuario autenticado (`MsalGuard`) |
| `/lanas/agregar` | Formulario para agregar lana | solo `Admin` (`MsalGuard` + `adminGuard`) |
| `/pedidos` | Mis pedidos / gestión de estado | cualquier usuario autenticado (`MsalGuard`) |
| `/analitica` | Unidades vendidas por lana, calculadas desde Kafka (se refresca cada 5 s) | cualquier usuario autenticado (`MsalGuard`) |

## Configuración de Azure (ya cargada)

`src/environments/environment.ts` ya tiene el tenant y la app real de **ManitasCrochet**:

```ts
export const environment = {
  production: false,
  apiGatewayUrl: 'https://mn8nf3v00l.execute-api.us-east-1.amazonaws.com', // API Gateway de AWS, sin barra final
  azure: {
    tenantId: '522bdf93-3bcf-46ce-83e7-ec4538db5496',
    clientId: '3e1ac9d8-06dd-4ed2-a236-5d8397ad4944',
    redirectUri: 'http://localhost:4200',
    apiScope: 'api://3e1ac9d8-06dd-4ed2-a236-5d8397ad4944/access_as_user'
  }
};
```

`apiGatewayUrl` apunta al API Gateway de AWS (creado en la EP2). Las rutas `/api/lanas`, `/api/pedidos`,
`/api/analitica/*` y `/api/admin/kafka/*` se enrutan a los microservicios desplegados en la EC2.
Para trabajar solo en local (sin AWS) se puede usar el proxy (ver Opción A).

## Cómo ejecutar

### Opción A — Local, sin API Gateway todavía (recomendado para probar EP1)

Con `lanas-service` (puerto 8080) y `pedidos-service` (puerto 8081) corriendo, este repo trae
`proxy.conf.json` para que Angular reenvíe `/api/lanas` y `/api/pedidos` directo a cada microservicio:

```bash
npm install
ng serve --proxy-config proxy.conf.json
```

Con esta opción, `apiGatewayUrl` puede quedar vacío (`''`) en `environment.ts` para que las llamadas
usen rutas relativas (`/api/lanas`, `/api/pedidos`) que el proxy intercepta.

### Opción B — Contra el API Gateway de AWS (EP2)

```bash
npm install
ng serve
```

Requiere haber completado `apiGatewayUrl` en `environment.ts` con la URL real del API Gateway.

En ambos casos: abrir `http://localhost:4200`. El botón "Iniciar sesión" dispara `loginRedirect`
hacia Entra ID; al volver, `MsalInterceptor` adjunta automáticamente `Authorization: Bearer <token>`
en cada llamada a las rutas registradas en `protectedResourceMap` (`auth-config.ts`).

## Flujo de login (MSAL)

`main.ts` llama a `inicializarMsal()` (en `auth-config.ts`) **antes** de arrancar Angular: inicializa MSAL,
procesa el retorno de Microsoft (`#code=...&state=...`) y fija la cuenta activa. Recién después se
arranca la app, el router y el `MsalGuard`. Así el retorno se procesa una sola vez; si el router y el
guard lo procesan a la vez, MSAL puede fallar con `state_not_found` y la pantalla queda en blanco.
`navigateToLoginRequestUrl` está en `false`: tras el login se vuelve a `/`, que redirige a `/lanas`.

### Si tras iniciar sesión la página queda en blanco

1. Abre `http://localhost:4200` (debe ser `localhost`, no `127.0.0.1`, para coincidir con la Redirect URI).
2. F12 → *Application* → *Clear site data* para `localhost:4200` y recarga.
3. Revisa la pestaña *Console*: un `ClientAuthError` o un código `AADSTS...` indica la causa.

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
