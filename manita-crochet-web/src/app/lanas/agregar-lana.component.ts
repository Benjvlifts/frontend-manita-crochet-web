import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LanaService } from './lana.service';

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

@Component({
  selector: 'app-agregar-lana',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="view-enter">
      <div class="page-head">
        <div>
          <span class="eyebrow">✦ Administración · Solo Admin</span>
          <h1>Agregar nueva lana</h1>
          <p>Registra un nuevo producto en <code>lanas-service</code> y publícalo en el catálogo.</p>
        </div>
        <a class="btn btn-secondary" routerLink="/lanas">← Volver al catálogo</a>
      </div>

      <div *ngIf="error" class="alert-error">{{ error }}</div>

      <div class="info-grid">
        <article class="section-card card">
          <h2>Datos de la lana</h2>
          <form (ngSubmit)="guardar()" style="display:flex;flex-direction:column;gap:16px;margin-top:16px">
            <div class="field">
              <label for="nombre">Nombre</label>
              <input id="nombre" class="input" name="nombre" [(ngModel)]="nombre" placeholder="Ej: Lana Merino" required>
            </div>
            <div class="field">
              <label for="color">Color</label>
              <input id="color" class="input" name="color" [(ngModel)]="color" placeholder="Ej: Lila, Rosado, Celeste" required>
            </div>
            <div class="field">
              <label for="precio">Precio (CLP)</label>
              <input id="precio" class="input" name="precio" type="number" min="1" [(ngModel)]="precio" placeholder="Ej: 4990" required>
            </div>
            <div style="display:flex;gap:10px;margin-top:6px">
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="guardando || !nombre.trim() || !color.trim() || precio === null || precio <= 0">
                {{ guardando ? 'Guardando...' : 'Guardar lana' }}
              </button>
              <a class="btn btn-secondary" routerLink="/lanas">Cancelar</a>
            </div>
          </form>
        </article>

        <article class="product card">
          <div class="product-art" [style.--tint]="previewVisual.tint">
            <svg class="yarn-svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
              <circle cx="60" cy="61" r="43" [attr.fill]="previewVisual.hex"/>
              <path d="M28 40c18 5 46 25 65 52M20 60c21-5 55 5 74 22M34 28c25 14 53 29 63 52M45 20c-15 27-16 57-6 79M66 20C49 42 47 78 58 104M82 27C70 50 70 82 78 98M91 37c-3 17-3 36 2 48"
                stroke="white" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
              <path d="M83 95c14 1 20 9 25 15" [attr.stroke]="previewVisual.hex" stroke-width="5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="product-body">
            <div class="product-top">
              <h3>{{ nombre.trim() || 'Vista previa de lana' }}</h3>
              <span class="badge badge-info">Nueva</span>
            </div>
            <div class="product-meta">
              <span class="dot" [style.--dot]="previewVisual.hex"></span>
              {{ color.trim() || 'Color sin definir' }}
            </div>
            <div class="product-bottom">
              <span class="price">{{ (precio || 0) | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
              <span class="badge">Vista previa</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  `
})
export class AgregarLanaComponent {
  nombre = '';
  color = '';
  precio: number | null = null;
  error = '';
  guardando = false;

  constructor(private service: LanaService, private router: Router) {}

  get previewVisual(): ColorVisual {
    const normalizado = this.color.trim().toLocaleLowerCase('es-CL');
    if (normalizado) {
      const encontrado = PALETA.find(entry => entry.palabras.some(p => normalizado.includes(p)));
      if (encontrado) return encontrado.visual;
    }
    return { hex: '#d9658a', tint: '#fdf0f4' };
  }

  guardar(): void {
    if (!this.nombre.trim() || !this.color.trim() || this.precio === null) {
      return;
    }
    this.guardando = true;
    this.error = '';
    this.service.crear({
      nombre: this.nombre.trim(),
      color: this.color.trim(),
      precio: this.precio
    }).subscribe({
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