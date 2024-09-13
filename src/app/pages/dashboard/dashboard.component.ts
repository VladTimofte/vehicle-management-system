import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule]
})
export class DashboardComponent {

  technologies = [
    { name: 'Angular Framework', image: 'assets/tech/angular.png', url: 'https://angular.dev' },
    { name: '', image: 'assets/tech/ag-grid.png', url: 'https://www.ag-grid.com' },
    { name: '', image: 'assets/tech/firebase.png', url: 'https://firebase.google.com/' },
    { name: '', image: 'assets/tech/localstorage.png', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage' },
    { name: 'Angular Material', image: 'assets/tech/angular-material.png', url: 'https://material.angular.io' },
    { name: '', image: 'assets/tech/cloudinary.png', url: 'https://cloudinary.com' },
    { name: '', image: 'assets/tech/emailjs.png', url: 'https://www.emailjs.com' },
    { name: 'Car Makes Icons', image: 'assets/tech/car-makes-icons.png', url: 'https://github.com/dangnelson/car-makes-icons' },
    { name: '', image: 'assets/tech/js-pdf.png', url: 'https://www.npmjs.com/package/jspdf' },
    { name: '', image: 'assets/tech/luxon.png',  url: 'https://moment.github.io/luxon/'},
    { name: 'Romanian Personal Identity Code Validator', image: 'assets/tech/romanian-id-validator.png', url: 'https://github.com/alceanicu/romanian-personal-identity-code-validator' },
    { name: '', image: 'assets/tech/xlsx.png', url: 'https://www.npmjs.com/package/xlsx' },
    { name: '', image: 'assets/tech/uuid.png', url: 'https://www.npmjs.com/package/uuid' }
  ];

}
