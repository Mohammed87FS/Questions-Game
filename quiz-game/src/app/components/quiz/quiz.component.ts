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
    this.playerStart = new YT.Player('playerStart', {
      videoId: 'XSH3x22jorM',
      playerVars: { autoplay: 0, controls: 0 }
    });

    this.playerSuspense = new YT.Player('playerSuspense', {
      videoId: 'sMNYHiV68AM',
      playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: 'sMNYHiV68AM' }
    });

    this.playerWrong = new YT.Player('playerWrong', {
      videoId: 'abZSVXO3XZE',
      playerVars: { autoplay: 0, controls: 0 }
    });

    this.playerWaiting = new YT.Player('playerWaiting', {
      videoId: 'x4eMmc9d8vk',
      playerVars: { autoplay: 0, controls: 0 }
    });

    this.playerCorrect = new YT.Player('playerCorrect', {
      videoId: '8d7hfOtKItw',
      playerVars: { autoplay: 0, controls: 0 }
    });
  }

  // Audio controls
  playStartAudio() {
    this.stopAllAudio();
    this.playerStart?.playVideo();
  }

  playSuspenseAudio() {
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
    const chosenOption = this.currentQuestion.options[this.selectedIndex!];
    this.correctAnswerSelected = chosenOption === this.currentQuestion.answer;

    this.pendingCheck = false;
    this.showResult = true;

    setTimeout(() => {
      if (this.correctAnswerSelected) {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex >= this.totalQuestions) {
          this.gameOver = true;
        }
      } else {
        this.gameOver = true;
      }

      this.selectedIndex = null;
      this.showResult = false;
    }, 2000);
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
