import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { LanasComponent } from './lanas/lanas.component';
import { AgregarLanaComponent } from './lanas/agregar-lana.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { adminGuard } from './auth/admin.guard';

export const routes: Routes = [
  { path: 'lanas', component: LanasComponent, canActivate: [MsalGuard] },
  { path: 'lanas/nueva', component: AgregarLanaComponent, canActivate: [MsalGuard, adminGuard] },
  { path: 'pedidos', component: PedidosComponent, canActivate: [MsalGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'lanas' }
];
