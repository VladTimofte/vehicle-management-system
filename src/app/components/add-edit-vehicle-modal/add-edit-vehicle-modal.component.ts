import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { VehiclesService } from '@src/app/services/crud/vehicles.service';
import { FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { DateTime } from 'luxon';

import { Vehicle, FuelType } from 'src/app/models/vehicle.model';
import { isValidRomanianLicensePlate } from 'src/app/utils/strings';
import { MakeModelService } from 'src/app/services/make-model.service';

@Component({
  selector: 'app-add-edit-vehicle-modal',
  standalone: true,
  templateUrl: './add-edit-vehicle-modal.component.html',
  styleUrls: ['./add-edit-vehicle-modal.component.scss'],
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MatProgressSpinnerModule, MatIconModule, MatInputModule, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule]
})
export class AddEditVehicleModalComponent {
  @Input({ required: true }) vehicle!: Vehicle;
  @Input({ required: true }) isFleetUpdating!: boolean;
  @Output() isAddEditFleetConfirmed = new EventEmitter<boolean>();

  private fleetService = inject(VehiclesService)
  fuelTypes = Object.values(FuelType);
  modalForm: FormGroup;
  availableMakes: string[] = [];
  availableModels: string[] = [];

  apiMakes: any;
  loadingMakes: boolean = true;
  loadingModels: boolean = true;
  error: string | null = null;

  constructor(private fb: FormBuilder, private makeModelService: MakeModelService) {
    this.modalForm = this.fb.group({
      vinNumber: ['', [Validators.required, this.staticLengthValidator(17)]],
      make: ['', Validators.required],
      model: ['', Validators.required],
      manufactureYear: ['', [Validators.required, Validators.min(1960)]],
      plateNumber: ['', [Validators.required, this.licensePlateValidator]],
      engineHorsePower: ['', [Validators.required, Validators.min(10), Validators.max(1200)]],
      engineCapacityCC: ['', [Validators.required, Validators.min(50), Validators.max(6000)]],
      fuelType: ['', Validators.required],
      expirationDateITP: ['', Validators.required],
      expirationDateRCA: ['', Validators.required],
    });
    // Subscribe to value changes and transform to uppercase
    this.modalForm.get('plateNumber')?.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.modalForm.get('plateNumber')?.patchValue(value.toUpperCase(), { emitEvent: false });
      }
    });
    this.modalForm.valueChanges.subscribe(value => {
      if (typeof value.plateNumber === 'string') {
        this.modalForm.get('plateNumber')?.patchValue(value.plateNumber.toUpperCase(), { emitEvent: false });
      }
      this.keepFleetUpdated(value)
    });
  }

  ngOnInit(): void {
    this.modalForm.patchValue({
      vinNumber: this.vehicle.vinNumber,
      make: this.vehicle.make,
      model: this.vehicle.model,
      manufactureYear: this.vehicle.manufactureYear,
      plateNumber: this.vehicle.plateNumber,
      engineHorsePower: this.vehicle.engineHorsePower,
      engineCapacityCC: this.vehicle.engineCapacityCC,
      fuelType: this.vehicle.fuelType,
      expirationDateITP: new Date(this.vehicle.expirationDateITP),
      expirationDateRCA: new Date(this.vehicle.expirationDateRCA),
    });

    if(this.modalForm.get('make')?.value) {
      this.onMakeSelection(this.modalForm.get('make')?.value)
    }

      this.fetchMakes();
  }

  keepFleetUpdated(value: Vehicle) {
    this.vehicle = {
      ...this.vehicle,
      ...value,
      expirationDateITP: DateTime.fromJSDate(this.modalForm.value.expirationDateITP).toMillis(),
      expirationDateRCA: DateTime.fromJSDate(this.modalForm.value.expirationDateRCA).toMillis()
    }
  }

  fetchMakes(): void {
    this.makeModelService.getAllMakes().subscribe({
      next: makes => {
        this.availableMakes = makes;
        this.loadingMakes = false;
      },
      error: error => {
        this.error = 'Error fetching makes: ' + error;
        this.loadingMakes = false;
      }
    });
  }

  fetchModels(make: string): void {
    this.loadingModels = true;
    if (!this.modalForm.get('make')?.value) {
      this.modalForm.get('model')?.patchValue([], { emitEvent: false });
    }
    this.makeModelService.getModels(make).subscribe({
      next: models => {
        this.availableModels = models;
        this.loadingModels = false;
      },
      error: error => {
        this.error = 'Error fetching models: ' + error;
        this.loadingModels = false;
      }
    });
  }

  licensePlateValidator(control: FormControl): { [key: string]: any } | null {
    const valid = isValidRomanianLicensePlate(control.value);
    return valid ? null : { 'invalidLicensePlate': true };
  }

  staticLengthValidator(requiredLength: number) {
    return (control: FormControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value && value.length !== requiredLength) {
        return { staticLength: { requiredLength, actualLength: value.length } };
      }
      return null;
    };
  }

  onMakeSelection(value: Event | string): void {
    const selectedMakeValue = typeof value === 'string' ? value : (value.target as HTMLInputElement).value;
    this.fetchModels(selectedMakeValue)
  }

  onCancel() {
    this.isAddEditFleetConfirmed.emit(false)
  }

  onSubmit() {
    if (this.modalForm.valid) {
      this.fleetService.addOrUpdateFleet(this.vehicle)
      this.isAddEditFleetConfirmed.emit(true);
    } else {
      this.modalForm.markAllAsTouched();
    }
  }
  
}
