import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DistanceService {
  private apiKey = '5b3ce3597851110001cf6248295f210fe0614560a10c6efe63c0d005';
  private apiUrl = 'https://api.openrouteservice.org/v2/directions/driving-car';

  constructor(private http: HttpClient) {}

  calculateDistance(start: [number, number], end: [number, number]): Observable<any> {
    const body = {
      coordinates: [start, end],
    };
    const headers = { 'Authorization': this.apiKey, 'Content-Type': 'application/json' };
    return this.http.post<any>(this.apiUrl, body, { headers });
  }
}
