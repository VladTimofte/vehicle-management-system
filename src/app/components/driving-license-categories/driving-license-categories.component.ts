import { Component, Output, Input, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-driving-license-categories',
  templateUrl: './driving-license-categories.component.html',
  styleUrls: ['./driving-license-categories.component.scss'],
  imports: [CommonModule]
})
export class DrivingLicenseCategoriesComponent {
  @Input() drivingLicenseCategories: string[] = [];
  @Output() onCategoryClicked = new EventEmitter<string>();


  drivingCategoryClicked(value: string) {
    this.onCategoryClicked.emit(value)
  }

  isDrivingCategorySelected(category: string): boolean {
    return this.drivingLicenseCategories?.some((el: string) => el === category) || false;
  }

}
