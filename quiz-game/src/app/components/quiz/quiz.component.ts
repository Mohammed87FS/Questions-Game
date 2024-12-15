import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';

declare global {
  interface Window {
    YT: any;
  }
}
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { QuestionsService } from '../../services/questions.service';

declare var YT: any;

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
  showPopup: boolean = false;
  popupTitle: string = '';
  popupContent: string = '';
  displayedOptions: string[] = [];
  allQuestions: any[] = [];
  selectedQuestions: any[] = [];
  currentQuestionIndex: number = 0;
  gameOver: boolean = false;
  totalQuestions: number = 15;

  lifelinesUsed = { fiftyFifty: false, phoneFriend: false, audiencePoll: false };
  selectedIndex: number | null = null;
  pendingCheck: boolean = false;
  showResult: boolean = false;
  correctAnswerSelected: boolean = false;

  constructor(
    private questionsService: QuestionsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.allQuestions = this.questionsService.getAllQuestions();
    this.selectedQuestions = this.shuffleArray(this.allQuestions).slice(0, this.totalQuestions);
    this.loadCurrentQuestion();

    if (isPlatformBrowser(this.platformId)) this.loadYouTubeAPI();
  }

  loadYouTubeAPI() {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    document.body.appendChild(script);

    (window as any).onYouTubeIframeAPIReady = () => {
      if (window.YT) this.setupPlayers();
    };
  }

  setupPlayers() {
    this.playerStart = new YT.Player('playerStart', { videoId: 'XSH3x22jorM', playerVars: { autoplay: 0, controls: 0 } });
    this.playerSuspense = new YT.Player('playerSuspense', { videoId: 'sMNYHiV68AM', playerVars: { autoplay: 0, controls: 0, loop: 1 } });
    this.playerWrong = new YT.Player('playerWrong', { videoId: 'abZSVXO3XZE', playerVars: { autoplay: 0, controls: 0 } });
    this.playerWaiting = new YT.Player('playerWaiting', { videoId: 'x4eMmc9d8vk', playerVars: { autoplay: 0, controls: 0 } });
    this.playerCorrect = new YT.Player('playerCorrect', { videoId: '8d7hfOtKItw', playerVars: { autoplay: 0, controls: 0 } });
  }

  loadCurrentQuestion() {
    this.displayedOptions = [...this.currentQuestion.options];
  }

  get currentQuestion() {
    return this.selectedQuestions[this.currentQuestionIndex];
  }

  selectAnswer(index: number) {
    this.selectedIndex = index;
    this.pendingCheck = true;

    setTimeout(() => this.revealAnswer(), 5000);
  }

  revealAnswer() {
    const chosenOption = this.currentQuestion.options[this.selectedIndex!];
    this.correctAnswerSelected = chosenOption === this.currentQuestion.answer;

    this.pendingCheck = false;
    this.showResult = true;

    const correctIndex = this.currentQuestion.options.findIndex(
      (option: string) => option === this.currentQuestion.answer
    );

    setTimeout(() => this.endQuestion(correctIndex), 4000);
  }

  endQuestion(correctIndex: number) {
    if (!this.correctAnswerSelected) {
      this.highlightCorrectAnswer(correctIndex);
    }

    setTimeout(() => {
      if (this.correctAnswerSelected) {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex >= this.totalQuestions) this.gameOver = true;
      } else {
        this.gameOver = true;
      }

      this.resetState();
    }, 2000);
  }

  highlightCorrectAnswer(correctIndex: number) {
    const quizContainer = document.querySelector('.quiz-container');
    const correctButton = quizContainer?.querySelectorAll('button')[correctIndex];
    correctButton?.classList.add('correct-answer');
  }

  resetState() {
    this.selectedIndex = null;
    this.showResult = false;
    this.loadCurrentQuestion();
    document.querySelectorAll('button').forEach((btn) => btn.classList.remove('correct-answer', 'wrong-answer'));
  }

  useFiftyFifty() {
    if (this.lifelinesUsed.fiftyFifty) return;
    this.lifelinesUsed.fiftyFifty = true;

    const incorrectOptions = this.displayedOptions.filter(
      (opt) => opt !== this.currentQuestion.answer
    );
    while (incorrectOptions.length > 1) incorrectOptions.splice(Math.floor(Math.random() * incorrectOptions.length), 1);

    this.displayedOptions = [...incorrectOptions, this.currentQuestion.answer].sort(() => Math.random() - 0.5);
  }
  usePhoneFriend() {
    if (this.lifelinesUsed.phoneFriend) return;
    this.lifelinesUsed.phoneFriend = true;
  
    const advice = Math.random() < 0.9 ? this.currentQuestion.answer : this.getRandomIncorrectOption();
    this.popupTitle = 'اتصل بصديق';
    this.popupContent = `<p>صديقك يقترح أن الإجابة الصحيحة هي: <strong>${advice}</strong></p>`;
    this.showPopup = true;
  }
  useAudiencePoll() {
    if (this.lifelinesUsed.audiencePoll) return;
    this.lifelinesUsed.audiencePoll = true;
  
    const pollResults = this.generateAudiencePoll(this.currentQuestion.answer);
    this.popupTitle = 'نتيجة تصويت الجمهور';
  
    // Generate simple bar graph HTML dynamically
    const graphHtml = pollResults
      .map(
        (result) =>
          `<div style="margin: 5px 0;">
            <strong>${result.option}:</strong>
            <div style="background: #2196F3; height: 20px; width: ${result.percentage}%;">
            </div>
            <span>${result.percentage}%</span>
          </div>`
      )
      .join('');
  
    this.popupContent = graphHtml;
    this.showPopup = true;
  }
  closePopup() {
    this.showPopup = false;
    this.popupTitle = '';
    this.popupContent = '';
  }
  
  // Simulated poll generation
  generateAudiencePoll(correctOption: string) {
    const options = this.displayedOptions.map((option) => ({
      option,
      percentage: option === correctOption ? Math.floor(Math.random() * 50 + 50) : Math.floor(Math.random() * 30),
    }));
  
    // Normalize percentages to 100%
    const totalPercentage = options.reduce((sum, curr) => sum + curr.percentage, 0);
    options.forEach((option) => (option.percentage = Math.round((option.percentage / totalPercentage) * 100)));
  
    return options;
  }
  
  getRandomIncorrectOption(): string {
    const incorrectOptions = this.displayedOptions.filter((opt) => opt !== this.currentQuestion.answer);
    return incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
  }

  
  
  
  restart() {
    this.gameOver = false;
    this.currentQuestionIndex = 0;
    this.selectedQuestions = this.shuffleArray(this.allQuestions).slice(0, this.totalQuestions);
    this.resetState();
  }

  shuffleArray(array: any[]): any[] {
    return array.sort(() => Math.random() - 0.5);
  }
}
