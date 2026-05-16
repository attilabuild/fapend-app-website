import { supabase } from './supabase';
import type {
  Effect,
  EffectColor,
  EffectStatusTag,
  Limitation,
  PartType,
  PhysicalAmpSettings,
  SignalFlowEffect,
  ToneDetail,
  UserGuitarSettings,
} from './types';

export type AdaptInput = {
  songId: string;
  song: string;
  artist: string;
  partType: PartType;
  userGuitar: string; // "Yamaha Pacifica 012"
  userAmp?: string;
  userMultiFx?: string;
  artworkUrl?: string;
};

export class AiAdaptError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AiAdaptError';
  }
}

const ALLOWED_COLORS: EffectColor[] = ['green', 'blue', 'pink', 'teal', 'gray', 'purple'];

function sanitizeColor(value: unknown): EffectColor {
  return typeof value === 'string' && (ALLOWED_COLORS as string[]).includes(value)
    ? (value as EffectColor)
    : 'gray';
}

function sanitizeTags(value: unknown): EffectStatusTag[] {
  if (!Array.isArray(value)) return [];
  const out: EffectStatusTag[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue;
    const t = raw as { label?: unknown; variant?: unknown };
    const label = String(t.label ?? '');
    if (!label) continue;
    const variant: EffectStatusTag['variant'] =
      t.variant === 'critical' || t.variant === 'exact' || t.variant === 'similar'
        ? t.variant
        : 'similar';
    out.push({ label, variant });
  }
  return out;
}

function sanitizeParams(value: unknown): { label: string; value: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((p): p is { label: unknown; value: unknown } => !!p && typeof p === 'object')
    .map((p) => ({ label: String(p.label ?? ''), value: String(p.value ?? '') }))
    .filter((p) => p.label.length > 0);
}

function sanitizeEffect(raw: unknown, fallbackNumber: number): Effect | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const name = String(r.name ?? '').trim();
  if (!name) return null;
  return {
    id:
      typeof r.id === 'string' && r.id
        ? r.id
        : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || `eff-${fallbackNumber}`,
    number: typeof r.number === 'number' ? r.number : fallbackNumber,
    name,
    replaces: String(r.replaces ?? ''),
    type: String(r.type ?? 'Effect'),
    color: sanitizeColor(r.color),
    tags: sanitizeTags(r.tags),
    description: String(r.description ?? ''),
    params: sanitizeParams(r.params),
    callout: typeof r.callout === 'string' ? r.callout : undefined,
    disabled: r.disabled === true,
    enableContext: typeof r.enableContext === 'string' ? r.enableContext : undefined,
  };
}

function sanitizeSignalFlow(raw: unknown): {
  source: 'Guitar';
  deviceLabel: string;
  effects: SignalFlowEffect[];
} {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const effects = Array.isArray(r.effects)
    ? r.effects
        .filter((e): e is { name: unknown; color: unknown } => !!e && typeof e === 'object')
        .map((e) => ({ name: String(e.name ?? ''), color: sanitizeColor(e.color) }))
        .filter((e) => e.name.length > 0)
    : [];
  return {
    source: 'Guitar',
    deviceLabel: String(r.deviceLabel ?? 'Your rig'),
    effects,
  };
}

function sanitizeLimitations(raw: unknown): Limitation[] {
  if (!Array.isArray(raw)) return [];
  const out: Limitation[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const l = item as Record<string, unknown>;
    const body = String(l.body ?? '');
    if (!body) continue;
    const severity: Limitation['severity'] = l.severity === 'major' ? 'major' : 'nice';
    out.push({
      label: String(l.label ?? 'n/a'),
      severity,
      body,
      workaround: typeof l.workaround === 'string' ? l.workaround : undefined,
    });
  }
  return out;
}

function sanitizePhysicalAmp(raw: unknown): PhysicalAmpSettings | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  const knobs = sanitizeParams(r.knobs);
  if (knobs.length === 0) return undefined;
  return {
    eqGuidance: String(r.eqGuidance ?? ''),
    knobs,
  };
}

function sanitizeUserGuitarSettings(
  raw: unknown,
  fallbackGuitar: string
): UserGuitarSettings | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  const bullets = Array.isArray(r.bullets) ? r.bullets.map(String).filter(Boolean) : [];
  return {
    guitarName: String(r.guitarName ?? fallbackGuitar),
    tone: String(r.tone ?? '7'),
    volume: String(r.volume ?? '8'),
    bullets,
  };
}

function sanitizeStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(String).map((s) => s.trim()).filter(Boolean);
}

function sanitize(input: AdaptInput, raw: unknown): ToneDetail {
  if (!raw || typeof raw !== 'object') {
    throw new AiAdaptError('AI returned non-object response');
  }
  const r = raw as Record<string, unknown>;
  const beforeAmpRaw = Array.isArray(
    (r.effectBlocks as Record<string, unknown> | undefined)?.beforeAmp
  )
    ? ((r.effectBlocks as { beforeAmp: unknown[] }).beforeAmp)
    : [];
  const afterAmpRaw = Array.isArray(
    (r.effectBlocks as Record<string, unknown> | undefined)?.afterAmp
  )
    ? ((r.effectBlocks as { afterAmp: unknown[] }).afterAmp)
    : [];

  let counter = 1;
  const beforeAmp = beforeAmpRaw
    .map((e) => sanitizeEffect(e, counter++))
    .filter((e): e is Effect => !!e);
  const afterAmp = afterAmpRaw
    .map((e) => sanitizeEffect(e, counter++))
    .filter((e): e is Effect => !!e);

  const ampModelRaw = (r.ampModel && typeof r.ampModel === 'object'
    ? r.ampModel
    : {}) as Record<string, unknown>;

  return {
    id: input.songId,
    song: input.song,
    artist: input.artist,
    partType: input.partType,
    matchScore:
      typeof r.matchScore === 'number'
        ? Math.max(0, Math.min(100, Math.round(r.matchScore)))
        : 80,
    rig: String(r.rig ?? input.userMultiFx ?? input.userAmp ?? 'Your rig'),
    rigSubtitle: typeof r.rigSubtitle === 'string' ? r.rigSubtitle : undefined,
    artworkUrl: input.artworkUrl,
    keyToneElements: sanitizeStringArray(r.keyToneElements),
    eqGuidance: String(r.eqGuidance ?? ''),
    eqCallout: String(r.eqCallout ?? ''),
    signalFlow: sanitizeSignalFlow(r.signalFlow),
    ampModel: {
      name: String(ampModelRaw.name ?? 'Amp'),
      channel: String(ampModelRaw.channel ?? 'Clean'),
      cabinet: String(ampModelRaw.cabinet ?? '1x12'),
      master: String(ampModelRaw.master ?? '5/10'),
      description: String(ampModelRaw.description ?? ''),
      eqCallout: String(ampModelRaw.eqCallout ?? ''),
    },
    effectBlocks: { beforeAmp, afterAmp },
    physicalAmpSettings: sanitizePhysicalAmp(r.physicalAmpSettings),
    limitations: sanitizeLimitations(r.limitations),
    toneMatchAnalysis: typeof r.toneMatchAnalysis === 'string' ? r.toneMatchAnalysis : undefined,
    setupNotes: sanitizeStringArray(r.setupNotes),
    playingTips: sanitizeStringArray(r.playingTips),
    userGuitarSettings: sanitizeUserGuitarSettings(r.userGuitarSettings, input.userGuitar),
  };
}

function normalizeGear(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function gearFingerprint(input: AdaptInput): string {
  return [
    input.songId,
    input.partType,
    normalizeGear(input.userGuitar),
    normalizeGear(input.userAmp ?? ''),
    normalizeGear(input.userMultiFx ?? ''),
  ].join('|');
}

export async function adaptToneForGear(input: AdaptInput): Promise<ToneDetail> {
  const fingerprint = gearFingerprint(input);

  // Cache lookup is read-only — anyone can SELECT, no abuse vector.
  const { data: cached } = await supabase
    .from('adapted_tones')
    .select('tone_detail')
    .eq('fingerprint', fingerprint)
    .maybeSingle();
  if (cached?.tone_detail) {
    return sanitize(input, cached.tone_detail);
  }

  // The edge function handles the OpenAI call AND writes the cache row using
  // its service-role key, so the client never inserts into the shared cache.
  const { data, error } = await supabase.functions.invoke<{ result?: unknown; error?: string }>(
    'adapt-tone',
    { body: { ...input, fingerprint } }
  );
  if (error) throw new AiAdaptError(error.message || 'Adapt-tone function failed');
  if (!data) throw new AiAdaptError('Empty response from adapt-tone function');
  if (data.error) throw new AiAdaptError(data.error);
  if (!data.result) throw new AiAdaptError('Adapt-tone returned no result');

  return sanitize(input, data.result);
}
