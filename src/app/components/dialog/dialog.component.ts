import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialog',
  standalone: true,
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  imports: [CommonModule, MatIconModule]
})
export class DialogComponent {
  @Input() title: string = 'Confirm Deletion';
  @Input() message: string = 'Are you sure you want to delete this item?';
  @Input() type: string = 'info'; // info, warning, error, question

  @Output() isDialogConfirmed = new EventEmitter<boolean>();

  confirm() {
    this.isDialogConfirmed.emit(true);
  }

  cancel() {
    this.isDialogConfirmed.emit(false);
  }

}
