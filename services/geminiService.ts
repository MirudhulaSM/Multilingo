
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { languages } from './languageList';

// It's assumed that process.env.MULTILINGO_GEMINI_KEY is set in the environment.
const apiKey = process.env.MULTILINGO_GEMINI_KEY;

if (!apiKey) {
    console.error("MULTILINGO_GEMINI_KEY is not set. Please add it to your environment variables or secrets.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY" });
const textModel = "gemini-3-flash-preview";
// FIX: Updated vision model to a recommended model for multimodal tasks.
const visionModel = "gemini-3-flash-preview"; // a vision-capable model
const ttsModel = "gemini-2.5-flash-preview-tts";


const getLanguageName = (code: string) => languages.find(lang => lang.code === code)?.name || code;

export const detectLanguage = async (text: string): Promise<string | null> => {
    if (text.trim().length < 10) return null;

    const prompt = `Detect the language of the following text. Respond with ONLY its ISO 639-1 language code (e.g., "en" for English, "es" for Spanish). Do not provide any other text or explanation.

Text: "${text}"`;

    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
        });
        const detectedCode = response.text?.trim().toLowerCase();
        
        if (detectedCode && languages.some(l => l.code === detectedCode)) {
            return detectedCode;
        }
        return null;
    } catch (error) {
        console.error("Error detecting language:", error);
        return null;
    }
};

export const processText = async (
    mode: 'translation' | 'transliteration',
    text: string,
    sourceLang: string,
    targetLang: string
): Promise<string> => {
    if (!text.trim()) return "";
    
    const sourceLanguageName = getLanguageName(sourceLang);
    const targetLanguageName = getLanguageName(targetLang);

    let prompt: string;
    if (mode === 'translation') {
        prompt = `Translate the following text from ${sourceLanguageName} to ${targetLanguageName}. Only provide the translated text, without any additional explanations or context. Text: "${text}"`;
        if (sourceLang === 'auto') {
            prompt = `Detect the language of the following text and then translate it to ${targetLanguageName}. Only provide the translated text, without any additional explanations or context. Text: "${text}"`;
        }
    } else { // transliteration
        prompt = `Transliterate the following ${sourceLanguageName} text into the ${targetLanguageName} script. For example, if the text is in Hindi using the Roman alphabet, transliterate it to the Devanagari script. Only provide the transliterated text. Text: "${text}"`;
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
        });
        return response.text?.trim() || "No response text.";
    } catch (error) {
        console.error("Error processing text:", error);
        return "Error: Could not process the text.";
    }
};


export const extractTextFromImage = async (
    imageData: string,
    mimeType: string
): Promise<string> => {
    const imagePart = {
        inlineData: {
            data: imageData,
            mimeType,
        },
    };
    const textPart = {
        text: "Extract all text from this image. Provide only the extracted text.",
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: visionModel,
            contents: { parts: [imagePart, textPart] },
        });
        return response.text?.trim() || "No text found in the image.";
    } catch (error) {
        console.error("Error extracting text from image:", error);
        return "Error: Could not extract text from the image.";
    }
};

export const textToSpeech = async (text: string): Promise<string | null> => {
    if (!text.trim()) return null;

    try {
         const response = await ai.models.generateContent({
            model: ttsModel,
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;

    } catch (error) {
        console.error("Error with text-to-speech:", error);
        return null;
    }
};