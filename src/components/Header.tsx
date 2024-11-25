import React, { useState } from 'react';
import { LineChart, Settings } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

export const Header = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <LineChart className="h-8 w-8" />
            <h1 className="text-2xl font-bold">TradeSense AI</h1>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Settings className="h-6 w-6" />
          </button>
        </div>
      </header>
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};