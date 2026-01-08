
export enum VoiceType {
  FEMALE = 'Kore'
}

export interface AudioMetadata {
  blob: Blob;
  url: string;
  duration: number;
}
