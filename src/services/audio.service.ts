import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private backgroundMusic: HTMLAudioElement | null = null;
  private inGameMusic: HTMLAudioElement | null = null
  private soundEffects: { [key: string]: HTMLAudioElement } = {};

  private isMuted = false;
  private musicVolume = 0.1; // 30% volume (music should be subtle)
  private sfxVolume = 0.6;   // 60% volume

  constructor() {
    this.loadAudio();
  }

  private loadAudio() {
    // Background music
    this.backgroundMusic = new Audio('audio/menu.mp3');
    this.inGameMusic = new Audio('audio/in-game.mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = this.musicVolume;

    // Sound effects
    this.soundEffects['correct'] = new Audio('audio/correct.mp3');
    this.soundEffects['wrong'] = new Audio('audio/wrong-2.wav');
    this.soundEffects['click'] = new Audio('audio/click.mp3');
    this.soundEffects['mouse-click'] = new Audio('audio/mouse-click.wav');
    this.soundEffects['countdown'] = new Audio('audio/countdown-in-game.mp3');
    this.soundEffects['countdown-to-start'] = new Audio('audio/countdown-to-game.mp3');
    // this.soundEffects['gameOver'] = new Audio('assets/audio/game-over.mp3');

    // Set volume for all effects
    Object.values(this.soundEffects).forEach(audio => {
      audio.volume = this.sfxVolume;
    });
  }

  // Background Music Controls
  playBackgroundMusic() {
    if (this.backgroundMusic && !this.isMuted) {
      this.backgroundMusic.play().catch(err => {
        console.log('Audio play prevented:', err);
      });
    }
  }

  playInGamedMusic() {
    if (this.inGameMusic && !this.isMuted) {
      this.inGameMusic.play().catch(err => {
        console.log('Audio play prevented:', err);
      });
    }
  }

  pauseBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }

  stopInGameMusic() {
    if (this.inGameMusic) {
      this.inGameMusic.pause();
      this.inGameMusic.currentTime = 0;
    }
  }

  // Sound Effects
  playSound(soundName: string) {
    if (this.isMuted) return;

    const sound = this.soundEffects[soundName];
    if (sound) {
      // Reset to start if already playing
      sound.currentTime = 0;
      sound.play().catch(err => {
        console.log('Sound effect play prevented:', err);
      });
    }
  }

  getMusicVolume(){
    return this.musicVolume
  }

  getSFXVolume(){
    return this.sfxVolume
  }

  // Volume Controls
  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.musicVolume;
    }
  }

  setSFXVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    Object.values(this.soundEffects).forEach(audio => {
      audio.volume = this.sfxVolume;
    });
  }

  // Mute/Unmute
  toggleMute() {
    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      this.pauseBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }

    return this.isMuted;
  }

  getMuteState(): boolean {
    return this.isMuted;
  }

  // Fade Out (for transitions)
  fadeOut(duration: number = 1000) {
    if (!this.backgroundMusic) return;

    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = this.musicVolume / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      if (!this.backgroundMusic) {
        clearInterval(interval);
        return;
      }

      currentStep++;
      const newVolume = Math.max(0, this.musicVolume - (volumeStep * currentStep));
      this.backgroundMusic.volume = newVolume;

      if (currentStep >= steps) {
        clearInterval(interval);
        this.pauseBackgroundMusic();
        this.backgroundMusic.volume = this.musicVolume; // Reset for next play
      }
    }, stepTime);
  }

  // Fade In
  fadeIn(duration: number = 1000) {
    if (!this.backgroundMusic) return;

    this.backgroundMusic.volume = 0;
    this.playBackgroundMusic();

    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = this.musicVolume / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      if (!this.backgroundMusic) {
        clearInterval(interval);
        return;
      }

      currentStep++;
      const newVolume = Math.min(this.musicVolume, volumeStep * currentStep);
      this.backgroundMusic.volume = newVolume;

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepTime);
  }
}
