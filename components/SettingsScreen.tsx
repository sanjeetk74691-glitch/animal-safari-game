
import React from 'react';
import { GameSettings, GameStatus } from '../types';
import { ChevronLeft, Volume2, VolumeX, Smartphone, Moon, Sun, Palette, Info, ShieldCheck, FileText, Music } from 'lucide-react';

interface Props {
  settings: GameSettings;
  onUpdate: (s: GameSettings) => void;
  onBack: () => void;
  onNavigate: (target: GameStatus) => void;
}

const SettingsScreen: React.FC<Props> = ({ settings, onUpdate, onBack, onNavigate }) => {
  const toggle = (key: keyof GameSettings) => {
    const next = { ...settings, [key]: !settings[key] };
    onUpdate(next);
    localStorage.setItem('cm_settings', JSON.stringify(next));
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center mb-8 sticky top-0 bg-inherit py-2 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-zinc-800 transition">
          <ChevronLeft size={32} />
        </button>
        <h2 className="text-3xl font-black ml-2 uppercase italic tracking-tighter">Settings</h2>
      </div>

      <div className="space-y-4 mb-8">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 ml-4 mb-2">Game Options</h3>
        <SettingItem 
          label="Sound Effects" 
          icon={settings.soundEnabled ? <Volume2 /> : <VolumeX />} 
          active={settings.soundEnabled}
          onClick={() => toggle('soundEnabled')}
        />
        <SettingItem 
          label="Background Music" 
          icon={<Music />} 
          active={settings.musicEnabled}
          onClick={() => toggle('musicEnabled')}
        />
        <SettingItem 
          label="Vibration" 
          icon={<Smartphone />} 
          active={settings.vibrationEnabled}
          onClick={() => toggle('vibrationEnabled')}
        />
        <SettingItem 
          label="Dark Mode" 
          icon={settings.darkMode ? <Moon /> : <Sun />} 
          active={settings.darkMode}
          onClick={() => toggle('darkMode')}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 ml-4 mb-2">Legal & Info</h3>
        
        <button 
          onClick={() => onNavigate(GameStatus.ABOUT)}
          className={`w-full p-5 rounded-3xl flex items-center justify-between transition-colors ${settings.darkMode ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-zinc-100 hover:bg-zinc-200'}`}
        >
          <div className="flex items-center gap-4">
            <Info size={20} className="text-indigo-500" />
            <span className="text-lg font-bold">About Game</span>
          </div>
        </button>

        <button 
          onClick={() => onNavigate(GameStatus.PRIVACY)}
          className={`w-full p-5 rounded-3xl flex items-center justify-between transition-colors ${settings.darkMode ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-zinc-100 hover:bg-zinc-200'}`}
        >
          <div className="flex items-center gap-4">
            <ShieldCheck size={20} className="text-green-500" />
            <span className="text-lg font-bold">Privacy Policy</span>
          </div>
        </button>

        <button 
          onClick={() => onNavigate(GameStatus.TERMS)}
          className={`w-full p-5 rounded-3xl flex items-center justify-between transition-colors ${settings.darkMode ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-zinc-100 hover:bg-zinc-200'}`}
        >
          <div className="flex items-center gap-4">
            <FileText size={20} className="text-orange-500" />
            <span className="text-lg font-bold">Terms of Service</span>
          </div>
        </button>
      </div>

      <div className="mt-12 mb-8 text-center opacity-30 text-xs font-bold uppercase tracking-[0.2em]">
        Version 1.0.1 • Animal Safari Match
      </div>
    </div>
  );
};

const SettingItem = ({ label, icon, active, onClick }: { label: string, icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full p-6 rounded-3xl flex items-center justify-between transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-zinc-800 text-zinc-400'}`}
  >
    <div className="flex items-center gap-4">
      {icon}
      <span className="text-xl font-bold uppercase tracking-tight">{label}</span>
    </div>
    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${active ? 'bg-white' : 'bg-zinc-700'}`}>
      <div className={`w-4 h-4 rounded-full transition-transform ${active ? 'translate-x-6 bg-indigo-600' : 'translate-x-0 bg-zinc-400'}`} />
    </div>
  </button>
);

export default SettingsScreen;
