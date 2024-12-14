import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { QuestionsService } from '../../services/questions.service';

declare var YT: any; // Declare YT for YouTube API

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  playerStart: any;
  playerSuspense: any;
  playerWrong: any;
  playerWaiting: any;
  playerCorrect: any;

  allQuestions: any[] = [];
  selectedQuestions: any[] = [];
  currentQuestionIndex: number = 0;
  gameOver: boolean = false;
  totalQuestions: number = 15;

  // State variables for answer checking and UI feedback
  selectedIndex: number | null = null;
  pendingCheck: boolean = false;
  showResult: boolean = false;
  correctAnswerSelected: boolean = false;

  constructor(
    private questionsService: QuestionsService,
    @Inject(PLATFORM_ID) private platformId: Object // Inject platform ID
  ) {}

  ngOnInit(): void {
    this.allQuestions = this.questionsService.getAllQuestions();
    this.selectedQuestions = this.shuffleArray(this.allQuestions).slice(0, this.totalQuestions);
  
    if (isPlatformBrowser(this.platformId)) {
      this.loadYouTubeAPI();
    }
  }
  
  loadYouTubeAPI() {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    document.body.appendChild(script);

    (window as any).onYouTubeIframeAPIReady = () => {
      this.setupPlayers();
    };
  }

  setupPlayers() {
    if (typeof YT === 'undefined' || !YT.Player) {
      console.error('YouTube IFrame API not loaded');
      return;
    }
    this.playerStart = new YT.Player('playerStart', { videoId: 'XSH3x22jorM', playerVars: { autoplay: 0, controls: 0 } });
    this.playerSuspense = new YT.Player('playerSuspense', { videoId: 'sMNYHiV68AM', playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: 'sMNYHiV68AM' } });
    this.playerWrong = new YT.Player('playerWrong', { videoId: 'abZSVXO3XZE', playerVars: { autoplay: 0, controls: 0 } });
    this.playerWaiting = new YT.Player('playerWaiting', { videoId: 'x4eMmc9d8vk', playerVars: { autoplay: 0, controls: 0 } });
    this.playerCorrect = new YT.Player('playerCorrect', { videoId: '8d7hfOtKItw', playerVars: { autoplay: 0, controls: 0 } });
  }


  playStartAudio() {
    if (!this.playerStart) {
      this.playerStart = new YT.Player('playerStart', { videoId: 'XSH3x22jorM', playerVars: { autoplay: 0, controls: 0 } });
    }
    this.stopAllAudio();
    this.playerStart?.playVideo();
  }


  playSuspenseAudio() {
    if (!this.playerSuspense) {
      this.playerSuspense = new YT.Player('playerSuspense', { videoId: 'sMNYHiV68AM', playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: 'sMNYHiV68AM' } });
    }
    this.stopAllAudio();
    this.playerSuspense?.playVideo();
  }
  

  playWrongAudio() {
    this.stopAllAudio();
    this.playerWrong?.playVideo();
  }

  playWaitingAudio() {
    this.stopAllAudio();
    this.playerWaiting?.playVideo();
  }

  playCorrectAudio() {
    this.stopAllAudio();
    this.playerCorrect?.playVideo();
  }

  stopAllAudio() {
    this.playerStart?.stopVideo();
    this.playerSuspense?.stopVideo();
    this.playerWrong?.stopVideo();
    this.playerWaiting?.stopVideo();
    this.playerCorrect?.stopVideo();
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
    this.selectedIndex = index;
    this.pendingCheck = true;
    this.showResult = false;
    this.correctAnswerSelected = false;

    setTimeout(() => {
      this.revealAnswer();
    }, 5000);
  }

  revealAnswer() {
    // Check if the chosen answer is correct
    const chosenOption = this.currentQuestion.options[this.selectedIndex!];
    this.correctAnswerSelected = (chosenOption === this.currentQuestion.answer);
  
    this.pendingCheck = false;
    this.showResult = true;
  
    // Highlight the correct answer and the wrong answer (if applicable)
    const quizContainer = document.querySelector('.quiz-container');
    const buttons = quizContainer?.querySelectorAll('button');
  
    // Find the correct answer's index
    const correctIndex = this.currentQuestion.options.findIndex(
      (option: string) => option === this.currentQuestion.answer
    );
  
    if (buttons) {
      // Highlight correct answer in green
      if (correctIndex !== -1) {
        buttons[correctIndex].classList.add('correct-answer');
      }
  
      // Highlight the wrong answer in red (only if the answer is incorrect)
      if (!this.correctAnswerSelected && this.selectedIndex !== null) {
        buttons[this.selectedIndex].classList.add('wrong-answer');
      }
    }
  
    // After showing the green/red feedback for 2 seconds, proceed
    setTimeout(() => {
      this.endQuestion();
    }, 4000);
  }
  
  
  highlightCorrectAnswer(correctIndex: number) {
    const quizContainer = document.querySelector('.quiz-container'); // Restrict to the current container
    const correctButton = quizContainer?.querySelectorAll('button')[correctIndex];
    if (correctButton) {
      correctButton.classList.add('correct-answer');
    }
  }
  
  
  endQuestion() {
    if (this.correctAnswerSelected) {
      this.currentQuestionIndex++;
      if (this.currentQuestionIndex >= this.totalQuestions) {
        this.gameOver = true;
      }
    } else {
      this.gameOver = true;
    }
  
    // Reset states
    this.selectedIndex = null;
    this.showResult = false;
  
    // Remove highlights for the next question
    const quizContainer = document.querySelector('.quiz-container');
    quizContainer?.querySelectorAll('button').forEach((btn) => {
      btn.classList.remove('correct-answer', 'wrong-answer');
    });
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
