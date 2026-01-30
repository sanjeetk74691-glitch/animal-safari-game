
import React from 'react';
import { Play, Settings, Trophy } from 'lucide-react';
import { HighScores, GameMode } from '../types';

interface Props {
  onPlay: () => void;
  onSettings: () => void;
  highScores: HighScores;
  darkMode: boolean;
}

const HomeScreen: React.FC<Props> = ({ onPlay, onSettings, highScores, darkMode }) => {
  return (
    <div className="flex-1 flex flex-col p-6 items-center justify-between safari-bg overflow-hidden relative">
      <div className="vines"></div>
      
      <div className="mt-16 text-center z-10">
        <div className="flex justify-center gap-3 mb-4 text-4xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            <span className="floating" style={{ animationDelay: '0s' }}>🦁</span>
            <span className="floating" style={{ animationDelay: '0.2s' }}>🐘</span>
            <span className="floating" style={{ animationDelay: '0.4s' }}>🦒</span>
            <span className="floating" style={{ animationDelay: '0.6s' }}>🐯</span>
        </div>
        <h1 className="text-6xl font-black italic tracking-tighter mb-2 text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">SAFARI</h1>
        <div className="inline-block px-6 py-2 bg-emerald-600 text-white font-black rounded-xl transform -rotate-2 shadow-xl border-2 border-emerald-400/30">MATCH BLAST</div>
      </div>

      <div className="w-full flex flex-col gap-4 items-center z-10">
        <button 
          onClick={onPlay}
          className="w-full max-w-xs group bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-[2.5rem] flex items-center justify-center gap-4 shadow-[0_12px_0_rgb(5,150,105)] transform active:translate-y-2 active:shadow-none transition-all"
        >
          <Play fill="white" size={32} />
          <span className="text-3xl font-black uppercase tracking-tight italic">Enter Jungle</span>
        </button>

        <button 
          onClick={onSettings}
          className={`w-full max-w-xs group ${darkMode ? 'bg-zinc-900/80 border border-white/10' : 'bg-white border-2 border-zinc-200'} py-4 rounded-3xl flex items-center justify-center gap-3 shadow-lg transform active:scale-95 transition-all text-white backdrop-blur-sm`}
        >
          <Settings size={24} />
          <span className="text-xl font-bold uppercase tracking-widest">Setup Camp</span>
        </button>
      </div>

      <div className={`w-full max-w-sm rounded-[2.5rem] p-7 mb-8 z-10 ${darkMode ? 'bg-zinc-950/80 border border-white/5' : 'bg-zinc-100'} backdrop-blur-md shadow-2xl`}>
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={20} className="text-yellow-500" />
          <h3 className="font-black uppercase tracking-widest text-xs opacity-60">Expedition Records</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">Classic</span>
            <span className="text-2xl font-black text-white">{highScores[GameMode.CLASSIC]}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">Time</span>
            <span className="text-2xl font-black text-white">{highScores[GameMode.TIME]}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">Kids</span>
            <span className="text-2xl font-black text-white">{highScores[GameMode.KIDS]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
