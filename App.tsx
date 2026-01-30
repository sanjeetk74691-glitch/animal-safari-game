
import React, { useState, useEffect, useCallback } from 'react';
import { GameMode, GameStatus, GameSettings, HighScores } from './types';
import { MAX_LIVES } from './constants';
import GameEngine from './components/GameEngine';
import SplashScreen from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import ModeSelector from './components/ModeSelector';
import SettingsScreen from './components/SettingsScreen';
import GameOverScreen from './components/GameOverScreen';
import InfoScreen from './components/InfoScreen';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.SPLASH);
  const [mode, setMode] = useState<GameMode>(GameMode.CLASSIC);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState<HighScores>({
    [GameMode.CLASSIC]: 0,
    [GameMode.TIME]: 0,
    [GameMode.KIDS]: 0,
  });
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    musicEnabled: true,
    vibrationEnabled: true,
    darkMode: true,
    currentTheme: 'default',
  });

  // Load persistence
  useEffect(() => {
    const savedScores = localStorage.getItem('cm_highscores');
    if (savedScores) setHighScores(JSON.parse(savedScores));
    
    const savedSettings = localStorage.getItem('cm_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(prev => ({ ...prev, ...parsed }));
    }
  }, []);

  const updateHighScore = useCallback((newScore: number) => {
    if (newScore > highScores[mode]) {
      const updated = { ...highScores, [mode]: newScore };
      setHighScores(updated);
      localStorage.setItem('cm_highscores', JSON.stringify(updated));
    }
  }, [highScores, mode]);

  const startNewGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setScore(0);
    setStatus(GameStatus.PLAYING);
  };

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    updateHighScore(finalScore);
    setStatus(GameStatus.GAMEOVER);
  };

  const getDynamicBgClass = () => {
    // If we are in the middle of a game experience, use the mode-specific background
    const inGameExperience = [
      GameStatus.PLAYING,
      GameStatus.PAUSED,
      GameStatus.GAMEOVER,
    ].includes(status);

    if (inGameExperience) {
      switch (mode) {
        case GameMode.TIME:
          return 'safari-bg-time';
        case GameMode.KIDS:
          return 'safari-bg-kids';
        case GameMode.CLASSIC:
        default:
          return 'safari-bg-classic';
      }
    }

    // Default to classic for home/menus
    return 'safari-bg-classic';
  };

  return (
    <div 
      className={`fixed inset-0 overflow-hidden flex flex-col transition-all duration-1000 safari-bg ${getDynamicBgClass()} ${settings.darkMode ? 'text-white' : 'text-zinc-900'}`}
    >
      <div className="vines z-10"></div>
      
      {status === GameStatus.SPLASH && (
        <SplashScreen onComplete={() => setStatus(GameStatus.HOME)} />
      )}

      {status === GameStatus.HOME && (
        <HomeScreen 
          onPlay={() => setStatus(GameStatus.MODES)} 
          onSettings={() => setStatus(GameStatus.SETTINGS)}
          highScores={highScores}
          darkMode={settings.darkMode}
        />
      )}

      {status === GameStatus.MODES && (
        <ModeSelector 
          onSelect={startNewGame} 
          onBack={() => setStatus(GameStatus.HOME)} 
        />
      )}

      {status === GameStatus.SETTINGS && (
        <SettingsScreen 
          settings={settings} 
          onUpdate={setSettings} 
          onBack={() => setStatus(GameStatus.HOME)} 
          onNavigate={(target) => setStatus(target)}
        />
      )}

      {status === GameStatus.ABOUT && (
        <InfoScreen title="About" type="about" onBack={() => setStatus(GameStatus.SETTINGS)} />
      )}
      {status === GameStatus.PRIVACY && (
        <InfoScreen title="Privacy Policy" type="privacy" onBack={() => setStatus(GameStatus.SETTINGS)} />
      )}
      {status === GameStatus.TERMS && (
        <InfoScreen title="Terms of Service" type="terms" onBack={() => setStatus(GameStatus.SETTINGS)} />
      )}

      {status === GameStatus.PLAYING && (
        <GameEngine 
          mode={mode} 
          settings={settings}
          onGameOver={handleGameOver}
          onPause={() => setStatus(GameStatus.PAUSED)}
        />
      )}

      {status === GameStatus.PAUSED && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-4xl font-bold mb-8 italic uppercase tracking-tighter">Safari Paused</h2>
          <button 
            onClick={() => setStatus(GameStatus.PLAYING)}
            className="w-full max-w-xs bg-emerald-500 py-4 rounded-2xl text-2xl font-black italic uppercase shadow-[0_8px_0_rgb(5,150,105)] mb-6 transform active:translate-y-1 active:shadow-none transition"
          >
            Resume
          </button>
          <button 
            onClick={() => setStatus(GameStatus.HOME)}
            className="w-full max-w-xs bg-zinc-800 py-4 rounded-2xl text-2xl font-bold shadow-lg transform active:scale-95 transition"
          >
            Abandon Hunt
          </button>
        </div>
      )}

      {status === GameStatus.GAMEOVER && (
        <GameOverScreen 
          score={score} 
          mode={mode}
          highScore={highScores[mode]}
          onRetry={() => startNewGame(mode)}
          onHome={() => setStatus(GameStatus.HOME)}
        />
      )}
    </div>
  );
};

export default App;
