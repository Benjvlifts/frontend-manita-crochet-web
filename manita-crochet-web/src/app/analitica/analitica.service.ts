import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Respuesta de GET /api/analitica/ventas (lanas-service). Las claves del mapa llegan como texto (id de la lana).
export interface VentasSnapshot {
  unidadesPorLana: Record<string, number>;
  pedidosProcesados: number;
  unidadesTotales: number;
}

@Injectable({ providedIn: 'root' })
export class AnaliticaService {
  constructor(private http: HttpClient) {}

  // Resultado que lanas-service calcula en tiempo real consumiendo el tópico Kafka pedidos.eventos.
  ventas(): Observable<VentasSnapshot> {
    return this.http.get<VentasSnapshot>(`${environment.apiGatewayUrl}/api/analitica/ventas`);
  }
}
