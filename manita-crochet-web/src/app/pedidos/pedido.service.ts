import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Pedido {
  id: number;
  cliente: string;
  lanaId: number;
  cantidad: number;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${environment.apiGatewayUrl}/api/pedidos`);
  }

  // Cualquier usuario autenticado puede crear su propio pedido (ver SecurityConfig del backend).
  crear(pedido: Omit<Pedido, 'id' | 'estado'>): Observable<Pedido> {
    return this.http.post<Pedido>(`${environment.apiGatewayUrl}/api/pedidos`, pedido);
  }

  // El backend exige rol Admin para este endpoint.
  actualizarEstado(id: number, estado: string): Observable<Pedido> {
    return this.http.patch<Pedido>(`${environment.apiGatewayUrl}/api/pedidos/${id}/estado`, { estado });
  }
}