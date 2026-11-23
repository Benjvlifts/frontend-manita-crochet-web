import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Pedido, PedidoService } from './pedido.service';
import { Lana, LanaService } from '../lanas/lana.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="view-enter">
      <div class="page-head">
        <div>
          <span class="eyebrow">✦ Seguimiento</span>
          <h1>Pedidos</h1>
          <p>Crea nuevos pedidos y revisa su estado en tiempo real.</p>
        </div>
        <span class="badge badge-info">Conectado a pedidos-service</span>
      </div>

      <div *ngIf="error" class="alert-error">{{ error }}</div>

      <div class="stats">
        <article class="stat card">
          <div class="stat-label">Total de pedidos</div>
          <div class="stat-value">{{ pedidos.length }}</div>
          <div class="stat-note">Registrados en el sistema</div>
        </article>
        <article class="stat card">
          <div class="stat-label">Pendientes</div>
          <div class="stat-value">{{ totalPendientes }}</div>
          <div class="stat-note">Por gestionar</div>
        </article>
        <article class="stat card">
          <div class="stat-label">Enviados</div>
          <div class="stat-value">{{ totalEnviados }}</div>
          <div class="stat-note">Ya despachados</div>
        </article>
      </div>

      <article class="section-card card">
        <div class="section-top">
          <h2>Nuevo pedido</h2>
          <span class="badge">Publica evento en Kafka</span>
        </div>
        <form (ngSubmit)="crear()" class="form-grid">
          <div class="field">
            <label for="cliente">Cliente</label>
            <input id="cliente" class="input" name="cliente" [(ngModel)]="cliente" placeholder="Nombre del cliente" required>
          </div>

          <div class="field" *ngIf="lanas.length; else lanaManual">
            <label for="lanaSelect">Lana</label>
            <select id="lanaSelect" class="select" name="lanaId" [(ngModel)]="lanaId" required>
              <option [ngValue]="null" disabled>Selecciona una lana...</option>
              <option *ngFor="let l of lanas" [ngValue]="l.id">
                {{ l.nombre }} — {{ l.color }} (ID {{ l.id }})
              </option>
            </select>
          </div>

          <ng-template #lanaManual>
            <div class="field">
              <label for="lanaIdInput">Lana (ID)</label>
              <input id="lanaIdInput" class="input" name="lanaId" type="number" min="1" [(ngModel)]="lanaId" required>
            </div>
          </ng-template>

          <div class="field">
            <label for="cantidad">Cantidad</label>
            <input id="cantidad" class="input" name="cantidad" type="number" min="1" [(ngModel)]="cantidad" placeholder="Ej: 2" required>
          </div>

          <div>
            <button
              type="submit"
              class="btn btn-primary"
              style="width:100%;height:44px"
              [disabled]="creando || !cliente.trim() || lanaId === null || cantidad === null || cantidad <= 0">
              {{ creando ? 'Creando...' : 'Crear pedido' }}
            </button>
          </div>
        </form>
      </article>

      <article class="section-card card">
        <div class="section-top">
          <h2>Listado de pedidos</h2>
          <button type="button" class="btn btn-secondary btn-sm" (click)="cargar()">Actualizar</button>
        </div>

        <div class="tabs">
          <button type="button" class="tab" [class.active]="filtroEstado === 'TODOS'" (click)="filtroEstado = 'TODOS'">
            Todos ({{ pedidos.length }})
          </button>
          <button type="button" class="tab" [class.active]="filtroEstado === 'PENDIENTE'" (click)="filtroEstado = 'PENDIENTE'">
            Pendientes ({{ totalPendientes }})
          </button>
          <button type="button" class="tab" [class.active]="filtroEstado === 'ENVIADO'" (click)="filtroEstado = 'ENVIADO'">
            Enviados ({{ totalEnviados }})
          </button>
        </div>

        <div class="table-wrap" *ngIf="pedidosFiltrados.length; else sinPedidos">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Lana</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th *ngIf="auth.isAdmin()">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pedidosFiltrados">
                <td><strong>#{{ p.id }}</strong></td>
                <td>{{ p.cliente }}</td>
                <td>{{ nombreLana(p.lanaId) }}</td>
                <td>{{ p.cantidad }}</td>
                <td>
                  <span class="badge" [ngClass]="p.estado === 'ENVIADO' ? 'badge-success' : 'badge-warning'">
                    {{ p.estado }}
                  </span>
                </td>
                <td *ngIf="auth.isAdmin()">
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm"
                    (click)="marcarEnviado(p)"
                    [disabled]="p.estado === 'ENVIADO'">
                    {{ p.estado === 'ENVIADO' ? 'Despachado' : 'Marcar enviado' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #sinPedidos>
          <div class="empty">
            <p>No hay pedidos para mostrar en esta categoría.</p>
          </div>
        </ng-template>
      </article>
    </section>
  `
})
export class PedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  lanas: Lana[] = [];
  private nombresLana = new Map<number, string>();

  cliente = '';
  lanaId: number | null = null;
  cantidad: number | null = 1;
  filtroEstado: 'TODOS' | 'PENDIENTE' | 'ENVIADO' = 'TODOS';
  creando = false;
  error = '';

  constructor(
    private service: PedidoService,
    private lanaService: LanaService,
    private route: ActivatedRoute,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    const lanaParam = this.route.snapshot.queryParamMap.get('lanaId');
    if (lanaParam && !Number.isNaN(Number(lanaParam))) {
      this.lanaId = Number(lanaParam);
    }

    this.lanaService.listar().pipe(catchError(() => of([] as Lana[]))).subscribe(lista => {
      this.lanas = lista;
      lista.forEach(l => this.nombresLana.set(l.id, `${l.nombre} (${l.color})`));
    });

    this.cargar();
  }

  get totalPendientes(): number {
    return this.pedidos.filter(p => p.estado !== 'ENVIADO').length;
  }

  get totalEnviados(): number {
    return this.pedidos.filter(p => p.estado === 'ENVIADO').length;
  }

  get pedidosFiltrados(): Pedido[] {
    if (this.filtroEstado === 'TODOS') return this.pedidos;
    if (this.filtroEstado === 'ENVIADO') return this.pedidos.filter(p => p.estado === 'ENVIADO');
    return this.pedidos.filter(p => p.estado !== 'ENVIADO');
  }

  nombreLana(id: number): string {
    return this.nombresLana.get(id) ?? `Lana #${id}`;
  }

  cargar(): void {
    this.service.listar().subscribe({
      next: data => {
        this.pedidos = data;
        this.error = '';
      },
      error: err => this.setError(err)
    });
  }

  crear(): void {
    if (!this.cliente.trim() || this.lanaId === null || this.cantidad === null) {
      return;
    }
    this.creando = true;
    this.error = '';
    this.service.crear({
      cliente: this.cliente.trim(),
      lanaId: this.lanaId,
      cantidad: this.cantidad
    }).subscribe({
      next: () => {
        this.creando = false;
        this.cliente = '';
        this.lanaId = null;
        this.cantidad = 1;
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