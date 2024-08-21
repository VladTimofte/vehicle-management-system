import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DateTime } from 'luxon';
import { VehiclesService } from './crud/vehicles.service';
import { EmployeesService } from './crud/employees.service';
import { AllocationsService } from './crud/allocations.service';
import { HistoryService } from './crud/history.service';
import { Vehicle } from '../models/vehicle.model';
import { Employee } from '../models/employee.model';
import { Allocation } from '../models/allocation.model';
import { History } from '../models/history.model';
import { formatActionString, formatEntityString } from '../utils/strings';

@Injectable({
  providedIn: 'root',
})
export class SaveToExcelService {
  private readonly EXCEL_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  private readonly EXCEL_EXTENSION = '.xlsx';

  constructor(
    private vehiclesService: VehiclesService,
    private employeesService: EmployeesService,
    private allocationsService: AllocationsService,
    private historyService: HistoryService,
  ) {}

  exportToExcel(route: string) {
    switch (route) {
      case '/vehicles':
        this.export(
          this.refactorVehicles(this.vehiclesService.getVehicles()),
          `Vehicles_${DateTime.now().toFormat('dd-MM-yyyy HH-mm-ss')}`
        );
        break;
      case '/employees':
        this.export(
          this.refactorEmployees(this.employeesService.getEmployees()),
          `Employees_${DateTime.now().toFormat('dd-MM-yyyy HH-mm-ss')}`
        );
        break;
      case '/allocations':
        this.export(
          this.refactorAllocations(this.allocationsService.getAllocations()),
          `Allocations_${DateTime.now().toFormat('dd-MM-yyyy HH-mm-ss')}`
        );
        break;
      case '/history':
        this.export(
          this.refactorHistory(this.historyService.getHistory()),
          `History_${DateTime.now().toFormat('dd-MM-yyyy HH-mm-ss')}`
        );
        break;
    }
  }

  refactorVehicles(data: Vehicle[]) {
    return data.map(el => {
      return {
        'Plate Number': el.plateNumber || '-',
        'Make': el.make || '-',
        'Model': el.model || '-',
        'Manufacture Year': el.manufactureYear || '-',
        'VIN Number': el.vinNumber || '-',
        'Engine HP': el.engineHorsePower || '-',
        'Engine Capacity': el.engineCapacityCC || '-',
        'Fuel Type': el.fuelType || '-',
        'ITP exp. Date': DateTime.fromMillis(el.expirationDateITP).toFormat('dd-MM-yyyy') || '-',
        'RCA exp Date': DateTime.fromMillis(el.expirationDateRCA).toFormat('dd-MM-yyyy') || '-'
      }
    })
  }

  refactorEmployees(data: Employee[]) {
    return data.map(el => {
      return {
        'First Name': el.firstName,
        'Last Name': el.lastName,
        'CNP': el.cnp,
        'Driving License exp. Date': el.drivingLicenseExDate,
        'Driving Categories': el.drivingLicenseCategories,
        'Email': el.email,
        'Phone': el.phone,
        'Job Department': el.jobDepartment,
        'Emergency Contact Name': el.emergencyContactName,
        'Emergency Contact Phone Number': el.emergencyContactPhoneNumber
      }
    })
  }

  refactorAllocations(data: Allocation[]) {
    return data.map(el => {
      return {
        'Employee': this.employeesService.getEmployees().find(element => element.id === el.employeeId)?.firstName || 'Deleted Employee',
        'Vehicle': this.vehiclesService.getVehicles().find(element => element.id === el.employeeId)?.plateNumber || 'Deleted Vehicle',
        'Start Date': DateTime.fromMillis(el.startDate).toFormat('dd-MM-yyyy') || '-',
        'End Date': DateTime.fromMillis(el.endDate).toFormat('dd-MM-yyyy') || '-',
        'Start Location': el.startLocation || '-',
        'End Location': el.endLocation || '-',
        'Distance': el.distance || '-'
      }
    })
  }

  refactorHistory(data: History[]) {
    return data.map(el => {
      return {
        'User': el.user || '-',
        'Action': formatActionString(el.action) || '-',
        'Entity': formatEntityString(el.entity) || '-',
        'Resource': el.resource || '-',
        'Date': DateTime.fromMillis(el.date).toFormat('dd-MM-yyyy') || '-',
      }
    })
  }

  export(data: any[], fileName: string = 'export') {
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
  }
}
