import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { QuestionsService } from '../../services/questions.service';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  // Audio elements
  audioStart: HTMLAudioElement | null = null;
  audioCorrect: HTMLAudioElement | null = null;
  audioWrong: HTMLAudioElement | null = null;
  audioGaveAnswer: HTMLAudioElement | null = null;

  showPopup: boolean = false;
  popupTitle: string = '';
  popupAnswer: string = '';
  popupContent: string = '';
  popupType: string = '';

  audiencePollData: { optionNumber: string; percentage: number }[] = [];

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

    if (isPlatformBrowser(this.platformId)) this.setupAudio();
  }

  // Set up audio elements
  setupAudio(): void {
    this.audioStart = new Audio('assets/audio/start_question.mp3');
    this.audioCorrect = new Audio('assets/audio/correct.m4a');
    this.audioWrong = new Audio('assets/audio/loss.m4a');
    this.audioGaveAnswer = new Audio('assets/audio/gave_answer.m4a');
  }

  playAudio(type: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.stopAllAudio();
    switch (type) {
      case 'start':
        this.audioStart?.play();
        break;
      case 'correct':
        this.audioCorrect?.play();
        break;
      case 'wrong':
        this.audioWrong?.play();
        break;
      case 'gaveAnswer':
        this.audioGaveAnswer?.play();
        break;
    }
  }

  stopAllAudio(): void {
    [this.audioStart, this.audioCorrect, this.audioWrong, this.audioGaveAnswer].forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }

  loadCurrentQuestion() {
    this.displayedOptions = [...this.currentQuestion.options];
    this.playAudio('start'); // Play the start question sound
  }

  get currentQuestion() {
    return this.selectedQuestions[this.currentQuestionIndex];
  }

  selectAnswer(index: number) {
    this.selectedIndex = index;
    this.pendingCheck = true;

    setTimeout(() => this.revealAnswer(), 3000);
  }

  revealAnswer() {
    const chosenOption = this.currentQuestion.options[this.selectedIndex!];
    this.correctAnswerSelected = chosenOption === this.currentQuestion.answer;

    this.pendingCheck = false;
    this.showResult = true;

    if (this.correctAnswerSelected) {
      this.playAudio('correct'); // Play correct answer sound
    } else {
      this.playAudio('wrong'); // Play wrong answer sound
    }

    setTimeout(() => this.endQuestion(), 4000);
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

    this.resetState();
  }

  resetState() {
    this.selectedIndex = null;
    this.showResult = false;
    this.loadCurrentQuestion();
  }

  useFiftyFifty() {
    if (this.lifelinesUsed.fiftyFifty) return;
    this.lifelinesUsed.fiftyFifty = true;

    const incorrectOptions = this.displayedOptions.filter(
      (opt) => opt !== this.currentQuestion.answer
    );

    while (incorrectOptions.length > 1) {
      incorrectOptions.splice(Math.floor(Math.random() * incorrectOptions.length), 1);
    }

    this.displayedOptions = [...incorrectOptions, this.currentQuestion.answer].sort(
      () => Math.random() - 0.5
    );
  }

  usePhoneFriend() {
    if (this.lifelinesUsed.phoneFriend) return;
    this.lifelinesUsed.phoneFriend = true;

    const correctIndex = this.currentQuestion.options.findIndex(
      (opt: string) => opt === this.currentQuestion.answer
    );

    this.popupType = 'phoneFriend';
    this.popupTitle = '📞 الاتصال بصديق';
    this.popupContent = `: أعتقد أن الإجابة الصحيحة هي الخيار `;
    this.popupAnswer = ` (${correctIndex + 1}) `;
    this.showPopup = true;
    this.playAudio('gaveAnswer'); // Play gave answer sound
  }

  useAudiencePoll() {
    if (this.lifelinesUsed.audiencePoll) return;
    this.lifelinesUsed.audiencePoll = true;

    const correctIndex = this.currentQuestion.options.findIndex(
      (opt: string) => opt === this.currentQuestion.answer
    );

    this.audiencePollData = this.currentQuestion.options.map((_: any, i: number) => {
      return {
        optionNumber: `${i + 1}`,
        percentage: Math.floor(Math.random() * 60) + 10,
      };
    });

    this.audiencePollData[correctIndex].percentage = Math.max(
      ...this.audiencePollData.map((data) => data.percentage)
    );

    const total = this.audiencePollData.reduce((sum, item) => sum + item.percentage, 0);
    this.audiencePollData.forEach((item) => {
      item.percentage = Math.round((item.percentage / total) * 100);
    });

    this.popupType = 'audiencePoll';
    this.popupTitle = '👥 تصويت الجمهور';
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.popupTitle = '';
    this.popupContent = '';
    this.popupType = '';
  }

  restart() {
    this.gameOver = false;
    this.currentQuestionIndex = 0;
    this.selectedQuestions = this.shuffleArray(this.allQuestions).slice(0, this.totalQuestions);
    this.resetState();
    this.playAudio('start'); // Play start sound on restart
  }

  shuffleArray(array: any[]): any[] {
    return array.sort(() => Math.random() - 0.5);
  }
}
