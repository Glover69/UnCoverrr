import {getRandomIntInclusive} from './utils';
import tipsData from '../data/did-you-know.json';
import gsap from 'gsap';
import {signal} from '@angular/core';

export const currentTip = signal<{ artist: string; fact: string; } | undefined>({
  artist: "",
  fact: ""
});

// Array to hold the tips that have been shown already
export let alreadyShowedIndex: number[] = []
export const screenState = signal<'loading' | 'home'>('home'); // Changed to signal
export const tips: any[] = tipsData;

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
          randomizeTips()

          setInterval(() => {
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
          // Get a random number b/n 0 and the length of the tips data array
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
