
import React from 'react';
import type { Mode } from '../types';
import { TranslateIcon, TransliterateIcon } from './icons';

interface LandingPageProps {
  setMode: (mode: Mode) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setMode }) => {
  return (
    <div className="text-center w-full">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-cyan-neon">
        Multilingo
      </h1>
      <p className="text-lg sm:text-xl text-gray-digital/80 mb-12 max-w-2xl mx-auto">
        Transl(itr)ation Made Easy with AI
      </p>
      <div className="flex flex-col sm:flex-row gap-6 justify-center">
        <button
          onClick={() => setMode('translation')}
          className="group flex flex-col items-center justify-center p-8 bg-gray-digital border border-cyan-neon/10 rounded-2xl hover:bg-white hover:border-cyan-neon transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-64 h-48 text-indigo-ai"
        >
          <TranslateIcon className="h-12 w-12 text-cyan-neon group-hover:text-indigo-ai mb-4 transition-colors" />
          <span className="text-2xl font-bold">Translation</span>
        </button>
        <button
          onClick={() => setMode('transliteration')}
          className="group flex flex-col items-center justify-center p-8 bg-gray-digital border border-cyan-neon/10 rounded-2xl hover:bg-white hover:border-cyan-neon transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-64 h-48 text-indigo-ai"
        >
          <TransliterateIcon className="h-12 w-12 text-cyan-neon group-hover:text-indigo-ai mb-4 transition-colors" />
          <span className="text-2xl font-bold">Transliteration</span>
        </button>
      </div>
    </div>
  );
};

export default LandingPage;