
import React, { useState, useCallback, useEffect } from 'react';
import type { Mode, HistoryItem } from '../types';
import { processText, textToSpeech, detectLanguage } from '../services/geminiService';
import { useSpeechToText } from '../hooks/useSpeechToText';
import LanguageSelector from './LanguageSelector';
import { languages } from '../services/languageList';
import { SwapIcon, MicIcon, SpeakerIcon } from './icons';

interface TextTranslatorProps {
  mode: Mode;
  updateHistory: (item: HistoryItem) => void;
}

const TextTranslator: React.FC<TextTranslatorProps> = ({ mode, updateHistory }) => {
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [sourceText, setSourceText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedLangInfo, setDetectedLangInfo] = useState<{ name: string; code: string } | null>(null);
  const [isTouched, setIsTouched] = useState(false);

  const isInputInvalid = isTouched && !sourceText.trim();

  useEffect(() => {
    if (sourceLang !== 'auto' || sourceText.trim().length < 10) {
      setDetectedLangInfo(null);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const code = await detectLanguage(sourceText);
        if (code) {
          const name = languages.find(l => l.code === code)?.name || code;
          setDetectedLangInfo({ name, code });
        } else {
          setDetectedLangInfo(null);
        }
      } catch (e) {
        console.error("Language detection failed", e);
        setDetectedLangInfo(null);
      }
    }, 500); // Debounce for 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [sourceText, sourceLang]);

  const handleSpeechResult = useCallback((transcript: string) => {
    setSourceText(prev => prev + transcript);
  }, []);

  const { isListening, startListening, stopListening, hasRecognitionSupport } = useSpeechToText({ onResult: handleSpeechResult });
  
  const handleProcessText = async () => {
    if (!sourceText.trim()) return;
    setIsLoading(true);
    setError(null);
    setOutputText('');
    const effectiveSourceLang = (sourceLang === 'auto' && detectedLangInfo) ? detectedLangInfo.code : sourceLang;
    try {
      const result = await processText(mode, sourceText, effectiveSourceLang, targetLang);
      setOutputText(result);
      updateHistory({
        id: new Date().toISOString(),
        mode,
        inputType: 'text',
        sourceLang: effectiveSourceLang,
        targetLang,
        sourceText,
        outputText: result,
        timestamp: new Date().toLocaleString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    const effectiveSourceLang = (sourceLang === 'auto' && detectedLangInfo) ? detectedLangInfo.code : sourceLang;
    if (effectiveSourceLang === 'auto') return;
    setSourceLang(targetLang);
    setTargetLang(effectiveSourceLang);
    setSourceText(outputText);
    setOutputText(sourceText);
    setDetectedLangInfo(null);
  };

  const handleSourceLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSourceLang(e.target.value);
    if (e.target.value !== 'auto') {
      setDetectedLangInfo(null);
    }
  };
  
  const handlePlayAudio = async () => {
    if (!outputText.trim()) return;
    const audioData = await textToSpeech(outputText);
    if (audioData) {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const binaryString = atob(audioData);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const dataInt16 = new Int16Array(bytes.buffer);
            const frameCount = dataInt16.length;
            const buffer = audioContext.createBuffer(1, frameCount, 24000);
            const channelData = buffer.getChannelData(0);
            for (let i = 0; i < frameCount; i++) {
                channelData[i] = dataInt16[i] / 32768.0;
            }
            
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start();
        } catch (e) {
            console.error("Error playing audio: ", e)
        }
    }
  };

  const isTranslation = mode === 'translation';
  
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
        <h2 className="text-3xl font-bold text-center mb-4 capitalize">{mode}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
                <LanguageSelector id="source-lang" value={sourceLang} onChange={handleSourceLangChange} />
                {sourceLang === 'auto' && detectedLangInfo && (
                  <p className="text-sm text-gray-digital/80 -mt-1 ml-1">
                      Detected: <span className="font-semibold text-cyan-neon">{detectedLangInfo.name}</span>
                  </p>
                )}
                <div className="relative">
                    <textarea
                        value={sourceText}
                        onChange={(e) => {
                            setSourceText(e.target.value);
                            if (!isTouched) setIsTouched(true);
                        }}
                        onBlur={() => setIsTouched(true)}
                        placeholder="Enter text..."
                        className={`w-full h-48 p-3 bg-gray-digital text-indigo-ai border rounded-lg resize-none transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-ai ${
                            isInputInvalid 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-cyan-neon/20 focus:ring-cyan-neon'
                        }`}
                    />
                    {isInputInvalid && (
                        <p className="text-xs text-red-500 mt-1 absolute left-0 -bottom-5">
                            Please enter some text to {mode}.
                        </p>
                    )}
                    {hasRecognitionSupport && (
                        <button onClick={isListening ? stopListening : startListening} className={`absolute bottom-3 right-3 p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-ai/10 hover:bg-cyan-neon text-indigo-ai hover:text-indigo-ai transition-colors'}`}>
                            <MicIcon />
                        </button>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-2">
                    <button onClick={handleSwapLanguages} disabled={sourceLang === 'auto' && !detectedLangInfo} className="p-2 rounded-full bg-gray-digital hover:bg-white text-indigo-ai disabled:opacity-50 disabled:cursor-not-allowed transition">
                        <SwapIcon />
                    </button>
                    <LanguageSelector id="target-lang" value={targetLang} onChange={(e) => setTargetLang(e.target.value)} options={languages.filter(l => l.code !== 'auto')} />
                </div>
                <div className="relative">
                    <textarea
                        value={isLoading ? 'Processing...' : outputText}
                        readOnly
                        placeholder={mode === 'translation' ? 'Translation' : 'Transliteration'}
                        className="w-full h-48 p-3 bg-gray-digital text-indigo-ai border border-cyan-neon/20 rounded-lg resize-none focus:outline-none"
                    />
                    {outputText && !isLoading && (
                        <button onClick={handlePlayAudio} className="absolute bottom-3 right-3 p-2 rounded-full bg-indigo-ai/10 hover:bg-cyan-neon text-indigo-ai hover:text-indigo-ai transition-colors">
                            <SpeakerIcon />
                        </button>
                    )}
                </div>
            </div>
        </div>
        {error && <p className="text-red-400 text-center">{error}</p>}
        <button
            onClick={() => {
                if (!sourceText.trim()) {
                    setIsTouched(true);
                    return;
                }
                handleProcessText();
            }}
            disabled={isLoading || !sourceText.trim()}
            className={`w-full py-3 px-4 font-bold rounded-lg transition-all duration-300 ${
                isLoading || !sourceText.trim()
                ? 'bg-gray-digital/20 text-gray-digital/50 cursor-not-allowed'
                : 'bg-cyan-neon hover:bg-cyan-neon/80 text-indigo-ai transform hover:scale-[1.01] active:scale-[0.99]'
            }`}
        >
            {isLoading ? 'Processing...' : (mode === 'translation' ? 'Translate' : 'Transliterate')}
        </button>
    </div>
  );
};

export default TextTranslator;