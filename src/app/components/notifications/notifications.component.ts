import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Notification } from '@src/app/models/notifications';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent {
  @Input({ required: true }) display: boolean = false;
  @Input({ required: true }) notifications: Notification[] = [];

  closeNotifications() {
    this.display = false
  }
}
