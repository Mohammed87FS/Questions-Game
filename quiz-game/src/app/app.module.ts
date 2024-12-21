import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { QuestionComponent } from './components/question/question.component';
import { PopupComponent } from './components/popup/popup.component';

import { AudioService } from './services/audio.service';
import { GameService } from './services/game.service';
import { QuestionsService } from './services/questions.service';

@NgModule({
  declarations: [
    AppComponent,
    QuizComponent,
    QuestionComponent,
    PopupComponent
  ],
  imports: [
    BrowserModule,
    CommonModule
  ],
  providers: [
    AudioService,
    GameService,
    QuestionsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
