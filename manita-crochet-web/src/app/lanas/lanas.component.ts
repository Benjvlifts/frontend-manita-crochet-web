import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lana, LanaService } from './lana.service';

@Component({
  selector: 'app-lanas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Catálogo de Lanas</h2>
    <p *ngIf="error" style="color:crimson">{{ error }}</p>
    <table border="1" cellpadding="6" *ngIf="lanas.length">
      <thead>
        <tr><th>ID</th><th>Nombre</th><th>Color</th><th>Precio</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let l of lanas">
          <td>{{ l.id }}</td>
          <td>{{ l.nombre }}</td>
          <td>{{ l.color }}</td>
          <td>{{ l.precio | currency:'CLP':'symbol-narrow':'1.0-0' }}</td>
        </tr>
      </tbody>
    </table>
  `
})
export class LanasComponent implements OnInit {
  lanas: Lana[] = [];
  error = '';

  constructor(private service: LanaService) {}

  ngOnInit(): void {
    this.service.listar().subscribe({
      next: data => (this.lanas = data),
      error: err => {
        if (err.status === 401) {
          this.error = 'Tu sesión expiró o no es válida. Vuelve a iniciar sesión.';
        } else if (err.status === 403) {
          this.error = 'No tienes permisos para ver este recurso.';
        } else {
          this.error = `Error ${err.status}: no se pudo cargar el catálogo`;
        }
      }
    });
  }
}