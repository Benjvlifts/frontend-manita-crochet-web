import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent],
  template: `
    <app-nav></app-nav>
    <main style="padding:1rem">
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {
  // El procesamiento del redirect de MSAL vive en main.ts (inicializarMsal), antes del arranque.
}
