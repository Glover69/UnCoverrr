import {Component, ElementRef, inject, OnInit, signal, ViewChild} from '@angular/core';
import {InputFieldBaseComponent} from '../../components/input-field-base/input-field-base.component';
import {ButtonComponent} from '../../components/button/button.component';
import {DialogComponent} from '../../components/dialog/dialog.component';
import gsap from 'gsap';
import {FormsModule} from '@angular/forms';
import {NgClass, NgOptimizedImage} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import tipsData from '../../data/did-you-know.json';
import {getRandomIntInclusive} from '../../utils/utils';

@Component({
  selector: 'app-home',
  imports: [
    InputFieldBaseComponent,
    ButtonComponent,
    DialogComponent,
    FormsModule,
    NgClass,
    NgOptimizedImage
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  @ViewChild('hoursEl', { static: false }) hoursEl!: ElementRef;
  @ViewChild('minutesEl', { static: false }) minutesEl!: ElementRef;
  @ViewChild('secondsEl', { static: false }) secondsEl!: ElementRef;
  @ViewChild('progressEl', { static: false }) progressEl!: ElementRef;
  nickname: string = '';

  hours: string = '00';
  minutes: string = '00';
  seconds: string = '00';

  private intervalId: any;
  private previousHours: number = 0;
  private previousMinutes: number = 0;
  private previousSeconds: number = 0;

  isDialogOpen: boolean = false;
  DialogComponent: any;
  private router = inject(Router);
  screenState: 'loading' | 'home' = 'home';
  tips: any[] = tipsData;

  ngOnInit(){
    setTimeout(() => {
      this.animateHomeScreen(-50, 50, -50, false)
    }, 200)

    this.updateCountdown();
    this.intervalId = setInterval(() => this.updateCountdown(), 1000);
    // console.log(this.tips)
  }

  private updateCountdown() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const diff = midnight.getTime() - now.getTime();

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    // Animate if values changed
    if (h !== this.previousHours) {
      this.animateValue(this.hoursEl, h);
      this.previousHours = h;
    }
    if (m !== this.previousMinutes) {
      this.animateValue(this.minutesEl, m);
      this.previousMinutes = m;
    }
    if (s !== this.previousSeconds) {
      this.animateValue(this.secondsEl, s);
      this.previousSeconds = s;
    }

    this.hours = this.padZero(h);
    this.minutes = this.padZero(m);
    this.seconds = this.padZero(s);

    // Update progress bar
    const totalSeconds = 24 * 60 * 60;
    const remainingSeconds = h * 3600 + m * 60 + s;
    const progress = (remainingSeconds / totalSeconds) * 100;

    if (this.progressEl) {
      gsap.to(this.progressEl.nativeElement, {
        width: `${progress}%`,
        duration: 1,
        ease: 'power2.out'
      });
    }
  }


  private animateValue(element: ElementRef, value: number) {
    if (!element) return;

    gsap.fromTo(element.nativeElement,
      {
        scale: 1.2,
        color: '#9466e3'
      },
      {
        scale: 1,
        duration: 0.3,
        ease: 'power2.inOut'
      }
    );
  }


  private padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }

  enterArena(){
    if (this.screenState == "loading"){
      console.log("Hi")
      setTimeout(() => {
        gsap.to('.vinyl-img', {
          rotation: 360,
          duration: 2,
          repeat: -1,
          ease: "none"
        })

        gsap.to('.load-header', {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.inOut"
        })

        gsap.fromTo('.tips-container', {
          y: 30
        }, {
          y: 0,
          opacity: 1,
          delay: 0.5,
          duration: 0.75,
          ease: "power2.inOut",
        })

        gsap.to('.tips-sentence', {
          opacity: 0.6,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => {
            this.randomizeTips()

            setInterval(() => {
              this.randomizeTips()
            }, 9000)
          }
        })
      }, 1000)
    }


  }

  // How to Play dialog

  currentStep = signal(0);

  steps = [
    {
      title: "📀 Step 1: Study the Album Cover",
      description: "You'll see an album cover without the name.",
      tips: [
        "Pay attention to the artwork and optional hints like genre and release year",
        "Some albums might have the artist's signature style",
        "These clues will help you \n" +
        "guess the artist!"
      ],
      image: "assets/screenshots/step1-album.png"
    },
    {
      title: "🎯 Step 2: Choose Your Answer",
      description: "Pick the correct artist from four (4) options.",
      tips: [
        "You have one chance per question, so choose carefully!",
        "Not sure? You can skip and move to the next question"
      ],
      image: "assets/screenshots/step1-album.png"
    },
    {
      title: "🏆 Step 3: Build Your Score",
      description: "Earn points for each correct answer!",
      tips: [
        "You must be quick to answer as well. The faster you answer, the more points you get for a question.",
        "Build streaks for bonus points as you go!",
        "Track your progress and score on the global leaderboard as you play through the questions",
        "Can you get the highest for today? I guess we'll find out."
      ],
      image: "assets/screenshots/step1-album.png"
    }
  ]

  closeDialog(){
    this.isDialogOpen = false

    setTimeout(() => {
      // Reset state for how to play dialog
      this.currentStep.set(0);
    }, 200)
  }

  previousStep(){
    if (this.currentStep() != 0){
      this.currentStep.update(val => val - 1);
    }
  }

  nextStep(){
    if (this.currentStep() != this.steps.length - 1){

      this.currentStep.update(val => val + 1);

      // console.log("Before: " + this.currentStep())
      // gsap.to('.step-title', {
      //   x: -100,
      //   opacity: 0,
      //   duration: 0.5,
      //   ease: 'power2.out',
      //   onComplete: () => {
      //     setTimeout(() => {
      //       this.currentStep.update(val => val + 1);
      //     }, 200)
      //
      //     console.log("After: " + this.currentStep())
      //     gsap.to('.step-title', {
      //       x: 0,
      //       opacity: 1,
      //       duration: 0.5,
      //       ease: 'power2.in'
      //     })
      //   }
      // })
    }
  }


  // Animate home screen

  animateHomeScreen(first: number, second: number, third: number, alreadyAnimated: boolean){
    if (!alreadyAnimated){
      gsap.fromTo('.header-container', {
        y: first,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.inOut'
      })

      gsap.fromTo('.timer-container', {
        y: second,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.inOut'
      })

      gsap.fromTo('.body-container', {
        x: third,
        opacity: 0,
      }, {
        x: 0,
        opacity: 1,
        duration: 1.25,
        delay: 0.75,
        ease: 'power2.inOut'
      })
    }else{

      // Reverse to leave screen
      gsap.to('.header-container', {
        y: first,
        opacity: 0,
        duration: 1,
        ease: 'power2.inOut'
      })

      gsap.to('.timer-container', {
        y: second,
        opacity: 0,
        duration: 1,
        ease: 'power2.inOut'
      })

      gsap.to('.body-container', {
        x: third,
        opacity: 0,
        duration: 1.25,
        delay: 0.75,
        ease: 'power2.inOut',
        onComplete: () => {
          // Change screen state to loading after last animation ends
          setTimeout(() => {
            this.screenState = "loading";
            this.enterArena()
          }, 100)
        }
      })

      gsap.to('.absolute', {
        y: third,
        opacity: 0,
        duration: 1,
        ease: 'power2.inOut'
      })
    }

  }

  currentTip: { artist: string; fact: string; } | undefined;
  // Array to hold the tips that have been shown already
  alreadyShowedIndex: number[] = []

  randomizeTips(){
      if (this.alreadyShowedIndex.length != this.tips.length) {

        if (this.currentTip == undefined) {
          // Get a random number b/n 0 and the length of the tips data array
          let randomNo = getRandomIntInclusive(0, tipsData.length - 1);

          while (this.alreadyShowedIndex.find(n => n == randomNo)) {
            randomNo = getRandomIntInclusive(0, tipsData.length - 1)
          }

          this.alreadyShowedIndex.push(randomNo);

          this.currentTip = tipsData[randomNo];

          this.fadeInSentence()
        } else {
          gsap.to('.tips-sentence', {
            opacity: 0,
            ease: "power2.inOut",
            duration: 0.5,
            onComplete: () => {
              // Get a random number b/n 0 and the length of the tips data array
              let randomNo = getRandomIntInclusive(0, tipsData.length - 1);

              while (this.alreadyShowedIndex.find(n => n == randomNo)) {
                randomNo = getRandomIntInclusive(0, tipsData.length - 1)
              }

              this.alreadyShowedIndex.push(randomNo);

              this.currentTip = tipsData[randomNo];

              setTimeout(() => {
                this.fadeInSentence()
              }, 500)
            }
          })
        }

      } else {
        this.alreadyShowedIndex = [];
        this.randomizeTips()
      }
  }



  fadeInSentence(){
    gsap.to('.tips-sentence', {
      opacity: 0.6,
      delay: 0.05,
      duration: 0.5,
      ease: "power2.inOut",
    })
  }
}
