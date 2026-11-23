import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { inicializarMsal } from './app/auth-config';

// MSAL debe terminar de procesar el retorno de Microsoft (#code=...&state=...) ANTES de que
// Angular arranque el router y el MsalGuard. Si ambos lo procesan a la vez, se pisan el estado
// temporal y MSAL falla con "state_not_found" (pantalla en blanco tras iniciar sesión).
inicializarMsal()
  .catch(err => console.error('Error al inicializar MSAL', err))
  .finally(() => {
    bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
  });
