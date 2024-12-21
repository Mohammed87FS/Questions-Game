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
    QuestionComponent,  // displays question
    PopupComponent      // displays a popup (for phone friend, audience poll, etc.)
  ],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {

  gameStarted = false;


  allQuestions: any[] = [];

  // Popup states
  showPopup = false;
  popupTitle = '';
  popupContent = '';

  // 50/50: store the reduced set of options
  filteredOptions: string[] | null = null;

  // Audience Poll: store the poll data
  pollData: { optionIndex: number; percentage: number }[] | null = null;

  // Basic question/score tracking
  selectedIndex: number | null = null;
  pendingCheck = false;           
  showResult = false;            
  correctAnswerSelected = false; 
  currentQuestionNumber = 1; 
  correctIndex: number | null = null;
  totalCorrect = 0;          

  constructor(
    public gameService: GameService,
    private audioService: AudioService,
    private questionsService: QuestionsService
  ) {}

  ngOnInit(): void {
    // 1) Load from QuestionsService
    this.allQuestions = this.questionsService.getAllQuestions();  // <— Key fix

  }

  onStartGame() {
    // Shuffle the options for each question if you want random answer orders
    this.shuffleAllQuestions();

    // Now actually initialize the game
    this.gameService.initGame(this.allQuestions);

    // User has started => reveal the quiz
    this.gameStarted = true;

    // Because the user clicked "Start," we can now safely try to play audio
    this.audioService.playAudio('start');

    // Set initial question number etc.
    this.currentQuestionNumber = this.gameService.currentQuestionIndex + 1;
    this.totalCorrect = 0;
  }

  shuffleAllQuestions() {
    for (const q of this.allQuestions) {
      q.options = this.shuffleArray(q.options);
    }
  }
  private shuffleArray<T>(arr: T[]): T[] {
    return arr.sort(() => Math.random() - 0.5);
  }

  onAnswerSelected(index: number) {
    this.selectedIndex = index;
    this.pendingCheck = true;
    this.audioService.playAudio('gaveAnswer');

    setTimeout(() => {
      const currentQ = this.gameService.getCurrentQuestion();
      if (!currentQ) return;

      // Find out which option is correct
      this.correctIndex = currentQ.options.findIndex((opt: string) => opt === currentQ.answer);

      const chosenOption = currentQ.options[index];
      this.correctAnswerSelected = (chosenOption === currentQ.answer);

      // Reveal correct/wrong
      this.pendingCheck = false;
      this.showResult = true;

      if (this.correctAnswerSelected) {
        this.audioService.playAudio('correct');
        this.totalCorrect++;
      } else {
        this.audioService.playAudio('wrong');
      }

      setTimeout(() => this.endQuestion(), 5000);
    }, 5000);
  }

  endQuestion() {
    if (this.correctAnswerSelected) {
      this.gameService.goToNextQuestion();
      if (this.gameService.gameOver) {
        // game finished
      } else {
        this.currentQuestionNumber = this.gameService.currentQuestionIndex + 1;
      }
    } else {
      this.gameService.endGame();
    }

    // Reset
    this.showResult = false;
    this.correctAnswerSelected = false;
    this.selectedIndex = null;  
    this.filteredOptions = null;  // reset 50/50
  }


  // Phone Friend
  usePhoneFriend() {
    if (this.gameService.lifelinesUsed.phoneFriend) return;
    this.gameService.lifelinesUsed.phoneFriend = true;

    const currentQ = this.gameService.getCurrentQuestion();
    if (!currentQ) return;

    const correctIndex = currentQ.options.findIndex(
      (opt: string) => opt === currentQ.answer
    );

    this.popupTitle = '';
    this.popupContent = `يقول صديقك إن الإجابة هي الخيار رقم ${correctIndex + 1}`;
    this.showPopup = true;

   
  }

  // Fifty-Fifty
  useFiftyFifty() {
    if (this.gameService.lifelinesUsed.fiftyFifty) return;
    this.gameService.lifelinesUsed.fiftyFifty = true;

    const currentQ = this.gameService.getCurrentQuestion();
    if (!currentQ) return;

    const correctOption = currentQ.answer;
    const allOptions = [...currentQ.options];

    // Filter out correct => these are wrong
    const wrongAnswers = allOptions.filter(opt => opt !== correctOption);

    // Remove 2 until only 1 wrong answer left
    while (wrongAnswers.length > 1) {
      const randomIndex = Math.floor(Math.random() * wrongAnswers.length);
      wrongAnswers.splice(randomIndex, 1);
    }

    // Now final set => [ correct, oneWrong ]
    const newOptions = [correctOption, wrongAnswers[0]];
    newOptions.sort(() => Math.random() - 0.5);

    // Store them so <app-question> can display only these
    this.filteredOptions = newOptions;
  }

  // Audience Poll
  useAudiencePoll() {
    if (this.gameService.lifelinesUsed.audiencePoll) return;
    this.gameService.lifelinesUsed.audiencePoll = true;

    const currentQ = this.gameService.getCurrentQuestion();
    if (!currentQ) return;

    const correctIndex = currentQ.options.findIndex(
      (opt: string) => opt === currentQ.answer
    );

    // Generate base random distribution
    const poll = currentQ.options.map((_: any, i: number) => ({
      optionIndex: i,
      percentage: Math.floor(Math.random() * 60) + 10 // 10-70
    }));

    // Make sure correct one is highest (optional, but typical)
    poll[correctIndex].percentage = Math.max(...poll.map((p: { optionIndex: number; percentage: number }) => p.percentage));

    // Normalize to 100
    const total = poll.reduce((sum: number, p: { optionIndex: number; percentage: number }) => sum + p.percentage, 0);
    poll.forEach((p: { optionIndex: number; percentage: number }) => {
      p.percentage = Math.round((p.percentage / total) * 100);
    });

    // Store for showing in the popup
    this.pollData = poll;

    // Show popup
    this.popupTitle = ' التصويت  ';
    this.popupContent =  '';
    this.showPopup = true;


  }
  closePopup() {
    this.showPopup = false;
    this.popupTitle = '';
    this.popupContent = '';
    this.pollData = null;
  }

  // Restart
  restart() {
    // 1) Reload or reuse the same question list from the service
    this.allQuestions = this.questionsService.getAllQuestions(); // again, store them
    this.shuffleAllQuestions(); // randomize the options

    // 2) Re-init the game
    this.gameService.initGame(this.allQuestions);
    this.gameStarted = true; 
    this.audioService.playAudio('start');

    // 3) Reset everything
    this.currentQuestionNumber = this.gameService.currentQuestionIndex + 1;
    this.totalCorrect = 0;
    this.showPopup = false;
    this.showResult = false;
    this.correctAnswerSelected = false;
    this.filteredOptions = null;
    this.pollData = null;
  }

  get isGameOver(): boolean {
    return this.gameService.gameOver;
  }
}
