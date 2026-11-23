import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, catchError, of, switchMap, timer } from 'rxjs';
import { AnaliticaService, VentasSnapshot } from './analitica.service';
import { Lana, LanaService } from '../lanas/lana.service';

interface FilaVentas {
  lanaId: string;
  nombre: string;
  unidades: number;
  porcentaje: number;
  barColor: string;
}

const COLORES_BARRA = ['#d9658a', '#8b7bb8', '#65a9c7', '#4fae8a', '#e0a43b'];

@Component({
  selector: 'app-analitica',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="view-enter">
      <div class="page-head">
        <div>
          <span class="eyebrow">✦ Panorama de ventas · Kafka</span>
          <h1>Analítica de ventas</h1>
          <p>
            Calculada en tiempo real desde <code>pedidos.eventos</code> en <code>lanas-service</code>.
            Se actualiza automáticamente cada 5 segundos.
          </p>
        </div>
        <span class="badge badge-success">En vivo · 5s</span>
      </div>

      <div *ngIf="error" class="alert-error">{{ error }}</div>

      <div class="stats" *ngIf="datos">
        <article class="stat card">
          <div class="stat-label">Pedidos procesados</div>
          <div class="stat-value">{{ datos.pedidosProcesados }}</div>
          <div class="stat-note">Eventos consumidos desde Kafka</div>
        </article>
        <article class="stat card">
          <div class="stat-label">Unidades vendidas</div>
          <div class="stat-value">{{ datos.unidadesTotales }}</div>
          <div class="stat-note">En {{ filas.length }} {{ filas.length === 1 ? 'tipo de lana' : 'tipos de lana' }}</div>
        </article>
        <article class="stat card">
          <div class="stat-label">Lana más vendida</div>
          <div class="stat-value" style="font-size:23px">{{ topLana ? topLana.nombre : '—' }}</div>
          <div class="stat-note">{{ topLana ? (topLana.unidades + ' unidades') : 'Sin ventas aún' }}</div>
        </article>
      </div>

      <article class="section-card card">
        <div class="section-top">
          <h2>Unidades por lana</h2>
          <span class="badge">Distribución</span>
        </div>

        <ng-container *ngIf="filas.length; else sinDatos">
          <div class="bar-row" *ngFor="let f of filas">
            <span>{{ f.nombre }}</span>
            <div class="bar-track">
              <div class="bar-fill" [style.width.%]="f.porcentaje" [style.--bar]="f.barColor"></div>
            </div>
            <span>{{ f.unidades }}</span>
          </div>
        </ng-container>

        <ng-template #sinDatos>
          <div class="empty">
            <p *ngIf="datos">Aún no hay pedidos procesados. Crea un pedido en la sección Pedidos.</p>
            <p *ngIf="!datos && !error">Cargando métricas de ventas...</p>
          </div>
        </ng-template>
      </article>

      <article class="section-card card">
        <h2>¿Cómo funciona?</h2>
        <p class="note">Los pedidos se publican como eventos y alimentan la analítica sin acoplamiento directo.</p>
        <div class="flow">
          <span class="flow-node">📦 pedidos-service</span>
          <span class="flow-arrow">→</span>
          <span class="flow-node">⚡ Kafka · pedidos.eventos</span>
          <span class="flow-arrow">→</span>
          <span class="flow-node">🧶 lanas-service</span>
          <span class="flow-arrow">→</span>
          <span class="flow-node">📊 Analítica</span>
        </div>
      </article>
    </section>
  `
})
export class AnaliticaComponent implements OnInit, OnDestroy {
  datos: VentasSnapshot | null = null;
  filas: FilaVentas[] = [];
  topLana: FilaVentas | null = null;
  error = '';

  private lanasMap = new Map<string, Lana>();
  private suscripcion?: Subscription;

  constructor(private analitica: AnaliticaService, private lanas: LanaService) {}

  ngOnInit(): void {
    this.lanas.listar().pipe(catchError(() => of([] as Lana[]))).subscribe((lista: Lana[]) => {
      lista.forEach((l: Lana) => this.lanasMap.set(String(l.id), l));
      this.refrescarFilas();
    });

    this.suscripcion = timer(0, 5000)
      .pipe(switchMap(() => this.analitica.ventas().pipe(
        catchError((err: { status?: number }) => {
          if (err.status === 401) {
            this.error = 'Tu sesión expiró o no es válida. Vuelve a iniciar sesión.';
          } else {
            this.error = 'No se pudo cargar la analítica. Verifica tu sesión o que lanas-service esté activo.';
          }
          return of(null);
        })
      )))
      .subscribe((datos: VentasSnapshot | null) => {
        if (datos) {
          this.error = '';
          this.datos = datos;
          this.refrescarFilas();
        }
      });
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  private refrescarFilas(): void {
    const entradas = Object.entries(this.datos?.unidadesPorLana ?? {});
    const max = Math.max(...entradas.map(([, u]) => u), 1);

    this.filas = entradas
      .map(([lanaId, unidades], idx) => {
        const lana = this.lanasMap.get(lanaId);
        return {
          lanaId,
          nombre: lana ? `${lana.nombre} (${lana.color})` : `Lana #${lanaId}`,
          unidades,
          porcentaje: Math.round((unidades / max) * 100),
          barColor: COLORES_BARRA[idx % COLORES_BARRA.length]
        };
      })
      .sort((a, b) => b.unidades - a.unidades);

    this.topLana = this.filas.length ? this.filas[0] : null;
  }
}