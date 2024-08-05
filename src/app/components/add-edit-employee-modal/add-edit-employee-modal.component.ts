import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule, FormControl } from '@angular/forms';
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

import { Employee } from 'src/app/models/employee.model';
import { EmployeesService } from '@src/app/services/crud/employees.service';
import { jobDepartments } from 'src/app/shared/employee';
import { isCNPValid } from 'src/app/utils/strings';
import { DrivingLicenseCategoriesComponent } from "../driving-license-categories/driving-license-categories.component";

@Component({
  selector: 'app-add-edit-employee-modal',
  standalone: true,
  templateUrl: './add-edit-employee-modal.component.html',
  styleUrls: ['./add-edit-employee-modal.component.scss'],
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
    DrivingLicenseCategoriesComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditEmployeeModalComponent {
  @Input({ required: true }) employee!: Employee;
  @Input({ required: true }) isEmployeeUpdating!: boolean;
  @Output() isAddEditEmployeeConfirmed = new EventEmitter<boolean>();

  private employeeService = inject(EmployeesService);
  modalForm: FormGroup;
  isSOSDivHidden: boolean = true;
  jobDepartments: string[] = jobDepartments;

  constructor(private fb: FormBuilder) {
    this.modalForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      cnp: ['', [Validators.required, this.cnpValidator]],
      drivingLicenseExDate: ['', Validators.required],
      drivingLicenseCategories: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      jobDepartment: ['', Validators.required],
      emergencyContactName: [''],
      emergencyContactPhoneNumber: [''],
    });
  }

  ngOnInit(): void {
    this.modalForm.patchValue({
      firstName: this.employee.firstName,
      lastName: this.employee.lastName,
      cnp: this.employee.cnp,
      drivingLicenseExDate: new Date(this.employee.drivingLicenseExDate),
      drivingLicenseCategories: this.employee.drivingLicenseCategories,
      email: this.employee.email,
      phone: this.employee.phone,
      jobDepartment: this.employee.jobDepartment,
      emergencyContactName: this.employee.emergencyContactName,
      emergencyContactPhoneNumber: this.employee.emergencyContactPhoneNumber,
    });
    this.modalForm.valueChanges.subscribe(value => {
      this.keepEmployeeUpdated(value)
    });
  }

  keepEmployeeUpdated(value: Employee) {
    this.employee = {
      ...this.employee,
      ...value,
      drivingLicenseExDate: DateTime.fromJSDate(this.modalForm.value.drivingLicenseExDate).toMillis()
    }
  }

  cnpValidator(control: FormControl): { [key: string]: any } | null {
    const valid = isCNPValid(control.value);
    return valid ? null : { invalidCNP: true };
  }

  onCancel() {
    this.isAddEditEmployeeConfirmed.emit(false);
  }

  onSubmit() {
    if (this.modalForm.valid) {
      this.employeeService.addOrUpdateEmployee(this.employee);
      this.isAddEditEmployeeConfirmed.emit(true);
    } else {
      this.modalForm.markAllAsTouched();
    }
  }

  drivingCategoryClicked(category: string) {
    const dLCValue = [...this.modalForm.get('drivingLicenseCategories')?.value];
    const categoryIsSelected = dLCValue.some((el: string) => el === category);
    if (categoryIsSelected) {
      const index = dLCValue.findIndex((el: string) => el === category);
      if (index !== -1) {
        dLCValue.splice(index, 1);
      }
    } else {
      dLCValue.push(category);
    }
    this.modalForm.get('drivingLicenseCategories')?.patchValue(dLCValue, { emitEvent: false });
    this.keepEmployeeUpdated(this.modalForm.value)
  }
}
