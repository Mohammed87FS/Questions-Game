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

  playAudio(
    type: 'start' | 'start_question' | 'correct' | 'wrong' | 'gaveAnswer',
    onEndedCallback?: () => void
  ): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.stopAllAudio(); // Stop other audio before starting new one
    let audioToPlay: HTMLAudioElement | null = null;

    switch (type) {
      case 'start':
        audioToPlay = this.audioStart;
        break;
      case 'start_question':
        audioToPlay = this.audioStartQuestion;
        break;
      case 'correct':
        audioToPlay = this.audioCorrect;
        break;
      case 'wrong':
        audioToPlay = this.audioWrong;
        break;
      case 'gaveAnswer':
        audioToPlay = this.audioGaveAnswer;
        break;
    }

    if (audioToPlay) {
      audioToPlay.currentTime = 0; // Ensure the audio starts from the beginning
      audioToPlay.play().catch(err => console.error('Audio playback error:', err));

      // Attach the callback if provided
      if (onEndedCallback) {
        audioToPlay.onended = onEndedCallback;
      }
    }
  }

  stopAllAudio(): void {
    [this.audioStart, this.audioStartQuestion, this.audioCorrect, this.audioWrong, this.audioGaveAnswer].forEach(a => {
      if (a) {
        a.pause();
        a.currentTime = 0;
      }
    });
  }
}
