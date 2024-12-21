import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class QuestionsService {
  private questions = [
    {
      text: 'What is the capital of France?',
      options: ['Berlin', 'Paris', 'Rome', 'London'],
      answer: 'Paris'
    },
    {
      text: 'Which planet is called the Red Planet?',
      options: ['Jupiter', 'Earth', 'Mars', 'Venus'],
      answer: 'Mars'
    },
    // more questions...
  ];

  getAllQuestions() {
    return this.questions;
  }
}
