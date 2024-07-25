import { Component } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { GoogleMapsLoaderService } from '@src/app/services/google-maps-loader.service';

@Component({
  standalone: true,
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss'],
  imports: [GoogleMap]
})
export class TrackComponent {

  center: google.maps.LatLngLiteral = { lat: 51.678418, lng: 7.809007 };
  zoom = 8;
  loaded = false;

  constructor(private googleMapsLoader: GoogleMapsLoaderService) {}

  ngOnInit(): void {
    this.googleMapsLoader.load('AIzaSyBLrYyuB_3HDdubuxYeQAfbrs6yyyN9e6Q').then(() => {
      this.loaded = true;
    }).catch(error => {
      console.error('Error loading Google Maps', error);
    });
  }

}
