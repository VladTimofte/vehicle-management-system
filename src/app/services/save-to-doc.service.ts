import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DateTime } from 'luxon';
import { VehiclesService } from './crud/vehicles.service';
import { EmployeesService } from './crud/employees.service';
import { AllocationsService } from './crud/allocations.service';
import { HistoryService } from './crud/history.service';
import { formatActionString, formatEntityString } from '../utils/strings';
import {
  refactorAllocations,
  refactorEmployees,
  refactorHistory,
  refactorVehicles,
} from '../utils/objects';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root',
})
export class SaveToDocService {
  private readonly EXCEL_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  private readonly EXCEL_EXTENSION = '.xlsx';

  constructor(
    private vehiclesService: VehiclesService,
    private employeesService: EmployeesService,
    private allocationsService: AllocationsService,
    private historyService: HistoryService,
    private dialogService: DialogService
  ) {}

  exportToDocument(route: string, extension: string) {
    // Define a function variable and set default to exportToExcell
    let fnc = this.exportToExcell.bind(this);

    // Set the function to call based on the extension
    if (extension === 'pdf') {
      fnc = this.exportToPDF.bind(this);
    }

    // Use a switch-case to handle different routes
    switch (route) {
      case '/vehicles':
        fnc(
          refactorVehicles(this.vehiclesService.getVehicles()),
          `Vehicles_${DateTime.now().toFormat('dd-MM-yyyy HH-mm-ss')}`
        );
        break;
      case '/employees':
        fnc(
          refactorEmployees(this.employeesService.getEmployees()),
          `Employees_${DateTime.now().toFormat('dd-MM-yyyy HH-mm-ss')}`
        );
        break;
      case '/allocations':
        fnc(
          refactorAllocations(
            this.allocationsService.getAllocations(),
            this.employeesService.getEmployees(),
            this.vehiclesService.getVehicles()
          ),
          `Allocations_${DateTime.now().toFormat('dd-MM-yyyy HH-mm-ss')}`
        );
        break;
      case '/history':
        fnc(
          refactorHistory(this.historyService.getHistory()),
          `History_${DateTime.now().toFormat('dd-MM-yyyy HH-mm-ss')}`
        );
        break;
      default:
        console.error('Invalid route');
    }
  }

  exportToExcell(data: any[], fileName: string = 'data') {
    if (data.length > 0) {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      const workbook: XLSX.WorkBook = {
        Sheets: { data: worksheet },
        SheetNames: ['data'],
      };

      const excelBuffer: any = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      const dataBlob: Blob = new Blob([excelBuffer], { type: this.EXCEL_TYPE });
      saveAs(dataBlob, `${fileName}${this.EXCEL_EXTENSION}`);
    } else {
      this.dialogService
        .openConfirmDialog({
          title: 'Cannot download',
          message: 'Cannot generate excell file, since there is no data',
          type: 'info',
        });
    }
  }

  exportToPDF(data: any[], fileName: string = 'data') {
    const doc = new jsPDF();

    // Check if there's data to export
    if (data.length > 0) {
      // Extract headers from the first object
      const headers = Object.keys(data[0]);

      autoTable(doc, {
        head: [headers],
        body: data.map((item) => headers.map((header) => item[header])),
      });

      doc.save(`${fileName}.pdf`);
    } else {
      this.dialogService
        .openConfirmDialog({
          title: 'Cannot download',
          message: 'Cannot generate PDF file, since there is no data',
          type: 'info',
        });
    }
  }
}
