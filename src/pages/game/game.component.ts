import {Component, computed, effect, inject, OnDestroy, OnInit, signal} from '@angular/core';
import gsap from 'gsap';
import {GameDataService} from '../../services/game-data.service';
import {AudioService} from '../../services/audio.service';

@Component({
  selector: 'app-game',
  imports: [
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit, OnDestroy {
  state: 'countdown' | 'playing' | 'ended' = 'countdown';
  countdownNumber = signal(3);

  gameDataService = inject(GameDataService);
  audioService = inject(AudioService)

  questions = this.gameDataService.gameQuestions;
  currentQuestionIndex = signal(0);

  currentQuestion = computed(() => {
    const questions = this.questions();
    const index = this.currentQuestionIndex();

    if (!questions || questions.length === 0) return null;
    if (index < 0 || index >= questions.length) return null;

    console.log(questions[index])
    return questions[index];
  });


  ngOnInit(){
    if (this.state === 'countdown'){
      if(!this.gameDataService.isQuestionsLoaded()){
        this.gameDataService.loadGameData()
      }
      setTimeout(() => {
        this.audioService.playSound('countdown-to-start');
        this.startCountdown()
      }, 500)
    }
  }

  timeRemaining = signal(15)
  totalPoints = signal(0);
  streak = signal(0)

  startTimer(){
    if (this.timeRemaining() >= 0) {
      const gameIntID = setInterval(() => {
        this.timeRemaining.update(n => n - 1);
        console.log(this.timeRemaining());

        if (this.timeRemaining() === 10){
          console.log("10s more!")
          this.audioService.playSound('countdown');
        }

        if (this.timeRemaining() === 0){
          clearInterval(gameIntID);
          console.log("Interval stopped");
          this.endGame();
        }
      }, 1000)
    }
  }

  endGame(){
    this.state = 'ended';
    this.audioService.stopInGameMusic()
    this.audioService.stopSound('countdown');
  }

  startCountdown() {
    this.countdownNumber.set(3)

    const timeline = gsap.timeline({
      onComplete: () => {
        this.countdownNumber.set(0)
        setTimeout(() => {
          this.state = 'playing';
          this.audioService.playInGamedMusic();
          this.startTimer()
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

  chooseAnswer(option: string){
    this.audioService.playSound('click');

    if (option === this.currentQuestion()?.correctAnswer){
      this.audioService.playSound('correct');
      this.totalPoints.update(n => n + 100);
      this.streak.update(n => n + 1);
    }else{
      this.audioService.playSound('wrong');
      this.streak.set(0)
    }

    this.nextQuestion();
  }

  ngOnDestroy() {
    this.audioService.stopInGameMusic()
  }
}
