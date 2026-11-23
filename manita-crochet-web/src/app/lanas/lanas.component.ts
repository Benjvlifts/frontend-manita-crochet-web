import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Lana, LanaService } from './lana.service';
import { AuthService } from '../auth/auth.service';

interface ColorVisual {
  hex: string;
  tint: string;
}

const PALETA: Array<{ palabras: string[]; visual: ColorVisual }> = [
  { palabras: ['lila', 'lavanda', 'morado', 'violeta', 'púrpura', 'purpura'], visual: { hex: '#8b7bb8', tint: '#f2edf9' } },
  { palabras: ['rosado', 'rosa', 'fucsia', 'magenta', 'coral'], visual: { hex: '#d9658a', tint: '#fdf0f4' } },
  { palabras: ['celeste', 'cielo', 'aqua', 'turquesa'], visual: { hex: '#65a9c7', tint: '#eaf6fa' } },
  { palabras: ['azul', 'marino', 'índigo', 'indigo'], visual: { hex: '#4f7bb5', tint: '#edf2fa' } },
  { palabras: ['verde', 'menta', 'oliva', 'esmeralda'], visual: { hex: '#4fae8a', tint: '#e8f7f1' } },
  { palabras: ['amarillo', 'mostaza', 'dorado', 'crema', 'vainilla'], visual: { hex: '#e0a43b', tint: '#fdf6e7' } },
  { palabras: ['naranjo', 'naranja', 'durazno', 'terracota'], visual: { hex: '#de7c4f', tint: '#fdf1eb' } },
  { palabras: ['rojo', 'burdeo', 'vino', 'carmesí', 'carmesi'], visual: { hex: '#c84d62', tint: '#fcecef' } },
  { palabras: ['café', 'cafe', 'marrón', 'marron', 'chocolate', 'beige', 'arena'], visual: { hex: '#a17c63', tint: '#f5efe9' } },
  { palabras: ['gris', 'plata', 'plomo'], visual: { hex: '#85828c', tint: '#f2f1f4' } },
  { palabras: ['negro', 'carbón', 'carbon'], visual: { hex: '#433b40', tint: '#eeecee' } },
  { palabras: ['blanco', 'marfil', 'perla'], visual: { hex: '#c9b7bf', tint: '#faf7f8' } }
];

const FALLBACKS: ColorVisual[] = [
  { hex: '#d9658a', tint: '#fdf0f4' },
  { hex: '#8b7bb8', tint: '#f2edf9' },
  { hex: '#65a9c7', tint: '#eaf6fa' },
  { hex: '#4fae8a', tint: '#e8f7f1' },
  { hex: '#e0a43b', tint: '#fdf6e7' }
];

