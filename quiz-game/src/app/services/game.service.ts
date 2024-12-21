import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GameService {
  allQuestions: any[] = [];
  selectedQuestions: any[] = [];
  currentQuestionIndex = 0;
  totalQuestions = 15;
  gameOver = false;

  lifelinesUsed = {
    fiftyFifty: false,
    phoneFriend: false,
    audiencePoll: false
  };

  initGame(questions: any[]) {
    this.allQuestions = questions;
    this.selectedQuestions = this.shuffleArray(questions).slice(0, this.totalQuestions);
    this.currentQuestionIndex = 0;
    this.gameOver = false;
    this.lifelinesUsed = {
      fiftyFifty: false,
      phoneFriend: false,
      audiencePoll: false
    };
  }

  shuffleArray(arr: any[]): any[] {
    return arr.sort(() => Math.random() - 0.5);
  }

  getCurrentQuestion() {
    return this.selectedQuestions[this.currentQuestionIndex];
  }

  goToNextQuestion() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex >= this.totalQuestions) {
      this.gameOver = true;
    }
  }

  endGame() {
    this.gameOver = true;
  }
}
