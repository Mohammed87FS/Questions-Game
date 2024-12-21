import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="question-wrapper" *ngIf="question">
      <h2 class="question-text">{{ question.question }}</h2>
      <div class="options-list" *ngIf="showOptions">
        <button
          class="option-button"
          *ngFor="let opt of displayOptions; let i = index"
          (click)="selectAnswer(i)"
          [ngClass]="getOptionClass(i)"
          [style.animationDelay]="getAnimationDelay(i)"
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

  @Input() selectedIndex: number | null = null;
  @Input() pendingCheck = false;
  @Input() showResult = false;
  @Input() correctAnswerSelected = false;
  @Input() correctIndex: number | null = null;

  @Output() answerSelected = new EventEmitter<number>();

  showOptions = false; // Define `showOptions` and initialize it to false

  private baseAnimationDelay = 1; // Delay between options (in seconds)

  ngOnInit(): void {
    // Optionally, delay showing the options for an animated effect
    setTimeout(() => {
      this.showOptions = true; // Reveal options after a short delay
    }, 1000); // Adjust the delay (in milliseconds) as needed
  }

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
    if (this.selectedIndex === null) return '';
    if (this.pendingCheck && i === this.selectedIndex) {
      return 'selected-pending';
    }
    if (this.showResult) {
      if (i === this.selectedIndex) {
        return this.correctAnswerSelected ? 'correct-answer' : 'wrong-answer';
      }
      if (!this.correctAnswerSelected && this.correctIndex !== null && i === this.correctIndex) {
        return 'correct-answer';
      }
    }
    return '';
  }

  getAnimationDelay(index: number): string {
    return `${index * this.baseAnimationDelay}s`; // Set delay based on the index
  }
}
