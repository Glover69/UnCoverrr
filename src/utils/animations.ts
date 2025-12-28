import {getRandomIntInclusive} from './utils';
import tipsData from '../data/did-you-know.json';
import gsap from 'gsap';
import {inject, signal} from '@angular/core';
import {Router} from '@angular/router';

export const currentTip = signal<{ artist: string; fact: string; } | undefined>(undefined);
export const loadingState = signal<{
  isLoading: boolean;
  isRetrying: boolean;
  currentRetry: number;
  maxRetries: number;
  hasFailed: boolean;
}>({
  isLoading: false,
  isRetrying: false,
  currentRetry: 0,
  maxRetries: 3,
  hasFailed: false
});


// Array to hold the tips that have been shown already
export let alreadyShowedIndex: number[] = []
export const screenState = signal<'loading' | 'home'>('home'); // Changed to signal
export const tips: any[] = tipsData;
let tipIntervalId: ReturnType<typeof setInterval> | null = null;


export function animateHomeScreen(first: number, second: number, third: number, alreadyAnimated: boolean){
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
          screenState.set('loading');
          console.log("Changed to loading!")
          enterArena()
          // Call loadGameData here after state changes
          setTimeout(() => {
            if (typeof window !== 'undefined' && (window as any).loadGameData) {
              (window as any).loadGameData();
            }
          }, 3000)
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

export function enterArena(){
  if (screenState() == "loading"){
    console.log(screenState())
    setTimeout(() => {
      randomizeTips()
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
        onComplete: () => {
          tipIntervalId = setInterval(() => {
            randomizeTips()
          }, 9000)
        }
      })
    }, 2500)
  }
}


export function randomizeTips(){
  if (alreadyShowedIndex.length != tips.length) {

    if (currentTip() == undefined) {

      console.log("It is undefined")
      // Get a random number b/n 0 and the length of the tips data array
      let randomNo = getRandomIntInclusive(0, tipsData.length - 1);

      while (alreadyShowedIndex.find(n => n == randomNo)) {
        randomNo = getRandomIntInclusive(0, tipsData.length - 1)
      }

      alreadyShowedIndex.push(randomNo);

      currentTip.set(tipsData[randomNo]);

      fadeInSentence()
    } else {
      gsap.to('.tips-sentence', {
        opacity: 0,
        ease: "power2.inOut",
        duration: 0.5,
        onComplete: () => {
          let randomNo = getRandomIntInclusive(0, tipsData.length - 1);

          while (alreadyShowedIndex.find(n => n == randomNo)) {
            randomNo = getRandomIntInclusive(0, tipsData.length - 1)
          }

          alreadyShowedIndex.push(randomNo);

          currentTip.set(tipsData[randomNo]);

          setTimeout(() => {
            fadeInSentence()
          }, 500)
        }
      })
    }

  } else {
    alreadyShowedIndex = [];
    randomizeTips();
  }
}


export function fadeInSentence(){
  gsap.to('.tips-sentence', {
    opacity: 0.6,
    delay: 0.05,
    duration: 0.5,
    ease: "power2.inOut",
  })
}

export function animateLoadingScreenAway(onComplete?: () => void){
  // Clear the interval
  if (tipIntervalId) {
    clearInterval(tipIntervalId);
    tipIntervalId = null;
  }

  gsap.to('.load-header', {
    y: -30,
    opacity: 0,
    duration: 1,
    ease: "power2.inOut"
  })

  gsap.to('.tips-container', {
    y: 30,
    opacity: 0,
    delay: 0.5,
    duration: 0.75,
    ease: "power2.inOut",
    onComplete: () => {
     onComplete?.()
    }
  })
}
