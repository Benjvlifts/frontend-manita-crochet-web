import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { LanasComponent } from './lanas/lanas.component';
import { AgregarLanaComponent } from './lanas/agregar-lana.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { AnaliticaComponent } from './analitica/analitica.component';
import { adminGuard } from './auth/admin.guard';

export const routes: Routes = [
  { path: 'lanas', component: LanasComponent, canActivate: [MsalGuard] },
  // Solo Admin puede agregar lanas al catálogo (coincide con la regla del backend).
  { path: 'lanas/agregar', component: AgregarLanaComponent, canActivate: [MsalGuard, adminGuard] },
  { path: 'pedidos', component: PedidosComponent, canActivate: [MsalGuard] },
  // EP5: ventas por lana calculadas en tiempo real desde Kafka (cualquier usuario autenticado).
  { path: 'analitica', component: AnaliticaComponent, canActivate: [MsalGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'lanas' }
];