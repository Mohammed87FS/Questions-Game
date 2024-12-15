
import { Component } from '@angular/core';
import { QuizComponent } from './components/quiz/quiz.component';

@Component({
  selector: 'app-root',
  standalone: true,

  imports: [QuizComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
}