import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { APP_CONFIG } from "@src/app/config/config";

@Injectable({
  providedIn: 'root',
})
export class DistanceService {
  private apiKey = APP_CONFIG.OPEN_ROUTE_SERVICE.API_KEY;
  private apiUrl = APP_CONFIG.OPEN_ROUTE_SERVICE.API_URL;

  constructor(private http: HttpClient) {}

  calculateDistance(start: [number, number], end: [number, number]): Observable<any> {
    const body = {
      coordinates: [start, end],
    };
    const headers = { 'Authorization': this.apiKey, 'Content-Type': 'application/json' };
    return this.http.post<any>(this.apiUrl, body, { headers });
  }
}
