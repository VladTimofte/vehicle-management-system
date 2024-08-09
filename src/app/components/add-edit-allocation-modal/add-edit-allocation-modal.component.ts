import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { DateTime } from 'luxon';
import { Subject, of } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

import { Allocation } from 'src/app/models/allocation.model';
import { AllocationsService } from 'src/app/services/crud/allocations.service';
import { Employee } from 'src/app/models/employee.model';
import { EmployeesService } from '@src/app/services/crud/employees.service';
import { Vehicle } from 'src/app/models/vehicle.model';
import { DialogService } from 'src/app/services/dialog.service';
import { VehiclesService } from '@src/app/services/crud/vehicles.service';
import { constructExpiredDocsDialogData } from 'src/app/utils/objects';
import { LocationService } from '@src/app/services/location.service';
import { DistanceService } from '@src/app/services/distance.service';

@Component({
  selector: 'app-add-edit-allocation-modal',
  standalone: true,
  templateUrl: './add-edit-allocation-modal.component.html',
  styleUrls: ['./add-edit-allocation-modal.component.scss'],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatInputModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
  ],
})
export class AddEditAllocationModalComponent {
  @Input({ required: true }) allocation!: Allocation;
  @Input({ required: true }) isAllocationUpdating!: boolean;
  @Output() isAddEditAllocationConfirmed = new EventEmitter<boolean>();

  private allocationService = inject(AllocationsService);
  modalForm: FormGroup;
  isSOSDivHidden: boolean = true;
  employees: Employee[];
  vehicles: Vehicle[];
  availableVehicles: Vehicle[] = [];
  isAvailableVehiclesLoading: Boolean = true;
  minDate: Date;
  startLocations: any[] = [];
  endLocations: any[] = [];
  distance: number;

  private startQuerySubject: Subject<string> = new Subject();
  private endQuerySubject: Subject<string> = new Subject();
  isStartLocationsLoading: boolean = true;
  isEndLocationsLoading: boolean = true;

  constructor(
    private fb: FormBuilder,
    private employeesService: EmployeesService,
    private vehiclesService: VehiclesService,
    private dialogService: DialogService,
    private locationService: LocationService,
    private distanceService: DistanceService
  ) {
    this.modalForm = this.fb.group({
      employeeId: ['', Validators.required],
      vehicleId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      startLocation: ['', Validators.required],
      endLocation: ['', Validators.required],
      endLocationInput: [''],
      startLocationInput: [''],
    });
    this.employees = this.employeesService.getEmployees();
    this.vehicles = this.vehiclesService.getVehicles();
    this.minDate = new Date();

    this.distance = this.allocation?.distance;

    // Subscribe to start location queries
    this.startQuerySubject
      .pipe(
        debounceTime(1000), // Wait for 1 second of inactivity
        tap(() => (this.isStartLocationsLoading = true)),
        switchMap((query) =>
          query ? this.locationService.searchLocations(query) : of([])
        ),
        tap(() => (this.isStartLocationsLoading = false))
      )
      .subscribe((locations) => {
        this.keepLocationsUpdated([...locations], 'start');
      });

    // Subscribe to end location queries
    this.endQuerySubject
      .pipe(
        debounceTime(1000), // Wait for 1 second of inactivity
        tap(() => (this.isEndLocationsLoading = true)),
        switchMap((query) =>
          query ? this.locationService.searchLocations(query) : of([])
        ),
        tap(() => (this.isEndLocationsLoading = false))
      )
      .subscribe((locations) => {
        this.keepLocationsUpdated([...locations], 'end');
      });
  }

  keepLocationsUpdated(locations: any, target: string) {
    if (target === 'start') {
      this.startLocations = locations;
    }
    if (target === 'end') {
      this.endLocations = locations;
    }
  }

