import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="popup-overlay" *ngIf="visible">
      <div class="popup-content">
        <h2>{{ title }}</h2>
        <p>{{ content }}</p>

        <!-- If pollData is present, display bar chart -->
        <div class="poll-container" *ngIf="pollData">
          <div
            class="poll-row"
            *ngFor="let p of pollData; let i = index"
          >
            <span class="poll-label">Option {{ p.optionIndex + 1 }}:</span>
            <div class="poll-bar" [style.width.%]="p.percentage">
              {{ p.percentage }}%
            </div>
          </div>
        </div>

        <button class="close-button" (click)="close()">Close</button>
      </div>
    </div>
  `,
  styleUrls: ['./popup.component.css']
})
export class PopupComponent {
  @Input() visible = false;
  @Input() title = '';
  @Input() content = '';

  // For showing audience poll data
  @Input() pollData: { optionIndex: number; percentage: number }[] | null = null;

  @Output() closePopup = new EventEmitter<void>();

  close() {
    this.closePopup.emit();
  }
}
