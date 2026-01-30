
import React from 'react';
import { GameMode } from '../types';
import { ChevronLeft, Timer, Heart, Baby } from 'lucide-react';

interface Props {
  onSelect: (mode: GameMode) => void;
  onBack: () => void;
}

const ModeSelector: React.FC<Props> = ({ onSelect, onBack }) => {
  const modes = [
    { 
      id: GameMode.CLASSIC, 
      name: 'Classic', 
      desc: '3 Lives. Speed increases over time.', 
      icon: <Heart fill="currentColor" size={28} />, 
      color: 'bg-red-500' 
    },
    { 
      id: GameMode.TIME, 
      name: 'Time Attack', 
      desc: '60 Seconds. Grab max score!', 
      icon: <Timer size={28} />, 
      color: 'bg-blue-500' 
    },
    { 
      id: GameMode.KIDS, 
      name: 'Kids Mode', 
      desc: 'No Game Over. Big & Slow colors.', 
      icon: <Baby size={28} />, 
      color: 'bg-green-500' 
    }
  ];

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-zinc-800">
          <ChevronLeft size={32} />
        </button>
        <h2 className="text-3xl font-black ml-2 uppercase italic tracking-tighter">Select Mode</h2>
      </div>

      <div className="flex flex-col gap-4">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={`${m.color} text-white p-6 rounded-[2rem] flex items-center gap-4 text-left shadow-xl transform active:scale-[0.98] transition-all`}
          >
            <div className="p-4 bg-white/20 rounded-2xl">
              {m.icon}
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">{m.name}</h3>
              <p className="text-white/80 text-sm font-medium">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector;
