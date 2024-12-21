import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="question-wrapper" *ngIf="question">
      <h2 class="question-text">{{ question.question }}</h2>
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

  /** Provided by parent (QuizComponent) */
  @Input() selectedIndex: number | null = null;
  @Input() pendingCheck = false;
  @Input() showResult = false;
  @Input() correctAnswerSelected = false;

  /**
   * New input: The actual index of the correct option (set by the parent)
   * This allows us to highlight the correct option in green, even if the user was wrong.
   */
  @Input() correctIndex: number | null = null;

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
    // If user hasn't selected anything, no special class.
    if (this.selectedIndex === null) return '';

    // Highlight the selected option in orange while we wait to reveal correctness
    if (this.pendingCheck && i === this.selectedIndex) {
      return 'selected-pending'; // e.g. orange
    }

    // If we've revealed correct/wrong:
    if (this.showResult) {
      // 1) If this index is the user's selected index
      if (i === this.selectedIndex) {
        return this.correctAnswerSelected ? 'correct-answer' : 'wrong-answer';
      }

      // 2) If user was wrong, highlight the correct option in green
      //    That means if correctIndex is known and i === correctIndex
      if (!this.correctAnswerSelected && this.correctIndex !== null && i === this.correctIndex) {
        return 'correct-answer';
      }
    }

    return '';
  }
}
