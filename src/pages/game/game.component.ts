import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import gsap from 'gsap';
import {GameDataService} from '../../services/game-data.service';
import {GameQuestion} from '../../data/data.types';
import {ButtonComponent} from '../../components/button/button.component';

@Component({
  selector: 'app-game',
  imports: [
    ButtonComponent

  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit{
  state: 'countdown' | 'playing' | 'answered' = 'countdown';
  countdownNumber = signal(3);

  gameDataService = inject(GameDataService);
  questions = this.gameDataService.gameQuestions;
  currentQuestionIndex = signal(0);

  currentQuestion = computed(() => {
    const questions = this.questions();
    const index = this.currentQuestionIndex();

    if (!questions || questions.length === 0) return null;
    if (index < 0 || index >= questions.length) return null;

    return questions[index];
  });


  ngOnInit(){

    if(!this.gameDataService.isQuestionsLoaded()){
      this.gameDataService.loadGameData()
    }
    setTimeout(() => {
      this.startCountdown()
    }, 500)

  }

  startCountdown() {
    this.countdownNumber.set(3)

    const timeline = gsap.timeline({
      onComplete: () => {
        this.countdownNumber.set(0)
        setTimeout(() => {
          this.state = 'playing';
        }, 1000);
      }
    });

    for (let i = 0; i < 3; i++) {
      const numberValue = 3 - i;

      timeline.call(() => {
        this.countdownNumber.set(numberValue)
      }, [], i);

      timeline.fromTo('.countdown-number',
        {
          opacity: 0,
          y: -100
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          repeatDelay: 0.5,
          ease: "back.out(1.7)",
        },
        i
      );
    }
  }

  nextQuestion(){
    this.currentQuestionIndex.update(n => n + 1);
  }
}
