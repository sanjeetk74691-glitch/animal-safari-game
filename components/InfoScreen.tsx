
import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface Props {
  title: string;
  type: 'about' | 'privacy' | 'terms';
  onBack: () => void;
}

const InfoScreen: React.FC<Props> = ({ title, type, onBack }) => {
  const getContent = () => {
    switch (type) {
      case 'about':
        return (
          <div className="space-y-4">
            <p className="font-bold text-indigo-500 uppercase tracking-widest text-sm">Welcome to the Blast!</p>
            <p>Color Match Blast is a fast-paced reaction puzzle game designed to test your focus and speed. Developed with love for puzzle enthusiasts.</p>
            <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5 mt-4">
              <h4 className="font-black text-sm uppercase mb-2">How to Play</h4>
              <ul className="list-disc list-inside text-sm space-y-1 opacity-70">
                <li>Watch the target color at the bottom.</li>
                <li>Tap the falling blocks that match that color.</li>
                <li>Tapping the wrong color loses a life (Classic Mode).</li>
                <li>Build combos for high score multipliers!</li>
              </ul>
            </div>
            <p className="text-xs opacity-40 mt-8">© 2024 Color Match Blast Team. All rights reserved.</p>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-4 text-sm opacity-80">
            <p className="font-bold">1. Data Collection</p>
            <p>We respect your privacy. This game is designed to be played offline. We do not collect personal identification information.</p>
            <p className="font-bold">2. Local Storage</p>
            <p>We use local storage on your device only to save high scores and game settings. This data never leaves your device.</p>
            <p className="font-bold">3. Third Party Services</p>
            <p>Currently, we do not use any third-party analytics or tracking tools in the core offline game experience.</p>
          </div>
        );
      case 'terms':
        return (
          <div className="space-y-4 text-sm opacity-80">
            <p className="font-bold">1. Acceptance of Terms</p>
            <p>By downloading or playing Color Match Blast, you agree to these terms.</p>
            <p className="font-bold">2. Use License</p>
            <p>Permission is granted to play the game for personal, non-commercial transitory viewing only.</p>
            <p className="font-bold">3. Fair Play</p>
            <p>You agree not to attempt to modify, reverse engineer, or exploit the game code for unfair advantages.</p>
            <p className="font-bold">4. Disclaimer</p>
            <p>The game is provided "as is" without any warranties, expressed or implied.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      <div className="flex items-center mb-8 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-zinc-800 transition">
          <ChevronLeft size={32} />
        </button>
        <h2 className="text-2xl font-black ml-2 uppercase italic tracking-tighter">{title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto bg-zinc-900/30 rounded-[2rem] p-6 border border-white/5 leading-relaxed">
        {getContent()}
      </div>
      
      <div className="mt-6 text-center shrink-0">
        <button 
          onClick={onBack}
          className="px-8 py-3 bg-indigo-600 rounded-full font-black uppercase text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default InfoScreen;
