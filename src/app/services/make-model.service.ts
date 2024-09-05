// src/app/services/car.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { capitalizeFirstLetter } from '../utils/strings';
import { APP_CONFIG } from "@src/app/config/config";

interface Make {
  Model_Name: any;
  MakeName: string;
}

interface ApiResponse {
  Results: Make[];
}

@Injectable({
  providedIn: 'root'
})
export class MakeModelService {

  constructor(private http: HttpClient) {}

  getAllMakes(): Observable<string[]> {
    const apiUrlMakes = APP_CONFIG.NHTSA.MAKES_API;
    return this.http.get<ApiResponse>(apiUrlMakes).pipe(
      map(response => response.Results.map(result => capitalizeFirstLetter(result.MakeName)))
    );
  }

  getModels(make: string): Observable<string[]> {
    const constructedModelAPI = APP_CONFIG.NHTSA.MODELS_API + make.toLocaleLowerCase() + '?format=json'
    return this.http.get<ApiResponse>(constructedModelAPI).pipe(
      map(response => response.Results.map(result => result.Model_Name))
    );
  }

}
