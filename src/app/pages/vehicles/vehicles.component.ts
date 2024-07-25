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

import { VehiclesService } from '../../services/vehicles.service';
import { AddEditVehicleModalComponent } from '../../components/add-edit-vehicle-modal/add-edit-vehicle-modal.component';
import { Vehicle } from 'src/app/models/vehicle.model';
import { MakeIconClassName, emptyVehicleObj } from 'src/app/shared/vehicle';
import { AddEditVehicleFormService } from 'src/app/services/add-edit-vehicle.service';
import { DialogService } from 'src/app/services/dialog.service';
import { documentExpired, documentExpiresWithinMonth } from 'src/app/utils/booleans';

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
  public filteredFleets: Vehicle[] = [];
  private fleetsSubscription: Subscription | undefined;
  public searchTerm: string = '';
  private gridApi!: GridApi;
  public selectedRow: any;

  constructor(
    private fleetsService: VehiclesService,
    private addEditFleetService: AddEditVehicleFormService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    // Subscribe to vehicles observable
    this.fleetsSubscription = this.fleetsService
      .getFleetsObservable()
      .subscribe((vehicles) => {
        this.updateFilteredFleets(vehicles);
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from vehicles observable to avoid memory leaks
    if (this.fleetsSubscription) {
      this.fleetsSubscription.unsubscribe();
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  fleetsColumns: ColDef[] = [
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
    { field: 'plateNumber', flex: 1.5, filter: false },
    { field: 'make', flex: 2, filter: false },
    { field: 'model', flex: 2, filter: false },
    { field: 'manufactureYear', flex: 2, filter: false },
    { field: 'vinNumber', flex: 2.2, filter: false },
    { field: 'engineHorsePower', flex: 2, filter: false },
    { field: 'engineCapacityCC', flex: 2, filter: false },
    { field: 'fuelType', flex: 2, filter: false },
    {
      field: 'expirationDateITP',
      flex: 2,
      filter: false,
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
      filter: false,
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

  private updateFilteredFleets(vehicles: Vehicle[]): void {
    // Update filteredFleets based on current search term
    this.filteredFleets = this.filterFleets(this.searchTerm, vehicles);
    if (this.gridApi) {
      const rowData: any[] = [];
      this.gridApi.forEachNode(function (node) {
        rowData.push(node.data);
      });
      this.gridApi.applyTransaction({
        remove: rowData,
      })!;
      this.gridApi.applyTransaction({
        add: this.filteredFleets,
      })!;
    }
  }

  searchInputListener(value: string) {
    // Update search term and filteredFleets
    this.searchTerm = value;
    this.filteredFleets = this.filterFleets(
      value,
      this.fleetsService.getFleets()
    );
  }

  inputListener(value: string) {
    // Handle input changes to update filteredFleets
    if (!value?.length) {
      this.filteredFleets = this.fleetsService.getFleets().map((vehicle) => ({
        ...vehicle,
        icon: this.getIconClassName(vehicle),
      }));
    }
  }

  private filterFleets(searchTerm: string, vehicles: Vehicle[]): Vehicle[] {
    // Check if searchTerm is null, undefined, or an empty string
    if (!searchTerm) {
      return this.fleetsService.getFleets().map((vehicle) => ({
        ...vehicle,
        icon: this.getIconClassName(vehicle),
      }));
    }

    // Filter vehicles based on search term
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return vehicles
      .filter((vehicle) =>
        Object.keys(vehicle).some((key) => {
          const propValue = vehicle[key as keyof typeof vehicle];
          return (
            key !== 'id' &&
            propValue !== null &&
            propValue.toString().toLowerCase().includes(lowerCaseSearchTerm)
          );
        })
      )
      .map((filteredFleet) => ({
        ...filteredFleet,
        icon: this.getIconClassName(filteredFleet),
      }));
  }

  private getIconClassName(fl: Vehicle) {
    // Find icon class name based on vehicle make
    const formattedMake = fl.make.trim().toLowerCase();
    const foundFleet = MakeIconClassName.find(
      (vehicle: any) => vehicle.make.toLowerCase() === formattedMake
    );
    return foundFleet ? foundFleet.iconClassName : null;
  }

  addFleet() {
    this.addEditFleetService
      .openAddEditFleetForm({
        vehicle: emptyVehicleObj,
        isFleetUpdating: false,
      })
      .then((confirmed: any) => {
        if (confirmed) {
          console.log('Vehicle added'); // Todo: create a confirm message UI
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
    this.addEditFleetService
      .openAddEditFleetForm({
        vehicle: this.selectedRow[0],
        isFleetUpdating: true,
      })
      .then((confirmed: any) => {
        if (confirmed) {
          console.log('Vehicle updated'); // Todo: create a confirm message UI
        }
      });
      this.deselectRows();
  }

  onRemoveSelected() {
    const selectedData = this.gridApi.getSelectedRows()[0];
    this.dialogService
      .openConfirmDialog({
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete: ${selectedData.plateNumber}?`,
        type: 'question'
      })
      .then((confirmed: any) => {
        if (confirmed) {
          this.fleetsService.removeFleet(selectedData.id);
        }
      });
      this.deselectRows();
  }
}
