
import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechToTextOptions {
    onResult: (transcript: string) => void;
}

// Check for SpeechRecognition API
// FIX: Cast window to `any` to access non-standard `SpeechRecognition` and `webkitSpeechRecognition` properties. This resolves errors about these properties not existing on `window`.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechToText = ({ onResult }: SpeechToTextOptions) => {
    const [isListening, setIsListening] = useState(false);
    // FIX: The original code used `SpeechRecognition` as a type, which conflicts with the constant defined above.
    // Using `any` for the ref's type resolves the "refers to a value, but is being used as a type" error.
    const recognitionRef = useRef<any | null>(null);

    useEffect(() => {
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                 onResult(finalTranscript);
            }
        };
        
        recognition.onend = () => {
            if (isListening) {
                 // Restart listening if it was not intentionally stopped
                recognition.start();
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        
        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onResult]);


    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error("Could not start speech recognition: ", error);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    return {
        isListening,
        startListening,
        stopListening,
        hasRecognitionSupport: !!SpeechRecognition
    };
};