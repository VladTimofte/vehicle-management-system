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

import { HistoryService } from '../../services/crud/history.service';
import { AddEditVehicleModalComponent } from '../../components/add-edit-vehicle-modal/add-edit-vehicle-modal.component';
import { History } from 'src/app/models/history.model';
import { formatActionString, formatEntityString } from '@src/app/utils/strings';

@Component({
  selector: 'app-history',
  standalone: true,
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  imports: [
    AddEditVehicleModalComponent,
    CommonModule,
    MatIconModule,
    AgGridAngular,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent implements OnInit, OnDestroy {
  public history: History[] = [];
  private historySubscription: Subscription | undefined;
  private gridApi!: GridApi;
  public selectedRow: any;

  constructor(
    private historyService: HistoryService,
  ) {}

  ngOnInit(): void {
    // Subscribe to history observable
    this.historySubscription = this.historyService
      .getHistoryObservable()
      .subscribe((history) => {
        this.updateGrid(history);
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from history observable to avoid memory leaks
    if (this.historySubscription) {
      this.historySubscription.unsubscribe();
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  historyColumns: ColDef[] = [
    { field: 'user', headerName: 'User (Who?)', flex: 2, filter: true },
    {
      field: 'action',
      headerName: 'Action (what?)',
      flex: 2,
      filter: true,
      cellRenderer: (params: { value: string }) => {
        return formatActionString(params.value);
      },
    },
    {
      field: 'entity',
      headerName: 'Entity',
      flex: 2,
      filter: true,
      cellRenderer: (params: { value: string }) => {
        return formatEntityString(params.value);
      },
    },
    {
      field: 'resource',
      headerName: 'Resource',
      flex: 4,
      filter: true,
    },
    {
      field: 'date',
      headerName: 'Date (When?)',
      flex: 2,
      filter: true,
      cellRenderer: (params: { value: number }) => {
        return DateTime.fromMillis(params.value).toFormat('dd-MM-yyyy | HH:mm');
      },
    },
  ];

  private updateGrid(data: History[]): void {
    this.history = data;
    if (this.gridApi) {
      const rowData: History[] = [];
      this.gridApi.forEachNode(function (node) {
        rowData.push(node.data);
      });
      this.gridApi.applyTransaction({
        remove: rowData,
      })!;
      this.gridApi.applyTransaction({
        add: this.history,
      })!;
    }
  }

  inputListener() {
    this.gridApi!.setGridOption(
      'quickFilterText',
      (document.getElementById('filter-text-box') as HTMLInputElement).value
    );
  }

  deselectRows() {
    this.selectedRow = undefined;
    this.gridApi.deselectAll();
  }
}