  ngOnInit(): void {
    this.modalForm.patchValue({
      employeeId: this.allocation.employeeId,
      vehicleId: this.allocation.vehicleId,
      startDate:
        this.allocation.startDate > 0
          ? new Date(this.allocation.startDate)
          : undefined,
      endDate:
        this.allocation.endDate > 0
          ? new Date(this.allocation.endDate)
          : undefined,
      startLocation: this.allocation.startLocation,
      endLocation: this.allocation.endLocation,
    });
    this.modalForm.valueChanges.subscribe((value) => {
      this.keepAllocationUpdated(value);
    });
    this.keepAvailableVehiclesUpdated();
    this.initDynamicFields();
  }

  initDynamicFields() {
    this.distance = this.allocation?.distance;
    if (
      Object.keys(this.allocation.startLocation)?.length &&
      Object.keys(this.allocation.endLocation)?.length
    ) {
      this.isStartLocationsLoading = false;
      this.isEndLocationsLoading = false;

      this.startLocations = [this.allocation?.startLocation];
      this.endLocations = [this.allocation?.endLocation];

      this.modalForm
        .get('startLocationInput')
        ?.setValue(this.allocation.startLocation?.display_name);
      this.modalForm
        .get('endLocationInput')
        ?.setValue(this.allocation.endLocation?.display_name);
    }
  }

  keepAvailableVehiclesUpdated() {
    if (
      this.modalForm?.value?.startDate &&
      this.modalForm?.value?.endDate &&
      this.modalForm.value.employeeId
    ) {
      this.isAvailableVehiclesLoading = false;
      this.availableVehicles = this.allocationService.getAvailableVehicles(
        this.allocation.employeeId,
        this.allocation.startDate,
        this.allocation.endDate
      );
    } else {
      this.isAvailableVehiclesLoading = true;
    }
  }

  keepAllocationUpdated(value: Allocation) {
    this.allocation = {
      ...this.allocation,
      ...value,
      startDate: DateTime.fromJSDate(this.modalForm.value.startDate).toMillis(),
      endDate: DateTime.fromJSDate(this.modalForm.value.endDate).toMillis(),
    };
  }

  onCancel() {
    this.isAddEditAllocationConfirmed.emit(false);
  }

  onSubmit() {
    if (this.modalForm.valid) {
      const constructedLogicData = constructExpiredDocsDialogData(
        this.employees,
        this.vehicles,
        this.allocation
      );

      if (constructedLogicData.areDocsExpired) {
        this.dialogService.openConfirmDialog({
          title: constructedLogicData?.title,
          message: constructedLogicData?.message,
          type: 'error',
        });
      } else {
        this.allocationService.addOrUpdateAllocation({
          ...this.allocation,
          distance: this.distance,
        });
        this.isAddEditAllocationConfirmed.emit(true);
      }
    } else {
      this.modalForm.markAllAsTouched();
    }
  }

  onQueryChanged(event: Event, type: 'start' | 'end') {
    const query = (event.target as HTMLInputElement).value;
    if (type === 'start') {
      this.startQuerySubject.next(query);
    } else {
      this.endQuerySubject.next(query);
    }
  }

  onLocationSelected() {
    // Calculate distance if both locations are selected
    const startCoords = this.modalForm.get('startLocation')?.value;
    const endCoords = this.modalForm.get('endLocation')?.value;

    if (startCoords?.place_id && endCoords?.place_id) {
      this.calculateDistance(startCoords, endCoords).subscribe((response) => {
        this.distance = response.routes[0].summary.distance / 1000; // Convert meters to kilometers
      });
    }
  }

  findLocationViaPlaceID(placeID: number, locationType: string) {
    if (locationType === 'start') {
      return this.startLocations.find((el: any) => el.place_id === placeID);
    }
    if (locationType === 'end') {
      return this.endLocations.find((el: any) => el.place_id === placeID);
    }
  }

  calculateDistance(start: any, end: any) {
    const startCoords = [parseFloat(start.lon), parseFloat(start.lat)];
    const endCoords = [parseFloat(end.lon), parseFloat(end.lat)];
    return this.distanceService.calculateDistance(
      startCoords as any,
      endCoords as any
    );
  }
}
