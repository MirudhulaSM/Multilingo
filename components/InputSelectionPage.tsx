
import React from 'react';
import type { Mode, InputType } from '../types';
import { TextIcon, ImageIcon } from './icons';

interface InputSelectionPageProps {
  mode: Mode;
  setInputType: (inputType: InputType) => void;
}

const InputSelectionPage: React.FC<InputSelectionPageProps> = ({ mode, setInputType }) => {
  const modeDisplay = mode.charAt(0).toUpperCase() + mode.slice(1);
  const isTranslation = mode === 'translation';

  return (
    <div className="text-center w-full">
      <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-neon to-white">
        {modeDisplay}
      </h2>
      <p className="text-lg text-gray-digital/80 mb-12">How would you like to provide the input?</p>
      <div className="flex flex-col sm:flex-row gap-6 justify-center">
        <button
          onClick={() => setInputType('text')}
          className="group flex flex-col items-center justify-center p-8 bg-gray-digital border border-cyan-neon/10 rounded-2xl hover:bg-white hover:border-cyan-neon transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-64 h-48 text-indigo-ai"
        >
          <TextIcon className="h-12 w-12 text-cyan-neon group-hover:text-indigo-ai mb-4 transition-colors" />
          <span className="text-xl font-bold">Text & Audio Input</span>
        </button>
        <button
          onClick={() => setInputType('image')}
          className="group flex flex-col items-center justify-center p-8 bg-gray-digital border border-cyan-neon/10 rounded-2xl hover:bg-white hover:border-cyan-neon transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-64 h-48 text-indigo-ai"
        >
          <ImageIcon className="h-12 w-12 text-cyan-neon group-hover:text-indigo-ai mb-4 transition-colors" />
          <span className="text-xl font-bold">Image Input</span>
        </button>
      </div>
    </div>
  );
};

export default InputSelectionPage;