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

  // New state variables
  selectedIndex: number | null = null; // which option was selected
  pendingCheck: boolean = false;        // true while waiting the 5 seconds
  showResult: boolean = false;          // true when revealing correctness
  correctAnswerSelected: boolean = false; // was the selected answer correct?

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

  selectAnswer(index: number) {
    // User clicked an option
    this.selectedIndex = index;
    this.pendingCheck = true;  // Turn button orange immediately
    this.showResult = false; 
    this.correctAnswerSelected = false;

    // After 5 seconds, check correctness
    setTimeout(() => {
      this.revealAnswer();
    }, 5000);
  }

  revealAnswer() {
    // Now we decide if correct or not
    const chosenOption = this.currentQuestion.options[this.selectedIndex!];
    if (chosenOption === this.currentQuestion.answer) {
      this.correctAnswerSelected = true;   // Will turn the button green
    } else {
      this.correctAnswerSelected = false;  // Will turn the button red
    }

    this.pendingCheck = false;
    this.showResult = true;

    // If correct, move to next question after a short delay
    // If not correct, game over
    setTimeout(() => {
      if (this.correctAnswerSelected) {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex >= this.totalQuestions) {
          this.gameOver = true;
        }
      } else {
        this.gameOver = true;
      }

      // Reset states for next question or for game over screen
      this.selectedIndex = null;
      this.showResult = false;
    }, 2000); // 2 seconds to show green/red before proceeding
  }

  restart() {
    this.gameOver = false;
    this.currentQuestionIndex = 0;
    this.selectedQuestions = this.shuffleArray(this.allQuestions).slice(0, this.totalQuestions);
    this.selectedIndex = null;
    this.pendingCheck = false;
    this.showResult = false;
    this.correctAnswerSelected = false;
  }
}
