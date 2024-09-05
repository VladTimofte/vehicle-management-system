import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APP_CONFIG } from "@src/app/config/config";

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = APP_CONFIG.OPEN_STREET_MAP.LOCATION_API_URL;

  constructor(private http: HttpClient) {}

  searchLocations(query: string): Observable<any[]> {
    const url = `${this.apiUrl}?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
    return this.http.get<any[]>(url).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error fetching locations:', error);
        return throwError(error);
      })
    );
  }
}
