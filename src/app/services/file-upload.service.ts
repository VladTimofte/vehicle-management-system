import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private cloudinaryUrl = 'https://api.cloudinary.com/v1_1/digssbgxf/raw/upload';
  private uploadPreset = 'vehicle_management_system';

  constructor(private http: HttpClient) {}

  generateAndUploadExcel(data: any[]): Observable<any> {
    const excelBuffer: ArrayBuffer = this.generateExcelBuffer(data);
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const formData = new FormData();
    formData.append('file', blob, 'file.xlsx');
    formData.append('upload_preset', this.uploadPreset);

    return this.http.post<any>(this.cloudinaryUrl, formData);
  }

  private generateExcelBuffer(data: any[]): ArrayBuffer {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };

    return XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
  }

  generateAndUploadPdf(data: any[]): Observable<any> {
    return from(this.generatePdfBlob(data)).pipe(
      switchMap((pdfBlob) => {
        const formData = new FormData();
        formData.append('file', pdfBlob, 'file.xps');
        formData.append('upload_preset', this.uploadPreset);
        formData.append('resource_type', 'raw'); // Specificăm tipul resursei ca 'raw'

        return this.http.post<any>(this.cloudinaryUrl, formData).pipe(
          switchMap((response) => {
            console.log('Cloudinary response:', response); // Verifică răspunsul
            return from([response]);
          }),
        );
      })
    );
  }

  private generatePdfBlob(data: any[]): Promise<Blob> {
    const doc = new jsPDF({ orientation: 'landscape' });

    autoTable(doc, {
      head: [Object.keys(data[0])],
      body: data.map((item) => Object.values(item)),
    });

    return new Promise<Blob>((resolve) => {
      const arrayBuffer = doc.output('arraybuffer'); // Generăm un ArrayBuffer din PDF
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' }); // Creăm un Blob din ArrayBuffer

      resolve(blob);
    });
  }
}
