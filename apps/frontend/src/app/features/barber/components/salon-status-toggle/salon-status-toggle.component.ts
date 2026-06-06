import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-salon-status-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './salon-status-toggle.component.html',
  styleUrls: ['./salon-status-toggle.component.scss'],
})
export class SalonStatusToggleComponent {
  @Input() isOpen = false;
  @Input() lastUpdated: string | null = null;
  @Input() disabled = false;
  @Output() toggle = new EventEmitter<void>();
}
