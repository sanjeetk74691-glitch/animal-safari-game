
export enum GameMode {
  CLASSIC = 'CLASSIC',
  TIME = 'TIME',
  KIDS = 'KIDS'
}

export enum GameStatus {
  SPLASH = 'SPLASH',
  HOME = 'HOME',
  MODES = 'MODES',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAMEOVER = 'GAMEOVER',
  SETTINGS = 'SETTINGS',
  ABOUT = 'ABOUT',
  PRIVACY = 'PRIVACY',
  TERMS = 'TERMS'
}

export interface ColorInfo {
  id: string;
  name: string;
  hex: string;
  lightHex: string;
  emoji: string;
  imageUrl?: string; // Optional custom image
}

export interface GameObject {
  id: number;
  colorId: string;
  x: number;
  y: number;
  size: number;
  speed: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  darkMode: boolean;
  currentTheme: string;
}

export interface HighScores {
  [GameMode.CLASSIC]: number;
  [GameMode.TIME]: number;
  [GameMode.KIDS]: number;
}
