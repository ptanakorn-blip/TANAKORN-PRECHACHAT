
export enum VoiceType {
  AOEDE = 'Aoede',
  KORE = 'Kore',
  PUCK = 'Puck',
  CHARON = 'Charon',
  FENRIR = 'Fenrir',
  ZEPHYR = 'Zephyr'
}

export interface VoiceProfile {
  id: string;
  label: string;
  description: string;
  voiceName: VoiceType;
  promptInstruction: string;
}

export const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: 'f_standard',
    label: 'ผู้หญิง (ทางการ)',
    description: 'เสียงชัดเจน เหมาะสำหรับประกาศทั่วไป',
    voiceName: VoiceType.KORE,
    promptInstruction: 'Professional adult female, clear and formal tone.'
  },
  {
    id: 'f_child',
    label: 'เด็ก (สดใส)',
    description: 'เสียงเด็กผู้หญิง ร่าเริง อ่อนโยน',
    voiceName: VoiceType.AOEDE,
    promptInstruction: 'Cheerful young child, gentle and innocent tone.'
  },
  {
    id: 'f_teen',
    label: 'วัยรุ่นหญิง',
    description: 'เสียงวัยรุ่น ทันสมัย กระฉับกระเฉง',
    voiceName: VoiceType.KORE,
    promptInstruction: 'Modern teenage female, energetic and friendly tone.'
  },
  {
    id: 'm_professional',
    label: 'ผู้ชาย (ทางการ)',
    description: 'เสียงทุ้ม นุ่มลึก น่าเชื่อถือ',
    voiceName: VoiceType.PUCK,
    promptInstruction: 'Professional adult male, authoritative and reliable tone.'
  },
  {
    id: 'm_senior',
    label: 'ผู้สูงอายุ (ชาย)',
    description: 'เสียงผู้ใหญ่อาวุโส ใจดี มีเมตตา',
    voiceName: VoiceType.CHARON,
    promptInstruction: 'Kind elderly male, slow and warm tone.'
  },
  {
    id: 'm_teen',
    label: 'วัยรุ่นชาย',
    description: 'เสียงวัยรุ่นชาย ทันสมัย สดใส',
    voiceName: VoiceType.ZEPHYR,
    promptInstruction: 'Youthful modern male, bright and casual tone.'
  },
  {
    id: 'm_deep',
    label: 'ผู้ชาย (ทุ้มลึก)',
    description: 'เสียงทุ้มต่ำ มีพลัง อำนาจ',
    voiceName: VoiceType.FENRIR,
    promptInstruction: 'Deep powerful male, commanding and strong tone.'
  }
];

export interface AudioMetadata {
  blob: Blob;
  url: string;
  duration: number;
}
