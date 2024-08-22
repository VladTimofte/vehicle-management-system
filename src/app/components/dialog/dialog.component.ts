import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialog',
  standalone: true,
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  imports: [CommonModule, MatIconModule, FormsModule, ReactiveFormsModule]
})
export class DialogComponent implements OnInit {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() type: string = 'info'; // info, warning, error, question, email

  @Output() isDialogConfirmed = new EventEmitter<any>();

  modalForm: FormGroup;
  selectedDocumentType!: string;

  constructor(private fb: FormBuilder) {
    this.modalForm = this.fb.group({
      sendTo: ['', [Validators.required, Validators.email]],
      messageInput: ['', Validators.required],
      documentType: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    this.modalForm.patchValue({
      messageInput: "Hello, I'm sending you the below NTT Data's document. Please click the below link in order to download it"
    });
  }

  confirm() {
    this.isDialogConfirmed.emit(true);
  }

  cancel() {
    this.isDialogConfirmed.emit(false);
  }

  onSelectDocumentType(type: string) {
    this.selectedDocumentType = type;
    this.modalForm.patchValue({
      documentType: type
    });
  }

  onSendEmail() {

    if (this.modalForm.valid) {
      this.isDialogConfirmed.emit(this.modalForm.value);
    } else {
      this.modalForm.markAllAsTouched();
    }

  }

}
