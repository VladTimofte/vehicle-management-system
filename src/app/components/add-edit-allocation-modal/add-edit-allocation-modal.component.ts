import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
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

import { Allocation } from 'src/app/models/allocation.model';
import { AllocationsService } from 'src/app/services/crud/allocations.service';
import { Employee } from 'src/app/models/employee.model';
import { EmployeesService } from '@src/app/services/crud/employees.service';
import { Vehicle } from 'src/app/models/vehicle.model';
import { DialogService } from 'src/app/services/dialog.service';
import { VehiclesService } from '@src/app/services/crud/vehicles.service';
import { constructExpiredDocsDialogData } from 'src/app/utils/objects';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditAllocationModalComponent {
  @Input({ required: true }) allocation!: Allocation;
  @Input({ required: true }) isAllocationUpdating!: boolean;
  @Output() isAddEditAllocationConfirmed = new EventEmitter<boolean>();

  private allocationService = inject(AllocationsService);
  modalForm: FormGroup;
  isSOSDivHidden: boolean = true;
  employees: Employee[];
  fleets: Vehicle[];
  availableVehicles: Vehicle[] = [];
  isAvailableVehiclesLoading: Boolean = true;
  minDate: Date;

  constructor(
    private fb: FormBuilder,
    private employeesService: EmployeesService,
    private vehiclesService: VehiclesService,
    private dialogService: DialogService
  ) {
    this.modalForm = this.fb.group({
      employeeId: ['', Validators.required],
      vehicleId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
    this.employees = this.employeesService.getEmployees();
    this.fleets = this.vehiclesService.getVehicles();
    this.minDate = new Date();
    console.log(this.minDate);
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
    });
    this.modalForm.valueChanges.subscribe((value) => {
      this.keepAllocationUpdated(value);
    });
    this.keepAvailableVehiclesUpdated();
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

      const constructedLogicData = constructExpiredDocsDialogData(this.employees, this.fleets, this.allocation) 

      if (constructedLogicData.areDocsExpired) {
        this.dialogService.openConfirmDialog({
          title: constructedLogicData?.title,
          message: constructedLogicData?.message,
          type: 'error'
        });
      } else {
        this.allocationService.addOrUpdateAllocation(this.allocation);
        this.isAddEditAllocationConfirmed.emit(true);
      }
    } else {
      this.modalForm.markAllAsTouched();
    }
  }
}
