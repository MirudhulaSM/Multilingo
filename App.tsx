
import React, { useState, useEffect, useCallback } from 'react';
import type { Mode, InputType, HistoryItem } from './types';
import LandingPage from './components/LandingPage';
import InputSelectionPage from './components/InputSelectionPage';
import TextTranslator from './components/TextTranslator';
import ImageTranslator from './components/ImageTranslator';
import HistoryPanel from './components/HistoryPanel';
import { BackArrowIcon, HistoryIcon } from './components/icons';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode | null>(null);
  const [inputType, setInputType] = useState<InputType | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('translationHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage:", error);
    }
  }, []);

  const updateHistory = useCallback((item: HistoryItem) => {
    setHistory(prevHistory => {
      const newHistory = [item, ...prevHistory].slice(0, 50); // Keep last 50 items
      try {
        localStorage.setItem('translationHistory', JSON.stringify(newHistory));
      } catch (error) {
        console.error("Failed to save history to localStorage:", error);
      }
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem('translationHistory');
    } catch (error) {
      console.error("Failed to clear history in localStorage:", error);
    }
  }, []);

  const handleBack = () => {
    if (inputType) {
      setInputType(null);
    } else if (mode) {
      setMode(null);
    }
  };

  const renderContent = () => {
    if (!mode) {
      return <LandingPage setMode={setMode} />;
    }
    if (!inputType) {
      return <InputSelectionPage setInputType={setInputType} mode={mode} />;
    }
    if (inputType === 'text') {
      return <TextTranslator mode={mode} updateHistory={updateHistory} />;
    }
    if (inputType === 'image') {
      return <ImageTranslator mode={mode} updateHistory={updateHistory} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-indigo-ai text-gray-digital font-sans">
      <div className="relative p-4 sm:p-6 md:p-8">
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
          {mode && (
            <button
              onClick={handleBack}
              className="text-cyan-neon hover:text-cyan-neon/80 transition-colors flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 text-sm"
            >
              <BackArrowIcon />
              Back
            </button>
          )}
        </div>
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
          <button
            onClick={() => setIsHistoryVisible(true)}
            className="text-cyan-neon hover:text-cyan-neon/80 transition-colors flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 text-sm"
            aria-label="Open history panel"
          >
            <HistoryIcon className="h-5 w-5" />
            <span>History</span>
          </button>
        </div>

        <div className="max-w-4xl mx-auto w-full flex flex-col items-center justify-center min-h-screen">
          {renderContent()}
        </div>
      </div>
      <HistoryPanel
        isVisible={isHistoryVisible}
        onClose={() => setIsHistoryVisible(false)}
        history={history}
        clearHistory={clearHistory}
      />
    </div>
  );
};

export default App;