import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiRetryService {
  currentRetry = signal(0);
  maxRetries = signal(3);
  isRetrying = signal(false);
  hasFailed = signal(false);

  constructor(private http: HttpClient) {}

  fetchWithRetry<T>(url: string): Observable<T> {
    this.resetState();

    return this.http.get<T>(url).pipe(
      retry({
        count: this.maxRetries(),
        delay: (error, retryCount) => {
          this.currentRetry.set(retryCount);
          this.isRetrying.set(true);

          // Exponential backoff: 1s, 2s, 4s
          const delayTime = Math.pow(2, retryCount - 1) * 1000;
          return timer(delayTime);
        }
      }),
      tap(() => {
        this.isRetrying.set(false);
      }),
      catchError((error: HttpErrorResponse) => {
        this.isRetrying.set(false);
        this.hasFailed.set(true);
        return throwError(() => error);
      })
    );
  }

  private resetState() {
    this.currentRetry.set(0);
    this.isRetrying.set(false);
    this.hasFailed.set(false);
  }
}
