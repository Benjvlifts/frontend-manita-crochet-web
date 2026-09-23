import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { LanasComponent } from './lanas/lanas.component';

export const routes: Routes = [
  { path: 'lanas', component: LanasComponent, canActivate: [MsalGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'lanas' }
];