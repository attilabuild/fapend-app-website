-- Shared cache of AI-adapted tones, keyed by song + gear fingerprint.
-- When user B has the exact same gear as user A and asks for the same song,
-- they get user A's adaptation instantly instead of paying for another AI call.

create table public.adapted_tones (
  fingerprint text primary key,
  song_id text not null,
  part_type text not null,
  user_guitar text not null,
  user_amp text,
  user_multifx text,
  tone_detail jsonb not null,
  created_at timestamptz not null default now()
);

create index adapted_tones_song_idx on public.adapted_tones (song_id);

alter table public.adapted_tones enable row level security;

create policy "adapted_tones_select_all"
  on public.adapted_tones for select
  to authenticated
  using (true);

create policy "adapted_tones_insert_authenticated"
  on public.adapted_tones for insert
  to authenticated
  with check (true);
