// google-maps-loader.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private static promise: Promise<void>;

  public load(apiKey: string): Promise<void> {
    if (!GoogleMapsLoaderService.promise) {
      GoogleMapsLoaderService.promise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = (error) => reject(error);
        document.head.appendChild(script);
      });
    }
    return GoogleMapsLoaderService.promise;
  }
}
