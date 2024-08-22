import { Injectable } from '@angular/core';
import { init, send } from '@emailjs/browser';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private serviceId = 'service_tpa25u4'; 
  private templateId = 'template_njbew1g'; 
  private publicKey = '8AGnXOW-H-n9Ufakl';
  constructor() {
    // Inițializează EmailJS cu cheia publică
    init(this.publicKey);
  }

  /**
   * Trimite un email folosind EmailJS.
   * @param emailParams Obiect care conține parametrii emailului (ex: destinatari, subiect, mesaj, etc.)
   * @returns O promisiune care se rezolvă când emailul este trimis
   */
  sendEmail(emailParams: any): Promise<any> {
    return send(this.serviceId, this.templateId, emailParams)
      .then(response => {
        console.log('Email sent successfully!', response.status, response.text);
      })
      .catch(error => {
        console.error('Failed to send email:', error);
      });
  }
}
