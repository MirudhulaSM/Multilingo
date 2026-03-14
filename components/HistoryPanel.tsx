
import React from 'react';
import type { HistoryItem } from '../types';
import { getLanguageName } from '../services/languageList';
import { CloseIcon } from './icons';

interface HistoryPanelProps {
  isVisible: boolean;
  onClose: () => void;
  history: HistoryItem[];
  clearHistory: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isVisible, onClose, history, clearHistory }) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-indigo-ai border-l border-cyan-neon/20 flex flex-col transition-transform duration-300 ease-in-out z-40 ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-heading"
      >
        <div className="p-4 flex justify-between items-center border-b border-cyan-neon/20 flex-shrink-0">
          <h2 id="history-heading" className="text-xl font-bold text-gray-digital">
            History
          </h2>
          <div className="flex items-center gap-4">
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-sm text-cyan-neon hover:text-red-400 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="text-cyan-neon hover:text-cyan-neon/80 transition-colors"
              aria-label="Close history panel"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-2">
          {history.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-digital/50">
              <p>Your history will appear here.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {history.map(item => (
                <li key={item.id} className="bg-gray-digital p-3 rounded-lg text-indigo-ai">
                  <div className="flex justify-between items-start text-sm mb-2">
                    <div>
                      <span
                        className={`capitalize px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.mode === 'translation'
                            ? 'bg-indigo-ai/10 text-indigo-ai'
                            : 'bg-indigo-ai/10 text-indigo-ai'
                        }`}
                      >
                        {item.mode}
                      </span>
                      <span className="ml-2 text-indigo-ai/70">{item.inputType}</span>
                    </div>
                    <span className="text-xs text-indigo-ai/50">{item.timestamp.split(',')[0]}</span>
                  </div>
                  <div className="text-xs text-indigo-ai/70 mb-2">
                    {getLanguageName(item.sourceLang)} → {getLanguageName(item.targetLang)}
                  </div>
                  <p className="text-indigo-ai mb-1 truncate" title={item.sourceText}>
                    <strong>In:</strong> {item.sourceText}
                  </p>
                  <p className="font-semibold text-indigo-ai" title={item.outputText}>
                    <strong>Out:</strong> {item.outputText}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
};

export default HistoryPanel;