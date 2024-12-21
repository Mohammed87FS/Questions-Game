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
          [ngClass]="getOptionClass(i)"
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
  @Input() filteredOptions: string[] | null = null;

  // These come from QuizComponent
  @Input() selectedIndex: number | null = null;
  @Input() pendingCheck = false;
  @Input() showResult = false;
  @Input() correctAnswerSelected = false;

  @Output() answerSelected = new EventEmitter<number>();

  get displayOptions(): string[] {
    if (this.filteredOptions && this.filteredOptions.length > 0) {
      return this.filteredOptions;
    }
    return this.question?.options || [];
  }

  selectAnswer(index: number) {
    this.answerSelected.emit(index);
  }

  getOptionClass(i: number): string {
    // No selection yet
    if (this.selectedIndex === null) return '';

    // If user clicked this option, but we haven't revealed correct/wrong yet
    if (this.pendingCheck && i === this.selectedIndex) {
      return 'selected-pending'; // e.g. orange
    }

    // If we are revealing correct/wrong, check if this was the selected one
    if (this.showResult && i === this.selectedIndex) {
      // If user’s selection was correct, highlight green, otherwise red
      return this.correctAnswerSelected ? 'correct-answer' : 'wrong-answer';
    }

    return '';
  }
}
