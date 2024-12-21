// src/app/components/quiz/quiz.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../services/audio.service';
import { GameService } from '../../services/game.service';
import { QuestionsService } from '../../services/questions.service';
import { QuestionComponent } from '../question/question.component';
import { PopupComponent } from '../popup/popup.component';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule,
    QuestionComponent,  // we use <app-question> in the template
    PopupComponent      // we use <app-popup> in the template
  ],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  showPopup = false;
  popupTitle = '';
  popupContent = '';

  pendingCheck = false;
  showResult = false;
  correctAnswerSelected = false;

  constructor(
    public gameService: GameService,
    private audioService: AudioService,
    private questionsService: QuestionsService
  ) {}

  ngOnInit(): void {
    const allQuestions = this.questionsService.getAllQuestions();
    this.gameService.initGame(allQuestions);
    this.audioService.playAudio('start');
  }

  onAnswerSelected(selectedIndex: number) {
    this.pendingCheck = true;

    setTimeout(() => {
      const currentQ = this.gameService.getCurrentQuestion();
      if (!currentQ) return;

      const chosenOption = currentQ.options[selectedIndex];
      this.correctAnswerSelected = (chosenOption === currentQ.answer);

      this.pendingCheck = false;
      this.showResult = true;

      if (this.correctAnswerSelected) {
        this.audioService.playAudio('correct');
      } else {
        this.audioService.playAudio('wrong');
      }

      setTimeout(() => this.endQuestion(), 2000);
    }, 3000);
  }

  endQuestion() {
    if (this.correctAnswerSelected) {
      this.gameService.goToNextQuestion();
      if (this.gameService.gameOver) {
        // game finished
      }
    } else {
      this.gameService.endGame();
    }
    this.showResult = false;
    this.correctAnswerSelected = false;
  }

  usePhoneFriend() {
    if (this.gameService.lifelinesUsed.phoneFriend) return;
    this.gameService.lifelinesUsed.phoneFriend = true;

    const currentQ = this.gameService.getCurrentQuestion();
    if (!currentQ) return;

    const correctIndex = currentQ.options.findIndex(
      (opt: string) => opt === currentQ.answer
    );

    this.popupTitle = '📞 الاتصال بصديق';
    this.popupContent = `يقول صديقك إن الإجابة هي الخيار رقم ${correctIndex + 1}`;
    this.showPopup = true;
    this.audioService.playAudio('gaveAnswer');
  }

  closePopup() {
    this.showPopup = false;
    this.popupTitle = '';
    this.popupContent = '';
  }

  restart() {
    this.gameService.initGame(this.questionsService.getAllQuestions());
    this.audioService.playAudio('start');
  }
}
