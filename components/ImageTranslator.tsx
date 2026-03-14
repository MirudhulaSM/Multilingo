
import React, { useState, useRef, useCallback } from 'react';
import type { Mode, HistoryItem } from '../types';
import { extractTextFromImage, processText, textToSpeech } from '../services/geminiService';
import LanguageSelector from './LanguageSelector';
import { languages } from '../services/languageList';
import { UploadIcon, SpeakerIcon } from './icons';

interface ImageTranslatorProps {
  mode: Mode;
  updateHistory: (item: HistoryItem) => void;
}

const ImageTranslator: React.FC<ImageTranslatorProps> = ({ mode, updateHistory }) => {
  const [image, setImage] = useState<string | null>(null);
  const [sourceText, setSourceText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setSourceText('');
        setOutputText('');
        setError(null);
        handleImageProcessing(file);
      };
      reader.onerror = () => {
        setError("Failed to read the image file.");
      }
      reader.readAsDataURL(file);
    }
  };

  const handleImageProcessing = async (file: File) => {
    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      try {
        const extracted = await extractTextFromImage(base64Data, file.type);
        setSourceText(extracted);
        if (extracted && extracted !== "No text found in the image.") {
            const result = await processText(mode, extracted, 'auto', targetLang);
            setOutputText(result);
            updateHistory({
              id: new Date().toISOString(),
              mode,
              inputType: 'image',
              sourceLang: 'auto',
              targetLang,
              sourceText: extracted,
              outputText: result,
              timestamp: new Date().toLocaleString(),
            });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setError("Error processing image.");
        setIsLoading(false);
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
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6">
      <h2 className="text-3xl font-bold text-center capitalize">{mode} from Image</h2>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-64 border-2 border-dashed border-cyan-neon/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cyan-neon hover:bg-white/5 transition-colors"
      >
        {image ? (
          <img src={image} alt="Upload preview" className="max-h-full max-w-full object-contain rounded-md" />
        ) : (
          <div className="text-center text-gray-digital/80">
            <UploadIcon className="mx-auto h-12 w-12 text-cyan-neon" />
            <p>Click to upload an image</p>
            <p className="text-sm">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>

        {isLoading && <div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-neon mx-auto mb-2"></div><p>Processing Image...</p></div>}
        {error && <p className="text-red-400 text-center">{error}</p>}


      {sourceText && !isLoading && (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h3 className="font-bold mb-2">Extracted Text</h3>
                <textarea
                    value={sourceText}
                    readOnly
                    className="w-full h-40 p-3 bg-gray-digital text-indigo-ai border border-cyan-neon/20 rounded-lg resize-none"
                />
            </div>
            <div>
                <h3 className="font-bold mb-2 capitalize">{mode} Result</h3>
                <div className="flex items-center gap-2 mb-2">
                    <span>To:</span>
                     <LanguageSelector id="target-lang" value={targetLang} onChange={(e) => setTargetLang(e.target.value)} options={languages.filter(l => l.code !== 'auto')} />
                </div>
                 <div className="relative">
                    <textarea
                        value={outputText}
                        readOnly
                        className="w-full h-40 p-3 bg-gray-digital text-indigo-ai border border-cyan-neon/20 rounded-lg resize-none"
                    />
                    {outputText && (
                         <button onClick={handlePlayAudio} className="absolute bottom-3 right-3 p-2 rounded-full bg-indigo-ai/10 hover:bg-cyan-neon text-indigo-ai hover:text-indigo-ai transition-colors">
                            <SpeakerIcon />
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ImageTranslator;