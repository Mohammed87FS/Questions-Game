import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="question-wrapper" *ngIf="question">
      <h2>{{ question.question }}</h2>
      <div class="options-list">
        <button
          class="option-button"
          *ngFor="let opt of displayOptions; let i = index"
          (click)="selectAnswer(i)"
        >
          {{ opt }}
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./question.component.css']
})
export class QuestionComponent {
  @Input() question: any;
  @Input() filteredOptions: string[] | null = null; // used for 50/50

  @Output() answerSelected = new EventEmitter<number>();

  get displayOptions(): string[] {
    // If we have 50/50 filteredOptions, show them
    if (this.filteredOptions && this.filteredOptions.length > 0) {
      return this.filteredOptions;
    }
    // Otherwise, show the original 4 question options
    return this.question?.options || [];
  }

  selectAnswer(index: number) {
    this.answerSelected.emit(index);
  }
}
