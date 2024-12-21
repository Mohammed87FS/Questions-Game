// src/app/components/quiz/question.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent {
  @Input() question: any;
  @Output() answerSelected = new EventEmitter<number>();

  selectAnswer(index: number) {
    this.answerSelected.emit(index);
  }
}
