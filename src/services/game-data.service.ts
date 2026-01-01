
import {inject, Injectable, signal} from '@angular/core';
import {GameQuestion, GameData} from '../data/data.types';
import {ApiRetryService} from './api-retry.service';
import {animateLoadingScreenAway} from '../utils/animations';
import {Router} from '@angular/router';
import {AudioService} from './audio.service';

@Injectable({ providedIn: 'root' })
export class GameDataService {
  constructor() {
    console.log('GameDataService instance created');
  }

  // private API_URL = 'https://album-game-backend.onrender.com/api';
  private API_URL = 'http://localhost:3030/api';

  private router = inject(Router);
  audioService = inject(AudioService)

  // Read-write signal
  gameQuestions = signal<GameQuestion[] | undefined>(undefined);
  isQuestionsLoaded = signal(false);

  private _playerScore = signal(0);
  readonly playerScore = this._playerScore.asReadonly();

  updateScore(newScore: number) {
    this._playerScore.set(newScore);
  }

  private static getDateString(date: Date = new Date()): string | undefined {
    console.log(date)
    return date.toISOString().split('T')[0];
  }

  private apiRetryService = inject(ApiRetryService);

  loadGameData() {
    this.apiRetryService.fetchWithRetry<GameData>(`${this.API_URL}/game/get-questions?date=${GameDataService.getDateString()}`).subscribe({
      next: (data: GameData) => {
        console.log('Data loaded successfully', data);
        this.gameQuestions.set(data.questions);
        this.isQuestionsLoaded.set(true)
      },
      error: (error) => {
        console.error('Failed after retries', error);
      }
    });
  }


}
