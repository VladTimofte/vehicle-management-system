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
import {
  ColDef,
  ICellRendererParams,
  GridReadyEvent,
  GridApi,
} from 'ag-grid-community';
import { DateTime } from 'luxon';

import { VehiclesService } from '../../services/crud/vehicles.service';
import { AddEditVehicleModalComponent } from '../../components/add-edit-vehicle-modal/add-edit-vehicle-modal.component';
import { Vehicle } from 'src/app/models/vehicle.model';
import { MakeIconClassName, emptyVehicleObj } from 'src/app/shared/vehicle';
import { AddEditVehicleFormService } from 'src/app/services/add-edit-vehicle.service';
import { DialogService } from 'src/app/services/dialog.service';
import { documentExpired, documentExpiresWithinMonth } from 'src/app/utils/booleans';
import { PermissionService } from '@src/app/services/permissions.service';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss'],
  imports: [
    AddEditVehicleModalComponent,
    CommonModule,
    MatIconModule,
    AgGridAngular,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehiclesComponent implements OnInit, OnDestroy {
  public hasAccess$!: boolean;
  public vehicles: Vehicle[] = [];
  private vehiclesSubscription: Subscription | undefined;
  private gridApi!: GridApi;
  public selectedRow: any;

  constructor(
    private vehiclesService: VehiclesService,
    private addEditVehicleService: AddEditVehicleFormService,
    private dialogService: DialogService,
    private permissionService: PermissionService,
  ) {
  }

  ngOnInit(): void {
    // Subscribe to vehicles observable
    this.vehiclesSubscription = this.vehiclesService
      .getVehiclesObservable()
      .subscribe((vehicles) => {
        this.updateGrid(vehicles)
      });
      this.permissionService.hasAccess('write:vehicles').subscribe(hasAccess => {
        this.hasAccess$ = hasAccess
      })
  }

  ngOnDestroy(): void {
    // Unsubscribe from vehicles observable to avoid memory leaks
    if (this.vehiclesSubscription) {
      this.vehiclesSubscription.unsubscribe();
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  vehilcesColumns: ColDef[] = [
    {
      field: 'icon',
      flex: 0.75,
      filter: false,
      headerName: '',
      sortable: false,
      cellRenderer: (params: ICellRendererParams) => {
        return `<i class='${params.value}'></i>`;
      },
    },
    { field: 'plateNumber', flex: 1.5, filter: true },
    { field: 'make', flex: 2, filter: true },
    { field: 'model', flex: 2, filter: true },
    { field: 'manufactureYear', flex: 2, filter: true },
    { field: 'vinNumber', flex: 2.2, filter: true },
    { field: 'engineHorsePower', flex: 2, filter: true },
    { field: 'engineCapacityCC', flex: 2, filter: true },
    { field: 'fuelType', flex: 2, filter: true },
    {
      field: 'expirationDateITP',
      flex: 2,
      filter: true,
      cellRenderer: (params: { value: number }) => {
        return DateTime.fromMillis(params.value).toFormat('dd-MM-yyyy');
      },
      cellStyle: (params) => {
        if (documentExpired(params.value)) {
          return { backgroundColor: 'rgb(255 0 0 / 40%) !important' };
        } else if (documentExpiresWithinMonth(params.value)) {
          return { backgroundColor: 'rgb(255 255 0 / 40%) !important' };
        }
        return null;
      }
    },
    {
      field: 'expirationDateRCA',
      flex: 2,
      filter: true,
      cellRenderer: (params: { value: number }) => {
        return DateTime.fromMillis(params.value).toFormat('dd-MM-yyyy');
      },
      cellStyle: (params) => {
        if (documentExpired(params.value)) {
          return { backgroundColor: 'rgb(255 0 0 / 40%) !important' };
        } else if (documentExpiresWithinMonth(params.value)) {
          return { backgroundColor: 'rgb(255 255 0 / 40%) !important' };
        }
        return null;
      }
    },
  ];

  private updateGrid(data: Vehicle[]): void {
    this.vehicles = data.map(el => {
      return {
        ...el,
        icon: this.getIconClassName(el)
      }
    })
    if (this.gridApi) {
      const rowData: Vehicle[] = [];
      this.gridApi.forEachNode(function (node) {
        rowData.push(node.data);
      });
      this.gridApi.applyTransaction({
        remove: rowData,
      })!;
      this.gridApi.applyTransaction({
        add: this.vehicles,
      })!;
    }
  }

  private getIconClassName(fl: Vehicle) {
    // Find icon class name based on vehicle make
    const formattedMake = fl.make.trim().toLowerCase();
    const foundVehicle = MakeIconClassName.find(
      (vehicle: any) => vehicle.make.toLowerCase() === formattedMake
    );
    return foundVehicle ? foundVehicle.iconClassName : null;
  }

  inputListener() {
    this.gridApi!.setGridOption(
      "quickFilterText",
      (document.getElementById("filter-text-box") as HTMLInputElement).value,
    );
  }

  addVehicle() {
    if (this.hasAccess$) {
    this.addEditVehicleService
      .openAddEditVehicleForm({
        vehicle: emptyVehicleObj,
        isVehicleUpdating: false,
      })
      .then((confirmed: any) => {
        if (confirmed) {
          console.log('Vehicle added'); // Todo: create a confirm message UI
        }
      });
    }
  }

  onRowClicked() {
    this.selectedRow = this.gridApi.getSelectedRows();
  }

  deselectRows() {
    this.selectedRow = undefined;
    this.gridApi.deselectAll();
  }

  editRow() {
    if (this.hasAccess$) {
    this.addEditVehicleService
      .openAddEditVehicleForm({
        vehicle: this.selectedRow[0],
        isVehicleUpdating: true,
      })
      .then((confirmed: any) => {
        if (confirmed) {
          console.log('Vehicle updated'); // Todo: create a confirm message UI
        }
      });
      this.deselectRows();
    } // Todo: create n error message UI else statement
  }

  onRemoveSelected() {
    if (this.hasAccess$) {
    const selectedData = this.gridApi.getSelectedRows()[0];
    this.dialogService
      .openConfirmDialog({
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete: ${selectedData.plateNumber}?`,
        type: 'question'
      })
      .then((confirmed: any) => {
        if (confirmed) {
          this.vehiclesService.removeVehicle(selectedData.id);
        }
      });
      this.deselectRows();
    } // Todo: create n error message UI else statement
  }

}
