
import React from 'react';
import { languages } from '../services/languageList';
import type { Language } from '../types';

interface LanguageSelectorProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  options?: Language[];
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ id, value, onChange, disabled = false, options = languages }) => {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full bg-gray-digital border border-cyan-neon/20 rounded-md px-3 py-2 text-indigo-ai focus:ring-2 focus:ring-cyan-neon focus:border-cyan-neon transition"
    >
      {options.map(lang => (
        <option key={lang.code} value={lang.code} className="bg-gray-digital text-indigo-ai">
          {lang.name}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;