
import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceProfile } from "./types";
import { decodeBase64, decodeAudioData } from "./audioUtils";

const API_KEY = process.env.API_KEY || "";

export async function generateSpeech(
  thaiText: string,
  englishText: string,
  profile: VoiceProfile,
  audioContext: AudioContext
): Promise<AudioBuffer> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `Please speak the following PR announcement naturally using the persona: ${profile.promptInstruction}
Thai part: ${thaiText}
English part: ${englishText}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: profile.voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!base64Audio) {
    throw new Error("No audio data received from Gemini API");
  }

  const audioBytes = decodeBase64(base64Audio);
  return await decodeAudioData(audioBytes, audioContext, 24000, 1);
}
