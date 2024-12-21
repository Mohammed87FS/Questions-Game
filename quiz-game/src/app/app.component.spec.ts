import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  // If you're using standalone, you'd do:
  // standalone: true,
  // imports: [CommonModule, QuizComponent] // etc.
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // This matches your test which expects app.title === 'quiz-game'
  title = 'quiz-game';
}
