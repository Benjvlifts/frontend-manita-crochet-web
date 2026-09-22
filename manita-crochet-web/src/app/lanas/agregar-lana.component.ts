import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LanaService } from './lana.service';

@Component({
  selector: 'app-agregar-lana',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Agregar nueva lana</h2>
    <p *ngIf="error" style="color:crimson">{{ error }}</p>
    <form (ngSubmit)="guardar()" style="display:flex;flex-direction:column;gap:.5rem;max-width:320px">
      <label>
        Nombre
        <input name="nombre" [(ngModel)]="nombre" required>
      </label>
      <label>
        Color
        <input name="color" [(ngModel)]="color" required>
      </label>
      <label>
        Precio
        <input name="precio" type="number" [(ngModel)]="precio" required>
      </label>
      <button type="submit" [disabled]="guardando || !nombre || !color || precio === null">
        {{ guardando ? 'Guardando...' : 'Guardar' }}
      </button>
    </form>
  `
})
export class AgregarLanaComponent {
  nombre = '';
  color = '';
  precio: number | null = null;
  error = '';
  guardando = false;

  constructor(private service: LanaService, private router: Router) {}

  guardar(): void {
    if (!this.nombre || !this.color || this.precio === null) {
      return;
    }
    this.guardando = true;
    this.error = '';
    this.service.crear({ nombre: this.nombre, color: this.color, precio: this.precio }).subscribe({
      next: () => this.router.navigate(['/lanas']),
      error: err => {
        this.guardando = false;
        if (err.status === 401) {
          this.error = 'Tu sesión expiró o no es válida. Vuelve a iniciar sesión.';
        } else if (err.status === 403) {
          this.error = 'Tu rol no tiene permiso para agregar lanas (se requiere rol Admin).';
        } else {
          this.error = `Error ${err.status}: no se pudo guardar la lana.`;
        }
      }
    });
  }
}
