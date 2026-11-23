import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, catchError, of, switchMap, timer } from 'rxjs';
import { AnaliticaService, VentasSnapshot } from './analitica.service';
import { Lana, LanaService } from '../lanas/lana.service';

interface FilaVentas {
  lanaId: string;
  nombre: string;
  unidades: number;
}

@Component({
  selector: 'app-analitica',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Analítica de ventas (Kafka)</h2>
    <p style="color:#555">
      Se calcula en tiempo real: <code>pedidos-service</code> publica cada pedido en el tópico
      <code>pedidos.eventos</code> y <code>lanas-service</code> lo consume. Se actualiza cada 5 segundos.
    </p>
    <p *ngIf="error" style="color:crimson">{{ error }}</p>

    <div *ngIf="datos" style="display:flex;gap:2rem;margin:1rem 0">
      <div><strong>{{ datos.pedidosProcesados }}</strong><br>pedidos procesados</div>
      <div><strong>{{ datos.unidadesTotales }}</strong><br>unidades vendidas</div>
    </div>

    <table border="1" cellpadding="6" *ngIf="filas.length; else sinDatos">
      <thead>
        <tr><th>Lana</th><th>Unidades vendidas</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let f of filas">
          <td>{{ f.nombre }} (ID {{ f.lanaId }})</td>
          <td>{{ f.unidades }}</td>
        </tr>
      </tbody>
    </table>
    <ng-template #sinDatos>
      <p *ngIf="datos">Aún no hay pedidos procesados. Crea un pedido en la sección Pedidos.</p>
    </ng-template>
  `
})
export class AnaliticaComponent implements OnInit, OnDestroy {
  datos: VentasSnapshot | null = null;
  filas: FilaVentas[] = [];
  error = '';

  private nombres = new Map<string, string>();
  private suscripcion?: Subscription;

  constructor(private analitica: AnaliticaService, private lanas: LanaService) {}

  ngOnInit(): void {
    // El catálogo se pide una sola vez para mostrar el nombre en vez del ID.
    this.lanas.listar().pipe(catchError(() => of([] as Lana[]))).subscribe(lista => {
      lista.forEach(l => this.nombres.set(String(l.id), l.nombre));
      this.refrescarFilas();
    });

    this.suscripcion = timer(0, 5000)
      .pipe(switchMap(() => this.analitica.ventas().pipe(
        catchError(() => {
          this.error = 'No se pudo cargar la analítica. Verifica tu sesión o que lanas-service esté activo.';
          return of(null);
        })
      )))
      .subscribe(datos => {
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
    this.filas = Object.entries(this.datos?.unidadesPorLana ?? {}).map(([lanaId, unidades]) => ({
      lanaId,
      nombre: this.nombres.get(lanaId) ?? `Lana ${lanaId}`,
      unidades
    }));
  }
}
