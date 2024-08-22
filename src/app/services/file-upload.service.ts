import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private cloudinaryUrl = 'https://api.cloudinary.com/v1_1/digssbgxf/upload'; // URL-ul Cloudinary
  private uploadPreset = 'vehicle_management_system'; // Preset-ul de upload Cloudinary

  constructor(private http: HttpClient) { }

  /**
   * Generează un fișier Excel din date și îl încarcă la Cloudinary.
   * @param data - Array de obiecte pentru generarea fișierului Excel
   * @returns Observable care emite URL-ul fișierului încărcat
   */
  generateAndUploadExcel(data: any[]): Observable<any> {
    const excelBuffer: ArrayBuffer = this.generateExcelBuffer(data);
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const formData = new FormData();
    formData.append('file', blob, 'file.xlsx'); // Adaugă Blob-ul cu un nume de fișier
    formData.append('upload_preset', this.uploadPreset); // Adaugă presetul de upload

    return this.http.post<any>(this.cloudinaryUrl, formData);
  }

  /**
   * Generează un buffer Excel din date.
   * @param data - Array de obiecte pentru generarea fișierului Excel
   * @returns ArrayBuffer care reprezintă fișierul Excel
   */
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
}
