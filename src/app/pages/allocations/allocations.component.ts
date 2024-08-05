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
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { DateTime } from 'luxon';

import { AddEditVehicleModalComponent } from '../../components/add-edit-vehicle-modal/add-edit-vehicle-modal.component';
import { DialogService } from 'src/app/services/dialog.service';
import { AllocationsService } from 'src/app/services/crud/allocations.service';
import { Allocation } from 'src/app/models/allocation.model';
import { AddEditAllocationFormService } from 'src/app/services/add-edit-allocation.service';
import { emptyAllocationObj } from 'src/app/shared/allocation';
import { EmployeesService } from '@src/app/services/crud/employees.service';
import { VehiclesService } from '@src/app/services/crud/vehicles.service';
import { Employee } from 'src/app/models/employee.model';
import { Vehicle } from 'src/app/models/vehicle.model';

@Component({
  selector: 'app-allocations',
  standalone: true,
  templateUrl: './allocations.component.html',
  styleUrls: ['./allocations.component.scss'],
  imports: [
    AddEditVehicleModalComponent,
    CommonModule,
    MatIconModule,
    AgGridAngular,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllocationsComponent implements OnInit, OnDestroy {
  public filteredAllocations: Allocation[] = [];
  private AllocationsSubscription: Subscription | undefined;
  private VehiclesSubscription: Subscription | undefined;
  private EmployeesSubscription: Subscription | undefined;
  public searchTerm: string = '';
  private gridApi!: GridApi;
  public selectedRow: any;
  employees: Employee[];
  vehicles: Vehicle[];

  constructor(
    private allocationsService: AllocationsService,
    private addEditAllocationFormService: AddEditAllocationFormService,
    private dialogService: DialogService,
    private employeesService: EmployeesService,
    private vehiclesService: VehiclesService
  ) {
    this.vehicles = this.vehiclesService.getVehicles();
    this.employees = this.employeesService.getEmployees();
  }

  ngOnInit(): void {
    // Subscribe to Allocations observable
    this.AllocationsSubscription = this.allocationsService
      .getAllocationsObservable()
      .subscribe((allocations) => {
        this.updateFilteredAllocations(allocations);
      });
      // Subscribe to Vehicles observable
      this.VehiclesSubscription = this.vehiclesService
      .getVehiclesObservable()
      .subscribe((vehicles) => {
        this.vehicles = vehicles
      });
      // Subscribe to EmployeesSubscription observable
      this.EmployeesSubscription = this.employeesService
      .getEmployeesObservable()
      .subscribe((employee) => {
        this.employees = employee
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from Allocations observable to avoid memory leaks
    if (this.AllocationsSubscription) {
      this.AllocationsSubscription.unsubscribe();
    }
    // Unsubscribe from Vehicles observable to avoid memory leaks
    if (this.VehiclesSubscription) {
      this.VehiclesSubscription.unsubscribe();
    }
    // Unsubscribe from Employees observable to avoid memory leaks
    if (this.EmployeesSubscription) {
      this.EmployeesSubscription.unsubscribe();
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  employeesColumns: ColDef[] = [
    {
      field: 'employeeId',
      headerName: 'Employee',
      flex: 2,
      filter: false,
      cellRenderer: (params: { value: string }) => {
        var foundEmployee = this.employeesService
          .getEmployees()
          .find((el) => el.id === params.value);
          return foundEmployee ? foundEmployee?.firstName + ' ' + foundEmployee?.lastName : 'Deleted Employee' 
      },
    },
    {
      field: 'vehicleId',
      headerName: 'Vehicle',
      flex: 2,
      filter: false,
      cellRenderer: (params: { value: string }) => {
        var foundVehicle = this.vehicles.find((el) => el.id === params.value);
        return foundVehicle ? 
          foundVehicle?.make +
          ' ' +
          foundVehicle?.model +
          ' - ' +
          foundVehicle?.plateNumber
        : 'Deleted Vehicle'
      },
    },
    {
      field: 'startDate',
      flex: 2,
      filter: false,
      cellRenderer: (params: { value: number }) => {
        return DateTime.fromMillis(params.value).toFormat('dd-MM-yyyy');
      },
    },
    {
      field: 'endDate',
      flex: 2,
      filter: false,
      cellRenderer: (params: { value: number }) => {
        return DateTime.fromMillis(params.value).toFormat('dd-MM-yyyy');
      },
    },
  ];

  private updateFilteredAllocations(allocations: Allocation[]): void {
    // Update filteredAllocations based on current search term
    this.filteredAllocations = this.filterAllocations(
      this.searchTerm,
      allocations
    );
    if (this.gridApi) {
      const rowData: any[] = [];
      this.gridApi.forEachNode(function (node) {
        rowData.push(node.data);
      });
      this.gridApi.applyTransaction({
        remove: rowData,
      })!;
      this.gridApi.applyTransaction({
        add: this.filteredAllocations,
      })!;
    }
  }

  searchInputListener(value: string) {
    // Update search term and filteredAllocations
    this.searchTerm = value;
    this.filteredAllocations = this.filterAllocations(
      value,
      this.allocationsService.getAllocations()
    );
  }

  inputListener(value: string) {
    // Handle input changes to update filteredAllocations
    if (!value?.length) {
      this.filteredAllocations = this.allocationsService.getAllocations();
    }
  }

  private filterAllocations(
    searchTerm: string,
    allocations: Allocation[]
  ): Allocation[] {
    // Check if searchTerm is null, undefined, or an empty string
    if (!searchTerm) {
      return this.allocationsService.getAllocations();
    }
  
    // Convert search term to lower case
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
    return allocations.filter((allocation) => {
      // Check if any property of the allocation matches the search term
      return Object.keys(allocation).some((key) => {
        const propValue = allocation[key as keyof typeof allocation];
  
        if (key === 'employeeId') {
          // Find employee by ID
          const employee = this.employees.find(e => e.id === propValue);
          if (employee) {
            const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
            return fullName.includes(lowerCaseSearchTerm);
          }
          return false;
        } else if (key === 'vehicleId') {
          // Find vehicle by ID
          const vehicle = this.vehicles.find(f => f.id === propValue);
          if (vehicle) {
            return (
              vehicle.make.toLowerCase().includes(lowerCaseSearchTerm) ||
              vehicle.model.toLowerCase().includes(lowerCaseSearchTerm) ||
              vehicle.plateNumber.toLowerCase().includes(lowerCaseSearchTerm)
            );
          }
          return false;
        } else if (key === 'startDate' || key === 'endDate') {
          // Format date and check
          const formattedDate = DateTime.fromMillis(propValue as number).toFormat('dd-MM-yyyy');
          return formattedDate.includes(lowerCaseSearchTerm);
        } else {
          // General case for other properties
          return (
            key !== 'id' &&
            propValue !== null &&
            propValue.toString().toLowerCase().includes(lowerCaseSearchTerm)
          );
        }
      });
    });
  }

  addAllocation() {
    this.addEditAllocationFormService
      .openAddEditAllocationForm({
        allocation: emptyAllocationObj,
        isAllocationUpdating: false,
      })
      .then((confirmed) => {
        if (confirmed) {
          console.log('Allocation added'); // Todo: create a confirm message UI
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
    this.addEditAllocationFormService
      .openAddEditAllocationForm({
        allocation: this.selectedRow[0],
        isAllocationUpdating: true,
      })
      .then((confirmed) => {
        if (confirmed) {
          console.log('Allocation updated'); // Todo: create a confirm message UI
        }
      });
      this.deselectRows()
  }

  onRemoveSelected() {
    const selectedData = this.gridApi.getSelectedRows()[0];
    const assignedEmployee = this.employees.find(
      (el) => el.id === selectedData?.employeeId
    );
    const assignedVehicle = this.vehicles.find(
      (el) => el.id === selectedData?.vehicleId
    );
    this.dialogService
      .openConfirmDialog({
        title: 'Confirm Deletion',
        message: `Are you sure you want to unassign: 
        ${assignedEmployee?.firstName} ${assignedEmployee?.lastName} from 
        ${assignedVehicle?.make} ${assignedVehicle?.model} - 
        ${assignedVehicle?.plateNumber}?`,
        type: 'question',
      })
      .then((confirmed) => {
        if (confirmed) {
          this.allocationsService.removeAllocation(selectedData.id);
        }
      });
      this.deselectRows()
  }
}
