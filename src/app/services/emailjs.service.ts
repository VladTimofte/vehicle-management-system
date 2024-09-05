import { Injectable } from '@angular/core';
import { init, send } from '@emailjs/browser';

import { APP_CONFIG } from "@src/app/config/config";

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private serviceId = APP_CONFIG.EMAIL_JS.SERVICE_ID; 
  private templateId = APP_CONFIG.EMAIL_JS.TEMPLATE_ID; 
  private publicKey = APP_CONFIG.EMAIL_JS.PUBLIC_KEY;
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
