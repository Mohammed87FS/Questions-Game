import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private audioStart: HTMLAudioElement | null = null;
  private audioStartQuestion: HTMLAudioElement | null = null;
  private audioCorrect: HTMLAudioElement | null = null;
  private audioWrong: HTMLAudioElement | null = null;
  private audioGaveAnswer: HTMLAudioElement | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      this.audioStart = new Audio('assets/audio/start.mp3');
      this.audioStartQuestion = new Audio('assets/audio/start_question.mp3');
      this.audioCorrect = new Audio('assets/audio/correct.mp4');
      this.audioWrong = new Audio('assets/audio/loss.m4a');
      this.audioGaveAnswer = new Audio('assets/audio/gave_answer.m4a');
    }
  }

  playAudio(type: 'start' | 'start_question' | 'correct' | 'wrong' | 'gaveAnswer'): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.stopAllAudio();
    switch (type) {
      case 'start':
        this.audioStart?.play();
        break;

      case 'start_question':
        this.audioStartQuestion?.play();
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
    [this.audioStart, this.audioCorrect, this.audioWrong, this.audioGaveAnswer].forEach(a => {
      if (a) {
        a.pause();
        a.currentTime = 0;
      }
    });
  }
}
