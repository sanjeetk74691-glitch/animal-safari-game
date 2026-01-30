import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameMode, GameObject, ColorInfo, GameSettings } from '../types';
import { COLORS, SPEED_INITIAL, SPAWN_RATE_INITIAL, MAX_LIVES, TIME_LIMIT, SCORE_PER_LEVEL, MAX_LEVEL } from '../constants';
import { Heart, Pause, Trophy, Star } from 'lucide-react';

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

interface Props {
  mode: GameMode;
  settings: GameSettings;
  onGameOver: (score: number) => void;
  onPause: () => void;
}

const GameEngine: React.FC<Props> = ({ mode, settings, onGameOver, onPause }) => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(mode === GameMode.CLASSIC ? MAX_LIVES : Infinity);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [targetAnimal, setTargetAnimal] = useState<ColorInfo>(COLORS[0]);
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const requestRef = useRef<number>(0);
  const lastSpawnTime = useRef<number>(0);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const levelRef = useRef(1);
  const targetRef = useRef(COLORS[0]);
  const lastTargetChange = useRef<number>(performance.now());
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgIntervalRef = useRef<number | null>(null);

  const initAudio = () => {
    try {
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
      }
      if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch (e) {
      console.warn("Audio initialization failed", e);
      return null;
    }
  };

  const startBackgroundMusic = useCallback(() => {
    if (!settings.musicEnabled) {
      if (bgIntervalRef.current) {
        clearInterval(bgIntervalRef.current);
        bgIntervalRef.current = null;
      }
      return;
    }
    
    if (bgIntervalRef.current) return;

    const ctx = initAudio();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.012; 
    masterGain.connect(ctx.destination);

    const playAmbientLayer = (time: number) => {
      const drone = ctx.createOscillator();
      const droneG = ctx.createGain();
      drone.type = 'sine';
      drone.frequency.setValueAtTime(55 + Math.random() * 5, time);
      droneG.gain.setValueAtTime(0, time);
      droneG.gain.linearRampToValueAtTime(0.2, time + 2);
      droneG.gain.linearRampToValueAtTime(0, time + 4);
      drone.connect(droneG).connect(masterGain);
      drone.start(time);
      drone.stop(time + 4);

      const drumTime = time;
      for (let i = 0; i < 4; i++) {
        const t = drumTime + i * 1.0;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(40, t);
        osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.8);
        g.gain.setValueAtTime(0.3, t);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
        osc.connect(g).connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.8);
      }
    };

    const loop = () => {
      if (isGameEnded || !settings.musicEnabled) return;
      const now = ctx.currentTime;
      playAmbientLayer(now);
    };

    loop();
    bgIntervalRef.current = window.setInterval(loop, 4000);
  }, [settings.musicEnabled, isGameEnded]);

  useEffect(() => {
    startBackgroundMusic();
    return () => {
      if (bgIntervalRef.current) {
        clearInterval(bgIntervalRef.current);
        bgIntervalRef.current = null;
      }
    };
  }, [startBackgroundMusic]);

  const playAnimalSound = useCallback((animalId: string) => {
    if (!settings.soundEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const createOsc = (type: OscillatorType, freq: number, start: number, end: number, vol: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      osc.connect(g).connect(ctx.destination);
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(vol, start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, end);
      osc.start(start);
      osc.stop(end);
      return osc;
    };

    const createNoise = (freq: number, dur: number, vol: number, filterType: BiquadFilterType = 'lowpass') => {
        const bufferSize = ctx.sampleRate * dur;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.setValueAtTime(freq, now);
        filter.frequency.exponentialRampToValueAtTime(freq / 2, now + dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + dur);
        source.connect(filter).connect(g).connect(ctx.destination);
        source.start(now);
    };

    switch (animalId) {
      case 'lion':
        createNoise(150, 0.8, 0.5);
        createOsc('sawtooth', 45, now, now + 0.8, 0.3);
        break;
      case 'tiger':
        createNoise(220, 0.7, 0.5);
        createOsc('sawtooth', 60, now, now + 0.7, 0.2);
        break;
      case 'elephant':
        const eOsc = createOsc('sawtooth', 140, now, now + 0.9, 0.2);
        eOsc.frequency.exponentialRampToValueAtTime(450, now + 0.2);
        eOsc.frequency.exponentialRampToValueAtTime(220, now + 0.9);
        break;
      default:
        createOsc('sine', 1200 + Math.random() * 1000, now, now + 0.15, 0.15);
    }
  }, [settings.soundEnabled]);

  const playSystemSound = useCallback((type: 'miss' | 'targetChange' | 'gameOver' | 'levelUp') => {
    if (!settings.soundEnabled) return;
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g).connect(ctx.destination);

    if (type === 'miss') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, now);
      g.gain.setValueAtTime(0.2, now);
      g.gain.linearRampToValueAtTime(0, now + 0.4);
    } else if (type === 'targetChange') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      g.gain.setValueAtTime(0.1, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    } else if (type === 'gameOver') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 1.2);
      g.gain.setValueAtTime(0.4, now);
      g.gain.linearRampToValueAtTime(0, now + 1.2);
    } else if (type === 'levelUp') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.8);
      g.gain.setValueAtTime(0.3, now);
      g.gain.linearRampToValueAtTime(0, now + 0.8);
    }
    osc.start(now);
    osc.stop(now + 1.5);
  }, [settings.soundEnabled]);

  const endGame = useCallback(() => {
    if (isGameEnded) return;
    setIsGameEnded(true);
    playSystemSound('gameOver');
    onGameOver(scoreRef.current);
  }, [isGameEnded, onGameOver, playSystemSound]);

  const getRandomAnimal = useCallback((excludeId?: string) => {
    const available = excludeId ? COLORS.filter(c => c.id !== excludeId) : COLORS;
    return available[Math.floor(Math.random() * available.length)];
  }, []);

  const changeTargetAnimal = useCallback(() => {
    const next = getRandomAnimal(targetRef.current.id);
    setTargetAnimal(next);
    targetRef.current = next;
    lastTargetChange.current = performance.now();
    playSystemSound('targetChange');
  }, [getRandomAnimal, playSystemSound]);

  const animate = useCallback((time: number) => {
    if (isGameEnded) return;

    const currentLevel = Math.min(MAX_LEVEL, Math.floor(scoreRef.current / SCORE_PER_LEVEL) + 1);
    if (currentLevel > levelRef.current) {
      levelRef.current = currentLevel;
      setLevel(currentLevel);
      setShowLevelUp(true);
      playSystemSound('levelUp');
      setTimeout(() => setShowLevelUp(false), 2000);
    }

    const currentSpeed = mode === GameMode.KIDS ? 0.35 : (SPEED_INITIAL + (currentLevel - 1) * 0.08);
    const spawnRate = mode === GameMode.KIDS ? 2800 : Math.max(800, SPAWN_RATE_INITIAL - (currentLevel * 70));

    if (time - lastSpawnTime.current > spawnRate) {
      const animalId = Math.random() < 0.35 ? targetRef.current.id : getRandomAnimal().id;
      const newObj: GameObject = {
        id: Date.now() + Math.random(),
        colorId: animalId,
        x: Math.random() * 75 + 12,
        y: -15,
        size: mode === GameMode.KIDS ? 75 : 55, 
        speed: currentSpeed
      };
      setObjects(prev => [...prev, newObj]);
      lastSpawnTime.current = time;
    }

    setObjects(prev => prev.map(obj => ({ ...obj, y: obj.y + (obj.speed * 0.4) })).filter(obj => obj.y < 120));
    setParticles(prev => prev.map(p => ({...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.02})).filter(p => p.life > 0));

    if (performance.now() - lastTargetChange.current > (mode === GameMode.KIDS ? 20000 : 10000)) {
      changeTargetAnimal();
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [mode, getRandomAnimal, changeTargetAnimal, isGameEnded, playSystemSound]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  useEffect(() => {
    if (mode === GameMode.TIME && !isGameEnded) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { endGame(); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, endGame, isGameEnded]);

  const handleTap = (obj: GameObject, e: React.PointerEvent) => {
    e.preventDefault();
    if (isGameEnded) return;
    initAudio();

    if (obj.colorId === targetRef.current.id) {
      playAnimalSound(obj.colorId);
      const pts = 10 + (comboRef.current * 2);
      scoreRef.current += pts;
      setScore(scoreRef.current);
      comboRef.current += 1;
      if (comboRef.current % 5 === 0) changeTargetAnimal();
    } else {
      playSystemSound('miss');
      if (settings.vibrationEnabled && navigator.vibrate) navigator.vibrate(50);
      comboRef.current = 0;
      if (mode === GameMode.CLASSIC) {
        setLives(prev => {
          if (prev <= 1) { endGame(); return 0; }
          return prev - 1;
        });
      }
    }
    setObjects(prev => prev.filter(o => o.id !== obj.id));
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden safari-bg select-none">
      <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-start z-30 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} />
            <span className="text-2xl font-black italic text-white drop-shadow-lg">{score}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Star className="text-emerald-400" size={12} fill="currentColor" />
            <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">LVL {level}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {mode === GameMode.CLASSIC && (
            <div className="flex gap-1 bg-black/50 p-2 rounded-2xl backdrop-blur-xl border border-white/10">
              {[...Array(MAX_LIVES)].map((_, i) => (
                <Heart key={i} fill={i < lives ? "#ef4444" : "transparent"} className={i < lives ? "text-red-500" : "text-white/20"} size={18} />
              ))}
            </div>
          )}
          <button onClick={onPause} className="p-3 bg-white/10 rounded-2xl pointer-events-auto active:scale-90 transition border border-white/20 backdrop-blur-xl shadow-xl">
            <Pause size={22} className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden touch-none">
        {objects.map(obj => {
          const animal = COLORS.find(c => c.id === obj.colorId)!;
          return (
            <div
              key={obj.id}
              onPointerDown={(e) => handleTap(obj, e)}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 active:scale-125 transition-all duration-150"
              style={{ left: `${obj.x}%`, top: `${obj.y}%`, width: obj.size, height: obj.size, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >
              <span className="text-[50px] drop-shadow-2xl">{animal.emoji}</span>
            </div>
          )
        })}
      </div>

      <div className={`p-4 pb-8 flex flex-col items-center gap-2 z-20 shadow-[0_-30px_60px_rgba(0,0,0,0.9)] rounded-t-[3rem] border-t-4 ${settings.darkMode ? 'bg-zinc-950/90 border-emerald-900/50' : 'bg-zinc-50 border-emerald-200'} backdrop-blur-xl`}>
        <div className="w-10 h-1 bg-zinc-800 rounded-full mb-1 opacity-40" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 drop-shadow-md">Expedition Target</span>
        <div className="flex items-center gap-8">
           <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border-4 border-white/15 shadow-2xl relative overflow-hidden">
             <span className="text-5xl z-10 animate-pulse">{targetAnimal.emoji}</span>
           </div>
           <div className="flex flex-col">
             <span className="text-3xl font-black uppercase italic tracking-tighter drop-shadow-lg leading-none" style={{ color: targetAnimal.hex }}>
               {targetAnimal.name}
             </span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GameEngine;