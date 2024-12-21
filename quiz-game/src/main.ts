// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

// Any providers you need at root level can go here
import { AudioService } from './app/services/audio.service';
import { GameService } from './app/services/game.service';
import { QuestionsService } from './app/services/questions.service';

bootstrapApplication(AppComponent, {
  providers: [
    AudioService,
    GameService,
    QuestionsService,
  ],
}).catch((err) => console.error(err));
