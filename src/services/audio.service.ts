import { inject, Injectable } from '@angular/core';
import { AssetLoaderService } from './asset-loader.service';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audioContext: AudioContext | null = null;

  private backgroundMusic: HTMLAudioElement | null = null;
  private inGameMusic: HTMLAudioElement | null = null;
  private soundEffects: Map<string, HTMLAudioElement> = new Map();
  private gameSoundEffects: Map<string, HTMLAudioElement> = new Map(); // Separate storage

  private audioBuffers: Map<string, AudioBuffer> = new Map();

  private isAudioUnlocked = false;
  private isMuted = false;
  private musicVolume = 0.1; // 10% volume (music should be subtle)
  private sfxVolume = 0.6; // 60% volume

  assetLoader = inject(AssetLoaderService);

  // Stop a sound - for Web Audio, we need to track active sources
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();

  constructor() {
    // this.loadAudio();
  }

  private readonly AUDIO_PATHS = {
    background: 'audio/menu.mp3',
    mouseClick: 'audio/mouse-click.wav',

    correct: 'audio/correct.mp3',
    wrong: 'audio/wrong-2.wav',
    click: 'audio/click.mp3',
    countdownBegin: 'audio/countdown-to-game.mp3',
    countdownEnd: 'audio/countdown-in-game.mp3',
    inGameBackground: 'audio/in-game.mp3',
  };

  private initAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  async warmupAudioContext(): Promise<void> {
    if (!this.audioContext || !this.isAudioUnlocked) return;

    // Play a silent buffer to ensure the audio pipeline is ready
    const silentBuffer = this.audioContext.createBuffer(1, 1, 22050);
    const source = this.audioContext.createBufferSource();
    source.buffer = silentBuffer;
    source.connect(this.audioContext.destination);
    source.start(0);

    console.log('✓ Audio context warmed up');
  }

  // Pre-decode audio file into buffer for instant playback
  private async loadAudioBuffer(name: string, path: string): Promise<void> {
    try {
      const context = this.initAudioContext();

      // Fetch the audio file
      const response = await fetch(path);
      const arrayBuffer = await response.arrayBuffer();

      // Decode it into an AudioBuffer
      const audioBuffer = await context.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(name, audioBuffer);

      console.log(`✓ Pre-decoded ${name}`);
    } catch (err) {
      console.warn(`✗ Failed to decode ${name}:`, err);
    }
  }

  // Initialize critical assets (home page sounds)
  async initializeCriticalAudio() {
    console.log('Initializing critical audio...');

    // Menu music
    const menuMusic = this.assetLoader.getAudio(this.AUDIO_PATHS.background);
    if (menuMusic) {
      this.backgroundMusic = menuMusic;
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = this.musicVolume;
    }

    // Critical sound effects
    // const criticalSounds = ['mouseClick'];
    // criticalSounds.forEach(name => {
    //   const path = this.AUDIO_PATHS[name as keyof typeof this.AUDIO_PATHS];
    //   const cachedAudio = this.assetLoader.getAudio(path);

    //   if (cachedAudio) {
    //     const audio = cachedAudio.cloneNode(true) as HTMLAudioElement;
    //     audio.volume = this.sfxVolume;
    //     this.soundEffects.set(name, audio);
    //   }
    // });

    // Pre-decode critical sound effects for instant playback
    await this.loadAudioBuffer('mouseClick', this.AUDIO_PATHS.mouseClick);

    console.log('✓ Critical audio initialized');
  }

  // Initialize game assets (game page sounds)

  async initializeGameAudio() {
    console.log('Initializing game audio...');

    // Game music
    const gameMusic = this.assetLoader.getAudio(
      this.AUDIO_PATHS.inGameBackground
    );
    if (gameMusic) {
      this.inGameMusic = gameMusic;
      this.inGameMusic.loop = true;
      this.inGameMusic.volume = this.musicVolume;
      console.log('In-game music found!');
    } else {
      console.warn('Game music not found in cache');
    }

    // Game sound effects
    const gameSounds = ['countdownBegin', 'countdownEnd', 'correct', 'wrong'];
    // gameSounds.forEach(name => {
    //   const path = this.AUDIO_PATHS[name as keyof typeof this.AUDIO_PATHS];
    //   console.log(path)
    //   const cachedAudio = this.assetLoader.getAudio(path);

    //   if (cachedAudio) {
    //     const audio = cachedAudio.cloneNode(true) as HTMLAudioElement;
    //     audio.volume = this.sfxVolume;
    //     this.gameSoundEffects.set(name, audio);
    //     console.log(`✓ Loaded ${name}`);
    //   } else {
    //     console.warn(`✗ Audio '${name}' not found in cache at path: ${path}`);
    //   }
    // });

    await Promise.all(
      gameSounds.map((name) => {
        const path = this.AUDIO_PATHS[name as keyof typeof this.AUDIO_PATHS];
        return this.loadAudioBuffer(name, path);
      })
    );

    console.log('✓ Game audio initialized');
    // console.log('Game sounds map:', Array.from(this.gameSoundEffects.keys()));
    console.log('Loaded buffers:', Array.from(this.audioBuffers.keys()));
  }

  async unlockAudio(): Promise<boolean> {
    if (this.isAudioUnlocked) return true;

    try {
      const context = this.initAudioContext();

      // Resume audio context (required after user interaction)
      if (context.state === 'suspended') {
        await context.resume();
      }

      if (this.backgroundMusic) {
        await this.backgroundMusic?.play();
        this.backgroundMusic?.pause();
      }

      this.isAudioUnlocked = true;
      console.log('✓ Audio unlocked');
      return true;
    } catch (err) {
      console.log('✗ Audio unlock failed:', err);
      return false;
    }
  }

  // Background Music Controls
  playBackgroundMusic() {
    if (this.backgroundMusic && !this.isMuted && this.isAudioUnlocked) {
      this.backgroundMusic.play().catch((err) => {
        console.log('Background music play prevented:', err);
      });
    }
  }

  playInGameMusic() {
    if (this.inGameMusic && !this.isMuted && this.isAudioUnlocked) {
      this.inGameMusic.play().catch((err) => {
        console.log('Audio play prevented:', err);
      });
    }
  }

  pauseBackgroundMusic() {
    this.backgroundMusic?.pause();
  }

  playSoundWithStop(soundName: string): void {
    if (this.isMuted || !this.isAudioUnlocked || !this.audioContext) return;

    // Stop any existing instance of this sound
    this.stopSound(soundName);

    const buffer = this.audioBuffers.get(soundName);

    if (buffer) {
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = this.sfxVolume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Track this source so we can stop it
      this.activeSources.set(soundName, source);

      source.onended = () => {
        this.activeSources.delete(soundName);
      };

      source.start(0);
    }
  }

  stopSound(soundName: string) {
    // if (this.isMuted) return;

    // const sound = this.soundEffects.get(soundName) || this.gameSoundEffects.get(soundName);

    // if (sound) {
    //   sound.pause()
    //   sound.currentTime = 0;
    //   console.log(`${soundName} stopped`)
    // }
    const source = this.activeSources.get(soundName);
    if (source) {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
      this.activeSources.delete(soundName);
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

  // Play sound effect with Web Audio API - near-instant playback
  playSound(soundName: string) {
    if (this.isMuted || !this.isAudioUnlocked || !this.audioContext) return;

    // const sound = this.soundEffects.get(soundName) || this.gameSoundEffects.get(soundName);
    const buffer = this.audioBuffers.get(soundName);

    if (buffer) {
      // Create a new source node (they're one-use)
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      // Create gain node for volume control
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = this.sfxVolume;

      // Connect: source -> gain -> output
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Play immediately
      source.start(0);

      // // Clone the sound so we can play it multiple times simultaneously.
      // // This is for when you rapidly click a button, for instance, multiple times andd you
      // // don't want them to interfere w/ each other
      // const soundClone = sound.cloneNode(true) as HTMLAudioElement;
      // soundClone.volume = this.sfxVolume;

      // soundClone.play().catch(err => {
      //   console.log(`Sound ${soundName} play prevented:`, err);
      // });
    } else {
      console.warn(`Sound '${soundName}' not found in buffers`);
    }
  }

  getMusicVolume() {
    return this.musicVolume;
  }

  getSFXVolume() {
    return this.sfxVolume;
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
    Object.values(this.soundEffects).forEach((audio) => {
      audio.volume = this.sfxVolume;
    });
  }

  // Mute/Unmute
  toggleMute() {
    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      this.pauseBackgroundMusic();
    } else if (this.isAudioUnlocked) {
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
      const newVolume = Math.max(
        0,
        this.musicVolume - volumeStep * currentStep
      );
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
