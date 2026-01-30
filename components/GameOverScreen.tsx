
import React from 'react';
import { GameMode } from '../types';
import { RefreshCw, Home, Trophy, Share2, Star } from 'lucide-react';
import { SCORE_PER_LEVEL } from '../constants';

interface Props {
  score: number;
  mode: GameMode;
  highScore: number;
  onRetry: () => void;
  onHome: () => void;
}

const GameOverScreen: React.FC<Props> = ({ score, mode, highScore, onRetry, onHome }) => {
  const isNewRecord = score >= highScore && score > 0;
  const levelReached = Math.floor(score / SCORE_PER_LEVEL) + 1;

  return (
    <div className="flex-1 flex flex-col p-8 items-center justify-center safari-bg animate-[fadeIn_0.5s_ease-out]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm -z-10"></div>
      
      <div className="text-center mb-10">
        <h2 className="text-6xl font-black italic tracking-tighter mb-2 text-emerald-500 uppercase">Safari Done</h2>
        <p className="text-zinc-300 font-bold uppercase tracking-[0.3em]">{mode} ADVENTURE</p>
      </div>

      <div className="w-full max-w-sm bg-black/40 backdrop-blur-md border border-white/10 p-8 rounded-[3.5rem] text-center shadow-2xl mb-12 relative overflow-hidden">
        {isNewRecord && (
            <div className="absolute top-0 left-0 right-0 bg-yellow-400 text-black font-black text-[11px] py-1.5 uppercase tracking-[0.3em] animate-pulse text-center">
              New Jungle King!
            </div>
        )}
        
        <div className="flex flex-col mb-4">
            <span className="text-sm font-bold opacity-60 text-white uppercase tracking-widest mb-2">Final Score</span>
            <span className="text-7xl font-black italic text-white tracking-tighter">{score}</span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8 bg-white/10 py-3 rounded-2xl border border-white/5 shadow-inner">
            <Star className="text-yellow-400" size={20} fill="currentColor" />
            <span className="text-2xl font-black text-white italic">LEVEL {levelReached}</span>
        </div>

        <div className="flex items-center justify-center gap-3 pt-6 border-t border-white/10">
            <Trophy className="text-yellow-600" size={20} />
            <span className="text-sm font-bold opacity-60 text-white uppercase tracking-widest">Personal Best</span>
            <span className="text-xl font-black text-white">{highScore}</span>
        </div>
      </div>

      <div className="w-full flex flex-col gap-4">
        <button 
          onClick={onRetry}
          className="w-full py-6 rounded-3xl bg-emerald-600 text-white flex items-center justify-center gap-3 transform active:scale-95 transition shadow-lg shadow-emerald-900/40"
        >
          <RefreshCw size={24} />
          <span className="text-2xl font-black uppercase italic tracking-tighter">Start New Hunt</span>
        </button>

        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={onHome}
                className="py-4 rounded-3xl bg-zinc-800/80 text-white flex items-center justify-center gap-3 transform active:scale-95 transition backdrop-blur-sm border border-white/10"
            >
                <Home size={20} />
                <span className="text-lg font-bold uppercase italic tracking-widest">Menu</span>
            </button>
            <button 
                className="py-4 rounded-3xl bg-zinc-800/80 text-white flex items-center justify-center gap-3 transform active:scale-95 transition opacity-50 cursor-not-allowed border border-white/10"
            >
                <Share2 size={20} />
                <span className="text-lg font-bold uppercase italic tracking-widest">Log</span>
            </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(1.1); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default GameOverScreen;
