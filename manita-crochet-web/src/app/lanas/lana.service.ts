import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Lana {
  id: number;
  nombre: string;
  color: string;
  precio: number;
}

@Injectable({ providedIn: 'root' })
export class LanaService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Lana[]> {
    return this.http.get<Lana[]>(`${environment.apiGatewayUrl}/api/lanas`);
  }

  // El backend exige rol Admin para este endpoint (ver SecurityConfig de lanas-service).
  crear(lana: Omit<Lana, 'id'>): Observable<Lana> {
    return this.http.post<Lana>(`${environment.apiGatewayUrl}/api/lanas`, lana);
  }
}
