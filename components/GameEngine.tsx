
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
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
    }
    if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
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
      case 'cheetah':
        createOsc('sine', 1800, now, now + 0.1, 0.2);
        createOsc('sine', 1700, now + 0.15, now + 0.25, 0.15);
        break;
      case 'hippo':
        createNoise(80, 1.2, 0.6);
        createOsc('square', 30, now, now + 1.2, 0.2);
        break;
      case 'camel':
        const camOsc = createOsc('sawtooth', 120, now, now + 0.6, 0.2);
        camOsc.frequency.exponentialRampToValueAtTime(80, now + 0.6);
        break;
      case 'squirrel':
        for(let i=0; i<6; i++) createOsc('sine', 3500 + (Math.random()*500), now + i*0.05, now + i*0.05 + 0.03, 0.1);
        break;
      case 'swan':
        const swanOsc = createOsc('sawtooth', 330, now, now + 0.4, 0.2);
        swanOsc.frequency.exponentialRampToValueAtTime(440, now + 0.2);
        break;
      case 'toucan':
        createNoise(600, 0.1, 0.4, 'bandpass');
        createNoise(600, 0.1, 0.4, 'bandpass');
        break;
      case 'walrus':
        createOsc('sine', 60, now, now + 0.8, 0.6);
        createNoise(100, 0.8, 0.3);
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
      case 'wolf':
        const wOsc = createOsc('sine', 400, now, now + 1.5, 0.3);
        wOsc.frequency.exponentialRampToValueAtTime(900, now + 0.5);
        wOsc.frequency.exponentialRampToValueAtTime(700, now + 1.5);
        break;
      case 'eagle':
        const eagleOsc = createOsc('sawtooth', 1600, now, now + 0.5, 0.15);
        eagleOsc.frequency.exponentialRampToValueAtTime(4200, now + 0.2);
        break;
      case 'special_guest':
        const gOsc = createOsc('sine', 880, now, now + 0.4, 0.1);
        gOsc.frequency.exponentialRampToValueAtTime(1760, now + 0.4);
        break;
      default:
        // Generic chirpy animal sound for anything else
        createOsc('sine', 1200 + Math.random() * 1000, now, now + 0.15, 0.15);
    }
  }, [settings.soundEnabled]);

  const playSystemSound = useCallback((type: 'miss' | 'targetChange' | 'gameOver' | 'levelUp') => {
    if (!settings.soundEnabled) return;
    const ctx = initAudio();
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

    const speedScale = (currentLevel - 1) * 0.08;
    const currentSpeed = mode === GameMode.KIDS ? 0.35 : (SPEED_INITIAL + speedScale);
    const spawnRate = mode === GameMode.KIDS ? 2800 : Math.max(800, SPAWN_RATE_INITIAL - (currentLevel * 70));

    if (time - lastSpawnTime.current > spawnRate) {
      let animalId;
      if (Math.random() < 0.08) {
        animalId = 'special_guest';
      } else {
        animalId = Math.random() < 0.35 ? targetRef.current.id : getRandomAnimal().id;
      }

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

    setParticles(prev => prev.map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      life: p.life - 0.02
    })).filter(p => p.life > 0));

    const targetInterval = mode === GameMode.KIDS ? 20000 : 10000;
    if (performance.now() - lastTargetChange.current > targetInterval) {
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

  const spawnParticles = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color,
        size: Math.random() * 10 + 4,
        life: 1.0
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

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
      spawnFloatingText(`✨ +${pts}`, e.clientX, e.clientY, '#4ade80');
      spawnParticles(e.clientX, e.clientY, targetRef.current.hex);
      if (comboRef.current % 5 === 0) changeTargetAnimal();
    } else {
      playSystemSound('miss');
      if (settings.vibrationEnabled && navigator.vibrate) navigator.vibrate(50);
      comboRef.current = 0;
      spawnFloatingText('Wrong!', e.clientX, e.clientY, '#ef4444');
      if (mode === GameMode.CLASSIC) {
        setLives(prev => {
          if (prev <= 1) { endGame(); return 0; }
          return prev - 1;
        });
      }
    }
    setObjects(prev => prev.filter(o => o.id !== obj.id));
  };

  const spawnFloatingText = (text: string, x: number, y: number, color: string) => {
    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 800);
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden safari-bg select-none">
      <svg className="hidden">
        <defs>
          <filter id="animalTexture" x="-25%" y="-25%" width="150%" height="150%" filterUnits="objectBoundingBox">
            {/* Primary organic turbulence for broad shapes */}
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" seed="42" result="broadNoise"/>
            {/* Micro-detail turbulence for fine-grained texture (hair/feathers) */}
            <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="2" seed="13" result="fineNoise"/>
            <feBlend in="broadNoise" in2="fineNoise" mode="multiply" result="combinedNoise"/>
            
            {/* Warp the edges slightly for a non-digital, organic look */}
            <feDisplacementMap in="SourceGraphic" in2="combinedNoise" scale="3" xChannelSelector="R" yChannelSelector="G" result="warped"/>
            
            {/* Dynamic specular sheen for a "moist" or "alive" surface appearance */}
            <feSpecularLighting in="warped" specularExponent="35" lighting-color="#ffffff" result="specHighlight">
              <fePointLight x="40%" y="40%" z="150" />
            </feSpecularLighting>
            <feComposite in="specHighlight" in2="warped" operator="in" result="maskedSpec"/>

            {/* Diffuse volume pass to ground the character in 3D space */}
            <feDiffuseLighting in="warped" diffuseConstant="1.2" lighting-color="#ffffff" result="diffuseVol">
              <feDistantLight azimuth="225" elevation="55" />
            </feDiffuseLighting>
            <feComposite in="diffuseVol" in2="warped" operator="in" result="maskedDiffuse"/>

            <feMerge>
              <feMergeNode in="maskedDiffuse"/>
              <feMergeNode in="maskedSpec"/>
            </feMerge>
            <feComponentTransfer>
              <feFuncA type="linear" slope="1.1"/>
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      <div className="vines opacity-40"></div>
      
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
          {mode === GameMode.TIME && (
            <div className={`px-4 py-1.5 rounded-2xl backdrop-blur-md font-black text-xl border-2 border-white/20 ${timeLeft < 10 ? 'bg-red-500/80 animate-pulse text-white' : 'bg-black/60 text-white'}`}>
              {timeLeft}s
            </div>
          )}
          <button onClick={onPause} className="p-3 bg-white/10 rounded-2xl pointer-events-auto active:scale-90 transition border border-white/20 backdrop-blur-xl shadow-xl">
            <Pause size={22} className="text-white" />
          </button>
        </div>
      </div>

      {showLevelUp && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center animate-[levelUp_2s_ease-out_forwards]">
            <h2 className="text-6xl font-black text-yellow-400 italic drop-shadow-[0_8px_24px_rgba(0,0,0,1)] uppercase tracking-tighter">Level Up!</h2>
            <p className="text-2xl font-bold text-white italic drop-shadow-lg">Safari Tier {level}</p>
          </div>
        </div>
      )}

      {floatingTexts.map(ft => (
        <div key={ft.id} className="fixed z-50 pointer-events-none font-black text-4xl animate-[floatUp_0.8s_ease-out_forwards]" style={{ left: ft.x, top: ft.y, color: ft.color, textShadow: '0 4px 10px rgba(0,0,0,1)' }}>
          {ft.text}
        </div>
      ))}
      
      {particles.map(p => (
        <div key={p.id} className="fixed pointer-events-none rounded-full blur-[1px]" style={{ left: p.x, top: p.y, width: p.size, height: p.size, backgroundColor: p.color, opacity: p.life }} />
      ))}

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
              <div className="relative flex items-center justify-center animate-[animalFloat_4s_ease-in-out_infinite]">
                {animal.imageUrl ? (
                   <div className="relative p-1 rounded-full bg-gradient-to-tr from-yellow-400 via-emerald-500 to-yellow-600 shadow-[0_0_20px_rgba(255,255,255,0.5)] overflow-hidden">
                     <img 
                        src={animal.imageUrl} 
                        alt={animal.name}
                        className="rounded-full object-cover"
                        style={{ width: `${obj.size}px`, height: `${obj.size}px`, filter: 'url(#animalTexture)' }}
                     />
                     <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                   </div>
                ) : (
                  <span 
                    className="filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.7)]" 
                    style={{ 
                      fontSize: `${obj.size}px`, 
                      filter: 'url(#animalTexture) drop-shadow(0 8px 12px rgba(0,0,0,0.7))',
                      WebkitFilter: 'url(#animalTexture) drop-shadow(0 8px 12px rgba(0,0,0,0.7))' 
                    }}
                  >
                    {animal.emoji}
                  </span>
                )}
                
                <div 
                    className="absolute inset-0 pointer-events-none rounded-full" 
                    style={{ 
                        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)',
                        width: '100%',
                        height: '100%'
                    }} 
                />
              </div>

              {animal.id === targetAnimal.id && (
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-3xl animate-pulse -z-10" />
              )}
            </div>
          ))}
      </div>

      <div className={`p-4 pb-8 flex flex-col items-center gap-2 z-20 shadow-[0_-30px_60px_rgba(0,0,0,0.9)] rounded-t-[3rem] border-t-4 ${settings.darkMode ? 'bg-zinc-950/90 border-emerald-900/50' : 'bg-zinc-50 border-emerald-200'} backdrop-blur-xl`}>
        <div className="w-10 h-1 bg-zinc-800 rounded-full mb-1 opacity-40" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 drop-shadow-md">Expedition Target</span>
        <div className="flex items-center gap-8">
           <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border-4 border-white/15 shadow-2xl relative overflow-hidden group">
             {targetAnimal.imageUrl ? (
                <img 
                    src={targetAnimal.imageUrl} 
                    alt={targetAnimal.name}
                    className="w-full h-full object-cover rounded-[1.8rem] z-10 animate-pulse"
                    style={{ filter: 'url(#animalTexture)' }}
                />
             ) : (
               <span 
                  className="text-5xl z-10 drop-shadow-2xl animate-pulse"
                  style={{ filter: 'url(#animalTexture)' }}
               >
                  {targetAnimal.emoji}
               </span>
             )}
             <div className="absolute inset-0 bg-emerald-500/5 backdrop-blur-sm" />
           </div>
           <div className="flex flex-col">
             <span className="text-3xl font-black uppercase italic tracking-tighter drop-shadow-lg leading-none" style={{ color: targetAnimal.hex }}>
               {targetAnimal.name}
             </span>
             <div className="flex items-center gap-2 mt-1.5 opacity-80">
                <div className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: targetAnimal.hex }} />
                <span className="text-[9px] font-black uppercase tracking-widest text-white drop-shadow-sm">Jungle Found</span>
             </div>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes floatUp { 0% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -100px); } }
        @keyframes animalFloat { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
        @keyframes levelUp { 0% { opacity: 0; transform: scale(0.3) rotate(-15deg); } 40% { opacity: 1; transform: scale(1.4) rotate(5deg); } 100% { opacity: 0; transform: scale(1) rotate(0); } }
      `}</style>
    </div>
  );
};

export default GameEngine;
