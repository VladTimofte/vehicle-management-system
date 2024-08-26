import { Injectable, inject } from '@angular/core';
import { saveAs } from 'file-saver';
import { DateTime } from 'luxon';
import { VehiclesService } from './crud/vehicles.service';
import { EmployeesService } from './crud/employees.service';
import { AllocationsService } from './crud/allocations.service';
import { HistoryService } from './crud/history.service';
import {
  generateExcell,
  generatePDF,
  refactorAllocations,
  refactorEmployees,
  refactorHistory,
  refactorVehicles,
} from '../utils/objects';
import { DialogService } from './dialog.service';
import { FileUploadService } from './file-upload.service';
import { EmailService } from './emailjs.service';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class HandleDocument {
  public auth = inject(AuthService);

  constructor(
    private vehiclesService: VehiclesService,
    private employeesService: EmployeesService,
    private allocationsService: AllocationsService,
    private historyService: HistoryService,
    private dialogService: DialogService,
    private fileUploadService: FileUploadService,
    private emailService: EmailService
  ) {}

  exportToDocument(route: string, action: string) {
    // Define a function variable and set default to exportToExcell
    let fnc = this.exportToExcell.bind(this);

    // Set the function to call based on the action
    if (action === 'pdf') {
      fnc = this.exportToPDF.bind(this);
    }
    if (action === 'send_email') {
      fnc = this.sendEmail.bind(this);
    }

    // Use a switch-case to handle different routes
    switch (route) {
      case '/vehicles':
        fnc(
          refactorVehicles(this.vehiclesService.getVehicles()),
          `Vehicles_${DateTime.now().toFormat('dd-MM-yyyy HH-mm-ss')}`,
          'VEHICLES_LIST'
        );
        break;
      case '/employees':
        fnc(
          refactorEmployees(this.employeesService.getEmployees()),
          `Employees_${DateTime.now().toFormat('dd-MM-yyyy HH-mm-ss')}`,
          'EMPLOYEES_LIST'
        );
        break;
      case '/allocations':
        fnc(
          refactorAllocations(
            this.allocationsService.getAllocations(),
            this.employeesService.getEmployees(),
            this.vehiclesService.getVehicles()
          ),
          `Allocations_${DateTime.now().toFormat('dd-MM-yyyy HH-mm-ss')}`,
          'ALLOCATIONS_LIST'
        );
        break;
      case '/history':
        fnc(
          refactorHistory(this.historyService.getHistory()),
          `History_${DateTime.now().toFormat('dd-MM-yyyy HH-mm-ss')}`,
          'HISTORY_LIST'
        );
        break;
      default:
        console.error('Invalid route');
    }
  }

  exportToExcell(data: any[], fileName: any = 'data', entity: string) {
    if (data.length > 0) {
      this.historyService.addHistory({
        id: uuidv4(),
        user: this.auth.getUserProfile()?.name as string,
        action: 'DOWNLOAD',
        entity,
        resource: 'EXCELL',
        date: DateTime.now().toMillis(),
      });
      saveAs(generateExcell(data), `${fileName}.xlsx`);
    } else {
      this.dialogService.openConfirmDialog({
        title: 'Cannot download',
        message: 'Cannot generate excell file, since there is no data',
        type: 'info',
      });
    }
  }

  exportToPDF(data: any[], fileName: any = 'data', entity: string) {
    // Check if there's data to export
    if (data.length > 0) {
      generatePDF(data).save(`${fileName}.pdf`);
      this.historyService.addHistory({
        id: uuidv4(),
        user: this.auth.getUserProfile()?.name as string,
        action: 'DOWNLOAD',
        entity,
        resource: 'PDF',
        date: DateTime.now().toMillis(),
      });
    } else {
      
      this.dialogService.openConfirmDialog({
        title: 'Cannot download',
        message: 'Cannot generate PDF file, since there is no data',
        type: 'info',
      });
    }
  }

  sendEmail(data: any[], fileName: any = 'data', entity: string) {
    if (data.length > 0) {
      this.dialogService
        .openConfirmDialog({
          title: 'Send Email',
          message: '',
          type: 'email',
        })
        .then((response) => {
          if (response.documentType === 'excell') {
            this.fileUploadService
              .generateAndUploadExcel(data)
              .subscribe((fileUploadedRes) => {
                this.emailService.sendEmail({
                  to_email: response.sendTo,
                  message: response.messageInput,
                  link_url: fileUploadedRes.secure_url,
                });
                this.historyService.addHistory({
                  id: uuidv4(),
                  user: this.auth.getUserProfile()?.name as string,
                  action: 'EMAIL',
                  entity,
                  resource: `${response.sendTo} | EXCELL`,
                  date: DateTime.now().toMillis(),
                });
              });
          }
          if (response.documentType === 'pdf') {
            this.fileUploadService
            .generateAndUploadPdf(data)
            .subscribe((fileUploadedRes) => {
              this.emailService.sendEmail({
                to_email: response.sendTo,
                message: response.messageInput,
                link_url: fileUploadedRes.secure_url,
              });
              this.historyService.addHistory({
                id: uuidv4(),
                user: this.auth.getUserProfile()?.name as string,
                action: 'EMAIL',
                entity,
                resource: `${response.sendTo} | PDF`,
                date: DateTime.now().toMillis(),
              });
            });
          }
        });
    } else {
      this.dialogService.openConfirmDialog({
        title: 'Cannot send email',
        message: 'Cannot send file via email, since there is no data',
        type: 'info',
      });
    }
  }
}
