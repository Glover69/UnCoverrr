import {Injectable, signal} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {AssetCategory, AssetDefinition} from '../data/data.types';

export interface LoadingProgress {
  total: number;
  loaded: number;
  percentage: number;
  currentAsset: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssetLoaderService {

  // Define all assets with categories
  private readonly ASSETS: AssetDefinition[] = [
    // CRITICAL - Home page assets (load first)
    {
      path: 'audio/menu.mp3',
      category: AssetCategory.CRITICAL,
      type: 'audio'
    },
    {
      path: 'audio/mouse-click.wav',
      category: AssetCategory.CRITICAL,
      type: 'audio'
    },

    // GAME - Game page assets (load during loading screen)
    {
      path: 'audio/in-game.mp3',
      category: AssetCategory.GAME,
      type: 'audio'
    },
    {
      path: 'audio/countdown-in-game.mp3',
      category: AssetCategory.GAME,
      type: 'audio'
    },
    {
      path: 'audio/countdown-to-game.mp3',
      category: AssetCategory.GAME,
      type: 'audio'
    },
    {
      path: 'audio/correct.mp3',
      category: AssetCategory.GAME,
      type: 'audio'
    },
    {
      path: 'audio/wrong-2.wav',
      category: AssetCategory.GAME,
      type: 'audio'
    },
    {
      path: 'audio/click.mp3',
      category: AssetCategory.GAME,
      type: 'audio'
    },
    // {
    //   path: 'audio/game-over.mp3',
    //   category: AssetCategory.GAME,
    //   type: 'audio'
    // },
  ];

  private loadingProgress$ = new BehaviorSubject<LoadingProgress>({
    total: 0,
    loaded: 0,
    percentage: 0,
    currentAsset: ''
  });

  // Public observable for components to track progress
  progress$ = this.loadingProgress$.asObservable();

  // Cache for loaded assets
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private imageCache: Map<string, HTMLImageElement> = new Map();

  private criticalAssetsLoaded = signal(false);
  private gameAssetsLoaded = signal(false);

  // Progress tracking per category
  private criticalAssetsProgress$ = new BehaviorSubject<number>(0);
  private gameAssetsProgress$ = new BehaviorSubject<number>(0);

  constructor() {}


  // Preload either critical assets or game assets at any time

  async preloadAnyGroupOfAssets(type: string): Promise<void> {
    let assets : AssetDefinition[] = [];

    if (type === 'critical'){
      if (this.criticalAssetsLoaded()) {
        console.log('Critical assets already loaded');
        return;
      }


      assets = this.ASSETS.filter(
        asset => asset.category === AssetCategory.CRITICAL
      );

    }else if (type === 'game'){
      if (this.gameAssetsLoaded()) {
        console.log('Game assets already loaded');
        return;
      }

      assets = this.ASSETS.filter(
        asset => asset.category === AssetCategory.GAME
      );
    }

    console.log(`Loading ${assets.length} ${type} assets...`);


    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];

      if (asset.type === 'audio') {
        await this.preloadAudio(asset.path);
      } else if (asset.type === 'image') {
        await this.preloadImage(asset.path);
      }

      const progress = Math.round(((i + 1) / assets.length) * 100);

      if (type === 'critical') {
        this.criticalAssetsProgress$.next(progress);
      }else if (type === 'game'){
        this.gameAssetsProgress$.next(progress)
      }
    }

    if (type === 'critical') {
      this.criticalAssetsLoaded.set(true);
    }else if (type === 'game'){
      this.gameAssetsLoaded.set(true);
    }
    console.log(`✓ ${type} assets loaded`);
  }

  // Preload one audio file
  private preloadAudio(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already cached
      if (this.audioCache.has(path)) {
        resolve();
        return;
      }

      const audio = new Audio();

      // Set up event listeners
      audio.addEventListener('canplaythrough', () => {
        this.audioCache.set(path, audio);
        resolve();
      }, { once: true });

      audio.addEventListener('error', (error) => {
        console.error(`Failed to load audio: ${path}`, error);
        reject(error);
      }, { once: true });

      // Important: Set preload and start loading
      audio.preload = 'auto';
      audio.src = path;
      audio.load(); // Explicitly trigger load
    });
  }

  // Preload a single image
  private preloadImage(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already cached
      if (this.imageCache.has(path)) {
        resolve();
        return;
      }

      const img = new Image();

      img.onload = () => {
        this.imageCache.set(path, img);
        resolve();
      };

      img.onerror = (error) => {
        console.error(`Failed to load image: ${path}`, error);
        reject(error);
      };

      img.src = path;
    });
  }

  /**
   * Get preloaded audio element
   */
  getAudio(path: string): HTMLAudioElement | null {
    return this.audioCache.get(path) || null;
  }

  areCriticalAssetsLoaded(): boolean {
    return this.criticalAssetsLoaded();
  }

  areGameAssetsLoaded(): boolean {
    return this.gameAssetsLoaded();
  }

  /**
   * Get preloaded image element
   */
  getImage(path: string): HTMLImageElement | null {
    return this.imageCache.get(path) || null;
  }

  /**
   * Check if all assets are loaded
   */
  areAssetsLoaded(): boolean {
    return this.loadingProgress$.value.percentage === 100;
  }

  /**
   * Update loading progress
   */
  private updateProgress(loaded: number, total: number, currentAsset: string) {
    const percentage = Math.round((loaded / total) * 100);
    this.loadingProgress$.next({
      total,
      loaded,
      percentage,
      currentAsset
    });
  }

  /**
   * Clear cache (useful for memory management)
   */
  clearCache() {
    this.audioCache.clear();
    this.imageCache.clear();
  }
}
