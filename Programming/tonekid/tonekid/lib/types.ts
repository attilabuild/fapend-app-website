export type GearType = 'guitar' | 'bass' | 'amp' | 'bassamp' | 'multifx';

export type Tier = 'free' | 'pro';

export type PartType = 'Riff' | 'Solo';
export type ToneType = 'Clean' | 'Distorted';

export type EffectColor = 'green' | 'blue' | 'pink' | 'teal' | 'gray' | 'purple';

export interface UserProfile {
  name: string;
  email: string;
  memberSince: string;
  tier: Tier;
}

export type SkillLevel = 'beginner' | 'hobbyist' | 'gigging' | 'pro';

export type Genre =
  | 'Rock'
  | 'Metal'
  | 'Blues'
  | 'Country'
  | 'Pop'
  | 'Jazz'
  | 'Funk'
  | 'Indie'
  | 'Punk'
  | 'Worship'
  | 'Folk'
  | 'R&B'
  | 'Reggae'
  | 'Prog'
  | 'Shoegaze'
  | 'Hardcore'
  | 'Rap'
  | 'Electronic';

export interface TonePreferences {
  skillLevel: SkillLevel | null;
  instrumentType: 'guitar' | 'bass' | null;
  genres: Genre[];
  toneHeroes: string[];
  notificationsEnabled: boolean;
}

export interface Gear {
  id: string;
  type: GearType;
  brand: string;
  model: string;
  isActive?: boolean;
}

export interface ActiveSetup {
  guitarId: string;
  rigId: string; // amp or multifx
}

export interface ExploreTone {
  id: string;
  song: string;
  artist: string;
  partType: PartType;
  toneType: ToneType;
  likes: number;
  placeholderShade: string; // fallback gray
  artworkUrl: string; // iTunes 600x600
  artworkDominantColor?: string; // hex used as the song-detail gradient base
  genres?: Genre[];
  createdAt?: string; // ISO timestamp from community_tones.created_at
}

export interface SavedTone {
  id: string;
  song: string;
  artist: string;
  partType: PartType;
  gearSummary: string;
  favorited?: boolean;
}

export interface EffectParam {
  label: string;
  value: string;
}

export interface EffectStatusTag {
  label: string;
  variant: 'critical' | 'exact' | 'similar';
}

export interface Effect {
  id: string;
  number: number;
  name: string;
  replaces: string;
  type: string; // Overdrive / Delay / Modulation / etc.
  color: EffectColor;
  tags: EffectStatusTag[];
  description: string;
  params: EffectParam[];
  callout?: string;
  disabled?: boolean;
  enableContext?: string; // e.g. "Enable for solos"
}

export interface SignalFlowEffect {
  name: string;
  color: EffectColor;
}

export interface AmpModel {
  name: string;
  channel: string;
  cabinet: string;
  master: string;
  description: string;
  eqCallout: string;
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface SettingValue {
  label: string;
  value: string;
}

export interface OriginalSongDetail {
  id: string;
  song: string;
  artist: string;
  album?: string;
  year?: string;
  partType: PartType;
  toneType: ToneType;
  difficulty: Difficulty;
  tuning?: string;
  capo?: string;
  tempoBpm?: number;
  songKey?: string;
  stringGauge?: string;
  pickingTechnique?: string;
  version?: 'Studio' | 'Live';
  originalGuitar: string;
  originalPickups: string;
  pickupSelector?: string;
  guitarSettings: SettingValue[];
  originalAmp: string;
  ampSettings: SettingValue[];
  signalChain: SignalFlowEffect[];
  notes?: string;
  toneCharacter?: string[];
  difficultyReasons?: string[];
  cabinet?: string;
}

export interface PhysicalAmpSettings {
  eqGuidance: string;
  knobs: SettingValue[];
}

export interface UserGuitarSettings {
  guitarName: string;
  tone: string; // e.g. "7-8"
  volume: string; // e.g. "8-9"
  bullets: string[];
}

export interface Limitation {
  label: string; // e.g. "n/a" or short title
  severity: 'nice' | 'major';
  body: string;
  workaround?: string;
}

export interface ToneDetail {
  id: string;
  song: string;
  artist: string;
  partType: PartType;
  matchScore: number;
  rig: string; // e.g. "Line 6 Helix Floor / LT / Rack"
  rigSubtitle?: string; // e.g. "Effects chain preset (use with your physical amp)"
  keyToneElements: string[];
  eqGuidance: string;
  eqCallout: string;
  signalFlow: {
    source: 'Guitar';
    deviceLabel: string;
    effects: SignalFlowEffect[];
  };
  ampModel: AmpModel;
  effectBlocks: {
    beforeAmp: Effect[];
    afterAmp: Effect[];
  };
  physicalAmpSettings?: PhysicalAmpSettings;
  limitations?: Limitation[];
  toneMatchAnalysis?: string;
  setupNotes?: string[];
  playingTips?: string[];
  userGuitarSettings?: UserGuitarSettings;
  artworkUrl?: string;
}
