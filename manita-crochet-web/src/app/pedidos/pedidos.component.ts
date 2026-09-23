import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pedido, PedidoService } from './pedido.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Mis Pedidos</h2>
    <p *ngIf="error" style="color:crimson">{{ error }}</p>

    <form (ngSubmit)="crear()" style="display:flex;gap:.5rem;align-items:end;flex-wrap:wrap;margin-bottom:1rem">
      <label>Cliente
        <input name="cliente" [(ngModel)]="cliente" required>
      </label>
      <label>Lana (ID)
        <input name="lanaId" type="number" [(ngModel)]="lanaId" required>
      </label>
      <label>Cantidad
        <input name="cantidad" type="number" [(ngModel)]="cantidad" required>
      </label>
      <button type="submit" [disabled]="creando || !cliente || lanaId === null || cantidad === null">
        {{ creando ? 'Creando...' : 'Crear pedido' }}
      </button>
    </form>

    <table border="1" cellpadding="6" *ngIf="pedidos.length">
      <thead>
        <tr>
          <th>ID</th><th>Cliente</th><th>Lana</th><th>Cantidad</th><th>Estado</th>
          <th *ngIf="auth.isAdmin()"></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of pedidos">
          <td>{{ p.id }}</td>
          <td>{{ p.cliente }}</td>
          <td>{{ p.lanaId }}</td>
          <td>{{ p.cantidad }}</td>
          <td>{{ p.estado }}</td>
          <td *ngIf="auth.isAdmin()">
            <button (click)="marcarEnviado(p)" [disabled]="p.estado === 'ENVIADO'">Marcar enviado</button>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class PedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  cliente = '';
  lanaId: number | null = null;
  cantidad: number | null = null;
  creando = false;
  error = '';

  constructor(private service: PedidoService, public auth: AuthService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.listar().subscribe({
      next: data => (this.pedidos = data),
      error: err => this.setError(err)
    });
  }

  crear(): void {
    if (!this.cliente || this.lanaId === null || this.cantidad === null) {
      return;
    }
    this.creando = true;
    this.error = '';
    this.service.crear({ cliente: this.cliente, lanaId: this.lanaId, cantidad: this.cantidad }).subscribe({
      next: () => {
        this.creando = false;
        this.cliente = '';
        this.lanaId = null;
        this.cantidad = null;
        this.cargar();
      },
      error: err => {
        this.creando = false;
        this.setError(err);
      }
    });
  }

  marcarEnviado(p: Pedido): void {
    this.service.actualizarEstado(p.id, 'ENVIADO').subscribe({
      next: () => this.cargar(),
      error: err => this.setError(err)
    });
  }

  private setError(err: { status?: number }): void {
    if (err.status === 401) {
      this.error = 'Tu sesión expiró o no es válida. Vuelve a iniciar sesión.';
    } else if (err.status === 403) {
      this.error = 'No tienes permisos para esta acción.';
    } else {
      this.error = `Error ${err.status}: no se pudo completar la operación.`;
    }
  }
}