@Component({
  selector: 'app-lanas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="view-enter">
      <div class="intro-banner">
        <div>
          <strong>Un mundo de color, tejido con cariño.</strong>
          <p>Explora el catálogo de Manita Crochet y descubre la lana perfecta para tu próximo proyecto.</p>
        </div>
        <span class="intro-art" aria-hidden="true">🧶</span>
      </div>

      <div class="page-head">
        <div>
          <span class="eyebrow">✦ Nuestra colección</span>
          <h1>Catálogo de lanas</h1>
          <p>{{ lanasFiltradas.length }} {{ lanasFiltradas.length === 1 ? 'lana disponible' : 'lanas disponibles' }}</p>
        </div>
        <a *ngIf="auth.isAdmin()" class="btn btn-primary" routerLink="/lanas/agregar">
          + Agregar nueva lana
        </a>
      </div>

      <div *ngIf="error" class="alert-error">{{ error }}</div>

      <div class="toolbar">
        <div class="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <label class="sr-only" for="catalog-search">Buscar por nombre o color</label>
          <input
            id="catalog-search"
            class="input"
            [(ngModel)]="busqueda"
            placeholder="Buscar por nombre o color...">
        </div>

        <label class="sr-only" for="catalog-sort">Ordenar por</label>
        <select id="catalog-sort" class="select" [(ngModel)]="orden">
          <option value="nombre">Nombre A–Z</option>
          <option value="asc">Precio menor a mayor</option>
          <option value="desc">Precio mayor a menor</option>
        </select>

        <button type="button" class="btn btn-secondary" (click)="limpiarFiltros()">
          Limpiar
        </button>
      </div>

      <div class="chips" *ngIf="coloresDisponibles.length > 1" aria-label="Filtrar por color">
        <button
          type="button"
          class="chip"
          *ngFor="let color of coloresDisponibles"
          [class.active]="colorSeleccionado === color"
          (click)="colorSeleccionado = color">
          {{ color }}
        </button>
      </div>

      <div class="product-grid" *ngIf="!cargando && lanasFiltradas.length; else sinResultados">
        <article class="product card" *ngFor="let l of lanasFiltradas">
          <div class="product-art" [style.--tint]="visual(l).tint">
            <svg class="yarn-svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
              <circle cx="60" cy="61" r="43" [attr.fill]="visual(l).hex"/>
              <path d="M28 40c18 5 46 25 65 52M20 60c21-5 55 5 74 22M34 28c25 14 53 29 63 52M45 20c-15 27-16 57-6 79M66 20C49 42 47 78 58 104M82 27C70 50 70 82 78 98M91 37c-3 17-3 36 2 48"
                stroke="white" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
              <path d="M83 95c14 1 20 9 25 15" [attr.stroke]="visual(l).hex" stroke-width="5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="product-body">
            <div class="product-top">
              <h3>{{ l.nombre }}</h3>
              <span class="badge">ID {{ l.id }}</span>
            </div>
            <div class="product-meta">
              <span class="dot" [style.--dot]="visual(l).hex"></span>
              {{ l.color }}
            </div>
            <div class="product-bottom">
              <span class="price">{{ l.precio | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
              <a class="btn btn-ghost btn-sm" routerLink="/pedidos" [queryParams]="{ lanaId: l.id }">
                Pedir →
              </a>
            </div>
          </div>
        </article>
      </div>

      <ng-template #sinResultados>
        <div class="empty card" *ngIf="!cargando">
          <h3>No hay lanas que coincidan</h3>
          <p *ngIf="lanas.length">Prueba con otro nombre o color.</p>
          <p *ngIf="!lanas.length && !error">Todavía no hay lanas registradas en el catálogo.</p>
          <button *ngIf="lanas.length" type="button" class="btn btn-secondary" (click)="limpiarFiltros()">
            Limpiar filtros
          </button>
        </div>
        <div class="empty card" *ngIf="cargando">
          <p>Cargando catálogo de lanas...</p>
        </div>
      </ng-template>
    </section>
  `
})
export class LanasComponent implements OnInit {
  lanas: Lana[] = [];
  busqueda = '';
  orden: 'nombre' | 'asc' | 'desc' = 'nombre';
  colorSeleccionado = 'Todos';
  cargando = true;
  error = '';

  constructor(private service: LanaService, public auth: AuthService) {}

  ngOnInit(): void {
    this.service.listar().subscribe({
      next: data => {
        this.lanas = data;
        this.cargando = false;
      },
      error: err => {
        this.cargando = false;
        this.error = `Error ${err.status}: no se pudo cargar el catálogo.`;
      }
    });
  }

  get coloresDisponibles(): string[] {
    const unicos = Array.from(new Set(this.lanas.map(l => l.color).filter(Boolean)));
    return ['Todos', ...unicos];
  }

  get lanasFiltradas(): Lana[] {
    const q = this.busqueda.trim().toLocaleLowerCase('es-CL');
    return this.lanas
      .filter(l => {
        const coincideColor = this.colorSeleccionado === 'Todos' || l.color === this.colorSeleccionado;
        const coincideTexto = `${l.nombre} ${l.color}`.toLocaleLowerCase('es-CL').includes(q);
        return coincideColor && coincideTexto;
      })
      .sort((a, b) => {
        if (this.orden === 'asc') return a.precio - b.precio;
        if (this.orden === 'desc') return b.precio - a.precio;
        return a.nombre.localeCompare(b.nombre, 'es-CL');
      });
  }

  visual(lana: Lana): ColorVisual {
    const normalizado = (lana.color ?? '').trim().toLocaleLowerCase('es-CL');
    if (normalizado) {
      const encontrado = PALETA.find(entry => entry.palabras.some(p => normalizado.includes(p)));
      if (encontrado) return encontrado.visual;
    }
    return FALLBACKS[Math.abs(lana.id) % FALLBACKS.length];
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.orden = 'nombre';
    this.colorSeleccionado = 'Todos';
  }
}