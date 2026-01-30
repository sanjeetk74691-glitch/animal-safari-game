
import React, { useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

const SplashScreen: React.FC<Props> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center safari-bg p-8">
      <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-6 transform rotate-12 floating">
        <div className="grid grid-cols-2 gap-2 p-4 text-4xl">
          <span>🦁</span>
          <span>🐘</span>
          <span>🐯</span>
          <span>🐸</span>
        </div>
      </div>
      <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Animal Safari</h1>
      <h2 className="text-xl font-bold text-emerald-200 uppercase tracking-[0.3em]">Match Blast</h2>
      
      <div className="mt-12 w-48 h-2 bg-emerald-950 rounded-full overflow-hidden">
        <div className="h-full bg-white animate-[loading_2s_ease-in-out]"></div>
      </div>
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
