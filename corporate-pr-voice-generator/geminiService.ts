
import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceType } from "./types";
import { decodeBase64, decodeAudioData } from "./audioUtils";

const API_KEY = process.env.API_KEY || "";

export async function generateSpeech(
  thaiText: string,
  englishText: string,
  voiceName: VoiceType,
  audioContext: AudioContext
): Promise<AudioBuffer> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Combining texts for a natural flow
  const prompt = `Please speak the following PR announcement naturally.
Thai part: ${thaiText}
English part: ${englishText}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!base64Audio) {
    throw new Error("No audio data received from Gemini API");
  }

  const audioBytes = decodeBase64(base64Audio);
  // Gemini TTS returns raw PCM 24kHz mono
  return await decodeAudioData(audioBytes, audioContext, 24000, 1);
}
