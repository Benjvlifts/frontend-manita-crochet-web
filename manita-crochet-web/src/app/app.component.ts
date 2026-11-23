import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent],
  template: `
    <app-nav></app-nav>
    <main class="app-main">
      <router-outlet></router-outlet>
    </main>
    <footer class="footer">
      <strong>Pedidos360 · DSY1107 Desarrollo Cloud Native I — Duoc UC</strong>
      <div class="techs">
        <span>Angular</span>
        <span>Spring Boot</span>
        <span>Kafka</span>
        <span>RabbitMQ</span>
        <span>AWS</span>
        <span>Entra ID</span>
      </div>
    </footer>
  `
})
export class AppComponent {}