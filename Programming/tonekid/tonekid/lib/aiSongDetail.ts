import { supabase } from './supabase';
import type {
  Difficulty,
  OriginalSongDetail,
  PartType,
  SettingValue,
  SignalFlowEffect,
  ToneType,
  EffectColor,
} from './types';

export type SongDetailInput = {
  songId: string;
  song: string;
  artist: string;
  album?: string;
  year?: string;
};

export class AiSongDetailError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AiSongDetailError';
  }
}

const ALLOWED_COLORS: EffectColor[] = ['green', 'blue', 'pink', 'teal', 'gray', 'purple'];

function sanitizeColor(value: unknown): EffectColor {
  return typeof value === 'string' && (ALLOWED_COLORS as string[]).includes(value)
    ? (value as EffectColor)
    : 'gray';
}

function sanitizeStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(String).map((s) => s.trim()).filter(Boolean);
}

function sanitizeSettings(raw: unknown): SettingValue[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p): p is { label: unknown; value: unknown } => !!p && typeof p === 'object')
    .map((p) => ({ label: String(p.label ?? ''), value: String(p.value ?? '') }))
    .filter((p) => p.label.length > 0);
}

function sanitizeSignalChain(raw: unknown): SignalFlowEffect[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((e): e is { name: unknown; color: unknown } => !!e && typeof e === 'object')
    .map((e) => ({ name: String(e.name ?? ''), color: sanitizeColor(e.color) }))
    .filter((e) => e.name.length > 0);
}

function clampDifficulty(v: unknown): Difficulty {
  return v === 'Beginner' || v === 'Intermediate' || v === 'Advanced' ? v : 'Intermediate';
}

function clampPartType(v: unknown): PartType {
  return v === 'Solo' ? 'Solo' : 'Riff';
}

function clampToneType(v: unknown): ToneType {
  return v === 'Distorted' ? 'Distorted' : 'Clean';
}

function clampVersion(v: unknown): 'Studio' | 'Live' | undefined {
  if (v === 'Studio' || v === 'Live') return v;
  return undefined;
}

function sanitize(input: SongDetailInput, raw: unknown): OriginalSongDetail {
  if (!raw || typeof raw !== 'object') {
    throw new AiSongDetailError('AI returned non-object response');
  }
  const r = raw as Record<string, unknown>;
  const tempoNum = typeof r.tempoBpm === 'number' ? Math.round(r.tempoBpm) : undefined;
  return {
    id: input.songId,
    song: input.song,
    artist: input.artist,
    album: input.album,
    year: input.year,
    partType: clampPartType(r.partType),
    toneType: clampToneType(r.toneType),
    difficulty: clampDifficulty(r.difficulty),
    tuning: typeof r.tuning === 'string' ? r.tuning : undefined,
    capo: typeof r.capo === 'string' ? r.capo : undefined,
    tempoBpm: typeof tempoNum === 'number' && Number.isFinite(tempoNum) ? tempoNum : undefined,
    songKey: typeof r.songKey === 'string' ? r.songKey : undefined,
    stringGauge: typeof r.stringGauge === 'string' ? r.stringGauge : undefined,
    pickingTechnique: typeof r.pickingTechnique === 'string' ? r.pickingTechnique : undefined,
    version: clampVersion(r.version),
    originalGuitar: String(r.originalGuitar ?? 'Unknown guitar'),
    originalPickups: String(r.originalPickups ?? ''),
    pickupSelector: typeof r.pickupSelector === 'string' ? r.pickupSelector : undefined,
    guitarSettings: sanitizeSettings(r.guitarSettings),
    originalAmp: String(r.originalAmp ?? 'Unknown amp'),
    ampSettings: sanitizeSettings(r.ampSettings),
    signalChain: sanitizeSignalChain(r.signalChain),
    notes: typeof r.notes === 'string' ? r.notes : undefined,
    toneCharacter: sanitizeStringArray(r.toneCharacter),
    difficultyReasons: sanitizeStringArray(r.difficultyReasons),
    cabinet: typeof r.cabinet === 'string' ? r.cabinet : undefined,
  };
}

export async function researchSongDetail(input: SongDetailInput): Promise<OriginalSongDetail> {
  const { data, error } = await supabase.functions.invoke<{
    result?: unknown;
    error?: string;
    cached?: boolean;
  }>('research-song', { body: input });
  if (error) throw new AiSongDetailError(error.message || 'Research-song function failed');
  if (!data) throw new AiSongDetailError('Empty response from research-song function');
  if (data.error) throw new AiSongDetailError(data.error);
  if (!data.result) throw new AiSongDetailError('Research-song returned no result');
  return sanitize(input, data.result);
}
