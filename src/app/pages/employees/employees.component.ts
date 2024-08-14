import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { AgGridAngular } from 'ag-grid-angular';
import { DateTime } from 'luxon';
import {
  ColDef,
  ICellRendererParams,
  GridReadyEvent,
  GridApi,
  GridOptions,
  RowClassParams,
} from 'ag-grid-community';

import { AddEditVehicleModalComponent } from '../../components/add-edit-vehicle-modal/add-edit-vehicle-modal.component';
import { AddEditEmployeeFormService } from 'src/app/services/add-edit-employee.service';
import { DialogService } from 'src/app/services/dialog.service';
import { EmployeesService } from '@src/app/services/crud/employees.service';
import { Employee } from 'src/app/models/employee.model';
import { emptyEmployeeObj } from 'src/app/shared/employee';
import {
  documentExpired,
  documentExpiresWithinMonth,
} from 'src/app/utils/booleans';
import { AddEditAllocationFormService } from 'src/app/services/add-edit-allocation.service';
import { PermissionService } from '@src/app/services/permissions.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
  imports: [
    AddEditVehicleModalComponent,
    CommonModule,
    MatIconModule,
    AgGridAngular,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesComponent implements OnInit, OnDestroy {
  public employees: Employee[] = [];
  private EmployeesSubscription: Subscription | undefined;
  public searchTerm: string = '';
  private gridApi!: GridApi;
  public selectedRow: any;
  gridOptions: GridOptions;

  constructor(
    private employeeService: EmployeesService,
    private addEditEmployeeService: AddEditEmployeeFormService,
    private dialogService: DialogService,
    private addEditAllocationFormService: AddEditAllocationFormService,
    private permissionService: PermissionService
  ) {
    this.gridOptions = <GridOptions>{};
    this.gridOptions.getRowStyle = this.getRowStyle.bind(this);
  }

  ngOnInit(): void {
    // Subscribe to Employees observable
    this.EmployeesSubscription = this.employeeService
      .getEmployeesObservable()
      .subscribe((employees) => {
        this.updateGrid(employees);
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from Employees observable to avoid memory leaks
    if (this.EmployeesSubscription) {
      this.EmployeesSubscription.unsubscribe();
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  employeesColumns: ColDef[] = [
    { field: 'firstName', flex: 2, filter: false },
    { field: 'lastName', flex: 2, filter: false },
    { field: 'cnp', flex: 2, filter: false },
    {
      field: 'drivingLicenseExDate',
      flex: 2,
      filter: false,
      cellRenderer: (params: { value: number }) => {
        return DateTime.fromMillis(params.value).toFormat('dd-MM-yyyy');
      },
    },
    { field: 'drivingLicenseCategories', flex: 2, filter: false },
    { field: 'email', flex: 2, filter: false },
    { field: 'phone', flex: 2, filter: false },
    { field: 'jobDepartment', flex: 2, filter: false },
    {
      field: 'emergencyContactName',
      flex: 2,
      filter: false,
      cellRenderer: (params: { value: ICellRendererParams }) => {
        return params.value || '-';
      },
    },
    {
      field: 'emergencyContactPhoneNumber',
      flex: 2,
      filter: false,
      cellRenderer: (params: { value: ICellRendererParams }) => {
        return params.value || '-';
      },
    },
  ];

  inputListener() {
    // Handle input changes
    this.gridApi!.setGridOption(
      'quickFilterText',
      (document.getElementById('filter-text-box') as HTMLInputElement).value
    );
  }

  addEmployee() {
    if (this.hasAccess('write:employees')) {
      this.addEditEmployeeService
        .openAddEditEmployeeForm({
          employee: emptyEmployeeObj,
          isEmployeeUpdating: false,
        })
        .then((confirmed) => {
          if (confirmed) {
            console.log('Employee added'); // Todo: create a confirm message UI
          }
        });
    } // Todo: create n error message UI else statement
  }

  onRowClicked() {
    this.selectedRow = this.gridApi.getSelectedRows();
  }

  deselectRows() {
    this.selectedRow = undefined;
    this.gridApi.deselectAll();
  }

  editRow() {
    if (this.hasAccess('write:employees')) {
      this.addEditEmployeeService
        .openAddEditEmployeeForm({
          employee: this.selectedRow[0],
          isEmployeeUpdating: true,
        })
        .then((confirmed) => {
          if (confirmed) {
            console.log('Employee updated'); // Todo: create a confirm message UI
          }
        });
      this.deselectRows();
    } // Todo: create n error message UI else statement
  }

  onRemoveSelected() {
    if (this.hasAccess('write:employees')) {
      const selectedData = this.gridApi.getSelectedRows()[0];
      this.dialogService
        .openConfirmDialog({
          title: 'Confirm Deletion',
          message: `Are you sure you want to delete: ${selectedData.firstName} ${selectedData.lastName}?`,
          type: 'question',
        })
        .then((confirmed) => {
          if (confirmed) {
            this.employeeService.removeEmployee(selectedData.id);
          }
        });
      this.deselectRows();
    } // Todo: create n error message UI else statement
  }

  getRowStyle(params: RowClassParams) {
    if (documentExpired(params.data.drivingLicenseExDate)) {
      return { background: 'rgba(255, 0, 0, 0.4) !important' };
    } else if (documentExpiresWithinMonth(params.data.drivingLicenseExDate)) {
      return { background: 'rgba(255, 255, 0, 0.4) !important' };
    }
    return undefined;
  }

  addAllocation() {
    if (this.hasAccess('write:employees')) {
      this.addEditAllocationFormService
        .openAddEditAllocationForm({
          allocation: {
            id: '',
            employeeId: this.selectedRow[0].id,
            vehicleId: '',
            startDate: 0,
            endDate: 0,
            startLocation: {},
            endLocation: {},
            distance: 0,
          },
          isAllocationUpdating: false,
        })
        .then((confirmed) => {
          if (confirmed) {
            console.log('Allocation added'); // Todo: create a confirm message UI
          }
        });
      this.deselectRows();
    } // Todo: create n error message UI else statement
  }

  private updateGrid(data: Employee[]): void {
    this.employees = data;
    if (this.gridApi) {
      const rowData: Employee[] = [];
      this.gridApi.forEachNode(function (node) {
        rowData.push(node.data);
      });
      this.gridApi.applyTransaction({
        remove: rowData,
      })!;
      this.gridApi.applyTransaction({
        add: this.employees,
      })!;
    }
  }

  hasAccess(permission: string): boolean {
    return this.permissionService.hasAccess(permission);
  }
}
