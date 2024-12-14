import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionsService } from '../../services/questions.service';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  allQuestions: any[] = [];
  selectedQuestions: any[] = [];
  currentQuestionIndex: number = 0;
  gameOver: boolean = false;
  totalQuestions: number = 15;

  constructor(private questionsService: QuestionsService) {}

  ngOnInit(): void {
    this.allQuestions = this.questionsService.getAllQuestions();
    this.selectedQuestions = this.shuffleArray(this.allQuestions).slice(0, this.totalQuestions);
  }

  shuffleArray(array: any[]): any[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  get currentQuestion() {
    return this.selectedQuestions[this.currentQuestionIndex];
  }

  selectAnswer(option: string) {
    if (option === this.currentQuestion.answer) {
      this.currentQuestionIndex++;
      if (this.currentQuestionIndex >= this.totalQuestions) {
        this.gameOver = true;
      }
    } else {
      this.gameOver = true;
    }
  }

  restart() {
    this.gameOver = false;
    this.currentQuestionIndex = 0;
    this.selectedQuestions = this.shuffleArray(this.allQuestions).slice(0, this.totalQuestions);
  }
}
