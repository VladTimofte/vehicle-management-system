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
  RowClassParams
} from 'ag-grid-community';

import { AddEditVehicleModalComponent } from '../../components/add-edit-vehicle-modal/add-edit-vehicle-modal.component';
import { AddEditEmployeeFormService } from 'src/app/services/add-edit-employee.service';
import { DialogService } from 'src/app/services/dialog.service';
import { EmployeesService } from 'src/app/services/employees.service';
import { Employee } from 'src/app/models/employee.model';
import { emptyEmployeeObj } from 'src/app/shared/employee';
import { documentExpired, documentExpiresWithinMonth } from 'src/app/utils/booleans';
import { AddEditAllocationFormService } from 'src/app/services/add-edit-allocation.service';

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
  public filteredEmployees: Employee[] = [];
  private EmployeesSubscription: Subscription | undefined;
  public searchTerm: string = '';
  private gridApi!: GridApi;
  public selectedRow: any;
  gridOptions: GridOptions;

  constructor(
    private employeeService: EmployeesService,
    private addEditEmployeeService: AddEditEmployeeFormService,
    private dialogService: DialogService,
    private addEditAllocationFormService: AddEditAllocationFormService
  ) {
    this.gridOptions = <GridOptions>{};
    this.gridOptions.getRowStyle = this.getRowStyle.bind(this);
  }

  ngOnInit(): void {
    // Subscribe to Employees observable
    this.EmployeesSubscription = this.employeeService
      .getEmployeesObservable()
      .subscribe((employees) => {
        this.updateFilteredEmployees(employees);
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
    { field: 'emergencyContactPhoneNumber',
      flex: 2,
      filter: false,
      cellRenderer: (params: { value: ICellRendererParams; }) => {
        return params.value || '-';
      }, 
    },
  ];

  private updateFilteredEmployees(employees: Employee[]): void {
    // Update filteredEmployees based on current search term
    this.filteredEmployees = this.filterEmployees(this.searchTerm, employees);
    if (this.gridApi) {
      const rowData: any[] = [];
      this.gridApi.forEachNode(function (node) {
        rowData.push(node.data);
      });
      this.gridApi.applyTransaction({
        remove: rowData,
      })!;
      this.gridApi.applyTransaction({
        add: this.filteredEmployees,
      })!;
    }
  }

  searchInputListener(value: string) {
    // Update search term and filteredEmployees
    this.searchTerm = value;
    this.filteredEmployees = this.filterEmployees(
      value,
      this.employeeService.getEmployees()
    );
  }

  inputListener(value: string) {
    // Handle input changes to update filteredEmployees
    if (!value?.length) {
      this.filteredEmployees = this.employeeService.getEmployees();
    }
  }

  private filterEmployees(
    searchTerm: string,
    employees: Employee[]
  ): Employee[] {
    // Check if searchTerm is null, undefined, or an empty string
    if (!searchTerm) {
      return this.employeeService.getEmployees();
    }

    // Filter fleets based on search term
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return employees.filter((employee) =>
      Object.keys(employee).some((key) => {
        const propValue = employee[key as keyof typeof employee];
        return (
          key !== 'id' &&
          propValue !== null &&
          propValue.toString().toLowerCase().includes(lowerCaseSearchTerm)
        );
      })
    );
  }

  addEmployee() {
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
  }

  onRowClicked() {
    this.selectedRow = this.gridApi.getSelectedRows();
  }

  deselectRows() {
    this.selectedRow = undefined;
    this.gridApi.deselectAll();
  }

  editRow() {
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
      this.deselectRows()
  }

  onRemoveSelected() {
    const selectedData = this.gridApi.getSelectedRows()[0];
    this.dialogService
      .openConfirmDialog({
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete: ${selectedData.firstName} ${selectedData.lastName}?`,
        type: 'question'
      })
      .then((confirmed) => {
        if (confirmed) {
          this.employeeService.removeEmployee(selectedData.id);
        }
      });
      this.deselectRows()
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
    this.addEditAllocationFormService
      .openAddEditAllocationForm({
        allocation: {
          id: '',
          employeeId: this.selectedRow[0].id,
          vehicleId: '',
          startDate: 0,
          endDate: 0
        },
        isAllocationUpdating: false,
      })
      .then((confirmed) => {
        if (confirmed) {
          console.log('Allocation added'); // Todo: create a confirm message UI
        }
      });
      this.deselectRows()
  }
}
