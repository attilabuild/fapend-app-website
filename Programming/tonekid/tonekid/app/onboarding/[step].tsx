import * as Notifications from "expo-notifications";
import { router, useLocalSearchParams } from "expo-router";
import { Bell, Check, ChevronLeft, Sparkles } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, TextField } from "@/components/ui";
import { colors } from "@/constants/tokens";
import { useApp } from "@/lib/store";
import type { Genre, SkillLevel } from "@/lib/types";

const TOTAL = 10;

const SKILL_OPTIONS: {
  value: SkillLevel;
  label: string;
  sub: string;
  emoji: string;
}[] = [
  {
    value: "beginner",
    label: "Just starting",
    sub: "Learning my first chords",
    emoji: "🌱",
  },
  {
    value: "hobbyist",
    label: "Hobbyist",
    sub: "I play at home for fun",
    emoji: "🎸",
  },
  {
    value: "gigging",
    label: "Gigging",
    sub: "I play live or with a band",
    emoji: "🎤",
  },
  { value: "pro", label: "Pro", sub: "Music is what I do", emoji: "🔥" },
];

const GENRE_EMOJI: Record<Genre, string> = {
  Rock: "🤘",
  Metal: "🔥",
  Blues: "💙",
  Country: "🤠",
  Pop: "✨",
  Jazz: "🎷",
  Funk: "🕺",
  Indie: "🌃",
  Punk: "⚡",
  Worship: "🙏",
  Folk: "🪕",
  "R&B": "💎",
  Reggae: "🌴",
  Prog: "🌀",
  Shoegaze: "👟",
  Hardcore: "💢",
  Rap: "🎤",
  Electronic: "🎛️",
};

const GENRE_OPTIONS: Genre[] = [
  "Rock",
  "Metal",
  "Blues",
  "Country",
  "Pop",
  "Jazz",
  "Funk",
  "Indie",
  "Punk",
  "Worship",
  "Folk",
  "R&B",
  "Reggae",
  "Prog",
  "Shoegaze",
  "Hardcore",
  "Rap",
  "Electronic",
];

const HERO_OPTIONS: { name: string; photo?: string }[] = [
  {
    name: "Jimi Hendrix",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Jimi_Hendrix_%281967%29_%28cropped%29.jpg/250px-Jimi_Hendrix_%281967%29_%28cropped%29.jpg",
  },
  {
    name: "David Gilmour",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/DGilmourRAH111024_%2821_of_63%29_%28cropped%29.jpg/250px-DGilmourRAH111024_%2821_of_63%29_%28cropped%29.jpg",
  },
  {
    name: "Slash",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Slash_live_in_London_2022_%28Cropped_-_upright%29.jpg/250px-Slash_live_in_London_2022_%28Cropped_-_upright%29.jpg",
  },
  {
    name: "John Mayer",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/JohnMayerin2019.jpg/250px-JohnMayerin2019.jpg",
  },
  {
    name: "Eddie Van Halen",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Eddie_Van_Halen_at_the_New_Haven_Coliseum.jpg/250px-Eddie_Van_Halen_at_the_New_Haven_Coliseum.jpg",
  },
  {
    name: "Stevie Ray Vaughan",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Stevie_Ray_Vaughan_Live_1983.jpg/250px-Stevie_Ray_Vaughan_Live_1983.jpg",
  },
  {
    name: "James Hetfield",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/James_Hetfield_2025_Marvel_Stadium_%288%29.jpg/250px-James_Hetfield_2025_Marvel_Stadium_%288%29.jpg",
  },
  {
    name: "Jimmy Page",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Jimmy_Page_at_the_Echo_music_award_2013.jpg/250px-Jimmy_Page_at_the_Echo_music_award_2013.jpg",
  },
  {
    name: "Mark Knopfler",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Mar-Knopfler-Pensa-Blue.jpg/250px-Mar-Knopfler-Pensa-Blue.jpg",
  },
  {
    name: "Brian May",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Brian_May_%2854760284093%29.jpg/250px-Brian_May_%2854760284093%29.jpg",
  },
  {
    name: "B.B. King",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Bbking.jpg/250px-Bbking.jpg",
  },
  {
    name: "John Frusciante",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/John_Frusciante_%2852279457795%29.jpg/250px-John_Frusciante_%2852279457795%29.jpg",
  },
  {
    name: "Eric Clapton",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/JeffBeckTribute1RAH220523_%28106_of_136%29_%2852920038844%29_%28Eric_Clapton%29.jpg/250px-JeffBeckTribute1RAH220523_%28106_of_136%29_%2852920038844%29_%28Eric_Clapton%29.jpg",
  },
  {
    name: "Joe Bonamassa",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Joe_Bonamassa_-_2013_World_Tour_-_Meistersingerhalle_Nuernberg_-_11-03-2013_%28-31534407%29.jpg/250px-Joe_Bonamassa_-_2013_World_Tour_-_Meistersingerhalle_Nuernberg_-_11-03-2013_%28-31534407%29.jpg",
  },
  {
    name: "Carlos Santana",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Santana_Acer_Arena_%285558151833%29_%28cropped%29.jpg/250px-Santana_Acer_Arena_%285558151833%29_%28cropped%29.jpg",
  },
  {
    name: "Tony Iommi",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Tony-Iommi_2009-06-11_Chicago_photoby_Adam-Bielawski.jpg/250px-Tony-Iommi_2009-06-11_Chicago_photoby_Adam-Bielawski.jpg",
  },
  {
    name: "Tom Morello",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Tom_Morello.jpg/250px-Tom_Morello.jpg",
  },
  {
    name: "Kirk Hammett",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Kirk_Hammett_2025_Marvel_Stadium_%284%29.jpg/250px-Kirk_Hammett_2025_Marvel_Stadium_%284%29.jpg",
  },
  {
    name: "Joe Satriani",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Satriani_2010_13_12_1112.jpg/250px-Satriani_2010_13_12_1112.jpg",
  },
  {
    name: "Steve Vai",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Steve_Vai%2C_3-Maj%C3%B3wka_2023_08.jpg/250px-Steve_Vai%2C_3-Maj%C3%B3wka_2023_08.jpg",
  },
  {
    name: "Yngwie Malmsteen",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Yngwie_Malmsteen_1.jpg/250px-Yngwie_Malmsteen_1.jpg",
  },
  {
    name: "Jeff Beck",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Jeff_Beck_in_Amsterdam_1979_%28cropped%29.jpg/250px-Jeff_Beck_in_Amsterdam_1979_%28cropped%29.jpg",
  },
  {
    name: "Dimebag Darrell",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Dimebag_Darrell_with_Pantera.jpg/250px-Dimebag_Darrell_with_Pantera.jpg",
  },
  {
    name: "John Petrucci",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/DreamTheater_TonsOfRock-2025_00002.jpg/250px-DreamTheater_TonsOfRock-2025_00002.jpg",
  },
  {
    name: "Synyster Gates",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Synyster_Gates_in_2018.jpg/250px-Synyster_Gates_in_2018.jpg",
  },
  {
    name: "Tosin Abasi",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Animals_As_Leaders_%40_Euroblast_2016_63.jpg/250px-Animals_As_Leaders_%40_Euroblast_2016_63.jpg",
  },
  {
    name: "Plini",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Plini248_300x_RG_%28cropped%29.jpg/250px-Plini248_300x_RG_%28cropped%29.jpg",
  },
];

const VALUE_PROPS = [
  {
    title: "Adapted to your exact gear",
    body: "We don't give you generic settings. We translate iconic tones to the specific guitar, amp, and pedals you actually own.",
  },
  {
    title: "Built around the original recording",
    body: "Every adaptation starts from research on the original studio tone — gear, signal chain, and EQ — then maps it onto your rig.",
  },
  {
    title: "Save and recall in seconds",
    body: "Build a library of your favorite adapted tones. Open one and you've got the dial-in instantly.",
  },
];

export default function OnboardingStep() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const { completeOnboarding, setOnboardingStep } = useApp();
  const idx = Math.min(TOTAL - 1, Math.max(0, parseInt(step ?? "1", 10) - 1));

  useEffect(() => {
    setOnboardingStep(idx + 1);
  }, [idx, setOnboardingStep]);

  const next = () => {
    if (idx < TOTAL - 1) router.push(`/onboarding/${idx + 2}` as never);
    else {
      completeOnboarding();
      // Hard paywall: subscription is required to use the app after onboarding.
      // gate=1 disables dismiss / back-gesture / hardware back on the paywall.
      router.replace("/paywall?gate=1");
    }
  };

  const back = () => router.back();

  // Reveal step is "loading then result" — hide back while loading
  const hideChrome = idx === 8;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      <View className="flex-1 px-6 pb-6 pt-2">
        <View
          className="flex-row items-center justify-between"
          style={{ minHeight: 28 }}
        >
          {idx > 0 && !hideChrome ? (
            <Pressable onPress={back} hitSlop={12} className="p-1">
              <ChevronLeft size={26} color={colors.ink} />
            </Pressable>
          ) : (
            <View className="h-7 w-7" />
          )}
          <View className="h-7 w-7" />
        </View>

        {idx === 0 ? <SkillStep onContinue={next} active={idx} /> : null}
        {idx === 1 ? <InstrumentStep onContinue={next} active={idx} /> : null}
        {idx === 2 ? <GuitarStep onContinue={next} active={idx} /> : null}
        {idx === 3 ? <AmpStep onContinue={next} active={idx} /> : null}
        {idx === 4 ? <PedalsStep onContinue={next} active={idx} /> : null}
        {idx === 5 ? <GenresStep onContinue={next} active={idx} /> : null}
        {idx === 6 ? <HeroesStep onContinue={next} active={idx} /> : null}
        {idx === 7 ? <SocialProofStep onContinue={next} active={idx} /> : null}
        {idx === 8 ? <RevealStep onContinue={next} active={idx} /> : null}
        {idx === 9 ? (
          <NotificationsStep onContinue={next} active={idx} />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared footer — progress dots + primary CTA
// ─────────────────────────────────────────────────────────────────────────────

function StepFooter({
  active,
  label,
  disabled,
  onPress,
  secondary,
}: {
  active: number;
  label: string;
  disabled?: boolean;
  onPress: () => void;
  secondary?: { label: string; onPress: () => void };
}) {
  return (
    <View>
      <View className="mb-5 mt-2 flex-row items-center justify-center gap-2">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <View
            key={i}
            className={`h-1.5 rounded-full ${i === active ? "bg-ink w-6" : "bg-hairline w-1.5"}`}
          />
        ))}
      </View>
      <Button label={label} onPress={onPress} disabled={disabled} fullWidth />
      {secondary ? (
        <Pressable
          onPress={secondary.onPress}
          className="mt-3 items-center py-2"
        >
          <Text className="text-ink-muted text-sm">{secondary.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// Reusable grid card for picker steps
function GridCard({
  label,
  selected,
  onPress,
  emoji,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  emoji?: string;
}) {
  return (
    <Pressable onPress={onPress} style={{ width: "48.5%" }}>
      <View
        className={`items-center justify-center rounded-2xl border-2 px-3 py-4 ${
          selected ? "bg-white border-ink" : "bg-surface border-transparent"
        }`}
        style={{ minHeight: 70 }}
      >
        {emoji ? <Text className="mb-1 text-2xl">{emoji}</Text> : null}
        <Text
          className="text-ink text-center text-[14px] font-bold"
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function SecondaryOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View
        className={`items-center rounded-2xl border-2 py-3.5 ${
          selected ? "border-ink bg-white" : "border-hairline bg-transparent"
        }`}
      >
        <Text className="text-ink text-sm font-semibold">{label}</Text>
      </View>
    </Pressable>
  );
}

// Always-on free-text field for capturing exact model spec. When non-empty,
// it overrides the picker selection so the AI gets the most precise data.
function ExactModelField({
  label,
  placeholder,
  value,
  onChangeText,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View className="mt-5">
      <Text className="text-ink-muted mb-2 text-[11px] font-bold uppercase tracking-widest">
        {label}
      </Text>
      <TextField
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="words"
      />
      <Text className="text-ink-muted mt-1.5 text-[11px]">
        Helps the AI nail the exact pickups, year, and circuit.
      </Text>
    </View>
  );
}

// Hero avatar — uses photo if available, otherwise renders initials. Falls
// back to initials on image load error.
function HeroAvatar({ name, photo }: { name: string; photo?: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!photo || failed) {
    return (
      <View
        style={{ width: 56, height: 56, borderRadius: 28 }}
        className="bg-surface-elevated items-center justify-center"
      >
        <Text className="text-ink text-base font-extrabold">{initials}</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: photo }}
      onError={() => setFailed(true)}
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#EEEEF0",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Skill level
// ─────────────────────────────────────────────────────────────────────────────

function SkillStep({
  onContinue,
  active,
}: {
  onContinue: () => void;
  active: number;
}) {
  const { prefs, setSkillLevel } = useApp();
  const ready = prefs.skillLevel != null;

  return (
    <>
      <View className="mt-6">
        <Text className="text-ink text-[28px] font-extrabold tracking-tight">
          What's your level?
        </Text>
        <Text className="text-ink-secondary mt-2 text-base leading-snug">
          So we can match tones to where you are today.
        </Text>
      </View>

      <ScrollView className="mt-7 flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-3">
          {SKILL_OPTIONS.map((opt) => {
            const selected = prefs.skillLevel === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setSkillLevel(opt.value)}
              >
                <View
                  className={`flex-row items-center rounded-2xl border-2 px-5 py-4 ${
                    selected
                      ? "bg-white border-ink"
                      : "bg-surface border-transparent"
                  }`}
                >
                  <Text className="mr-3 text-2xl">{opt.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-ink text-base font-bold">
                      {opt.label}
                    </Text>
                    <Text className="text-ink-muted mt-0.5 text-xs">
                      {opt.sub}
                    </Text>
                  </View>
                  {selected ? (
                    <View className="bg-ink h-6 w-6 items-center justify-center rounded-full">
                      <Check size={14} color="#fff" strokeWidth={3} />
                    </View>
                  ) : (
                    <View className="border-hairline h-6 w-6 rounded-full border" />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <StepFooter
        active={active}
        label="Continue"
        disabled={!ready}
        onPress={onContinue}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Gear (electric/bass + model + pedals/multi-FX)
// ─────────────────────────────────────────────────────────────────────────────

const ELECTRIC_PRESETS = [
  "Squier Strat",
  "Fender Player Strat",
  "Fender Pro II Strat",
  "Fender Vintera Strat",
  "Squier Tele",
  "Fender Player Tele",
  "Fender Pro II Tele",
  "Epi Les Paul Standard",
  "Gibson LP Studio",
  "Gibson LP Standard 50s",
  "Gibson LP Standard 60s",
  "Gibson LP Custom",
  "Gibson SG Standard",
  "Gibson ES-335",
  "Gibson Flying V",
  "Fender Jazzmaster",
  "Fender Jaguar",
  "PRS SE Custom 24",
  "PRS Custom 24",
  "Ibanez RG Prestige",
  "Ibanez AZ",
  "Yamaha Pacifica 112",
  "Schecter C-1",
  "ESP LTD EC-1000",
];
const BASS_PRESETS = [
  "Squier P-Bass",
  "Fender Player P-Bass",
  "Fender Pro II P-Bass",
  "Squier Jazz Bass",
  "Fender Player Jazz Bass",
  "Fender Pro II Jazz Bass",
  "Music Man StingRay",
  "Music Man StingRay Special",
  "Gibson Thunderbird",
  "Epi Thunderbird",
  "Rickenbacker 4003",
  "Ibanez SR300",
  "Ibanez SR500",
  "Höfner Violin Bass",
  "Warwick Corvette",
  "Spector NS",
];
const GUITAR_AMP_PRESETS = [
  "Fender Champion 20",
  "Fender Champion 40",
  "Fender Blues Junior",
  "Fender Hot Rod Deluxe",
  "Fender Deluxe Reverb '65",
  "Fender Twin Reverb '65",
  "Marshall MG30",
  "Marshall DSL40",
  "Marshall JCM800 2203",
  "Marshall Plexi 1959",
  "Marshall Origin",
  "Vox AC15",
  "Vox AC30",
  "Mesa Mark V",
  "Mesa Dual Rectifier",
  "Orange Rockerverb 50",
  "Orange Rocker 32",
  "Peavey 6505",
  "EVH 5150 III 50W",
  "EVH 5150 III 100W",
  "Friedman BE-100",
  "Boss Katana 50",
  "Boss Katana 100",
  "Roland JC-120",
];
const BASS_AMP_PRESETS = [
  "Ampeg SVT Classic",
  "Ampeg SVT-4 PRO",
  "Ampeg PF-500",
  "Fender Rumble 100",
  "Fender Rumble 500",
  "Markbass Little Mark III",
  "Markbass Little Mark 800",
  "Hartke HD500",
  "Hartke HyDrive 410",
  "Trace Elliot ELF",
  "Aguilar Tone Hammer 500",
  "Gallien-Krueger MB500",
  "Mesa Subway D-800",
  "Orange Bass Terror 500",
  "Darkglass Microtubes 500",
  "TC Electronic BH800",
];
const PEDAL_PRESETS = [
  "Line 6 Helix Floor",
  "Line 6 Helix LT",
  "Line 6 HX Stomp",
  "Line 6 HX Effects",
  "Line 6 Pod Go",
  "Fractal Axe-FX III",
  "Fractal FM3",
  "Fractal FM9",
  "Quad Cortex",
  "Kemper Profiler",
  "Kemper Stage",
  "Boss GT-1000",
  "Boss GT-1000 Core",
  "Boss Katana MkII",
  "Headrush Prime",
  "Mooer GE300",
  "Hotone Ampero II",
  "Strymon Iridium",
  "UA Dream '65",
  "Walrus ARP-87",
  "Tube Screamer (TS9)",
  "ProCo RAT",
  "JHS Morning Glory",
  "Strymon BigSky",
];
const NONE = "__NONE__";

// Step 2 — Instrument type
function InstrumentStep({
  onContinue,
  active,
}: {
  onContinue: () => void;
  active: number;
}) {
  const { prefs, setInstrumentType } = useApp();
  const ready = prefs.instrumentType != null;

  const OPTIONS: {
    value: "guitar" | "bass";
    label: string;
    sub: string;
    emoji: string;
  }[] = [
    {
      value: "guitar",
      label: "Electric guitar",
      sub: "6-string electric",
      emoji: "🎸",
    },
    { value: "bass", label: "Bass", sub: "4 / 5-string bass", emoji: "🎵" },
  ];

  return (
    <>
      <View className="mt-6">
        <Text className="text-ink text-[28px] font-extrabold tracking-tight">
          What do you play?
        </Text>
        <Text className="text-ink-secondary mt-2 text-base leading-snug">
          So we tune every tone to the right instrument.
        </Text>
      </View>

      <ScrollView className="mt-7 flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-3">
          {OPTIONS.map((opt) => {
            const selected = prefs.instrumentType === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setInstrumentType(opt.value)}
              >
                <View
                  className={`flex-row items-center rounded-2xl border-2 px-5 py-4 ${
                    selected
                      ? "bg-white border-ink"
                      : "bg-surface border-transparent"
                  }`}
                >
                  <Text className="mr-3 text-2xl">{opt.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-ink text-base font-bold">
                      {opt.label}
                    </Text>
                    <Text className="text-ink-muted mt-0.5 text-xs">
                      {opt.sub}
                    </Text>
                  </View>
                  {selected ? (
                    <View className="bg-ink h-6 w-6 items-center justify-center rounded-full">
                      <Check size={14} color="#fff" strokeWidth={3} />
                    </View>
                  ) : (
                    <View className="border-hairline h-6 w-6 rounded-full border" />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <StepFooter
        active={active}
        label="Continue"
        disabled={!ready}
        onPress={onContinue}
      />
    </>
  );
}

// Step 3 — Guitar / bass model
function GuitarStep({
  onContinue,
  active,
}: {
  onContinue: () => void;
  active: number;
}) {
  const { prefs, addGear } = useApp();
  const kind = prefs.instrumentType ?? "guitar";
  const presets = kind === "bass" ? BASS_PRESETS : ELECTRIC_PRESETS;
  const [pick, setPick] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  const ready = custom.trim().length > 0 || pick != null;

  const submit = () => {
    if (!ready) return;
    const model = custom.trim() || pick!;
    addGear({ type: kind, brand: "", model });
    onContinue();
  };

  return (
    <>
      <View className="mt-6">
        <Text className="text-ink text-[28px] font-extrabold tracking-tight">
          Which {kind === "bass" ? "bass" : "guitar"}?
        </Text>
        <Text className="text-ink-secondary mt-2 text-base leading-snug">
          Pick yours so tones get adapted to your pickups and feel.
        </Text>
      </View>

      <ScrollView
        className="mt-6 flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row flex-wrap" style={{ gap: 8, rowGap: 8 }}>
          {presets.map((g) => (
            <GridCard
              key={g}
              label={g}
              selected={pick === g}
              onPress={() => setPick(g)}
            />
          ))}
        </View>
      </ScrollView>

      <ExactModelField
        label={`Can't find it? Enter your exact ${kind === "bass" ? "bass" : "guitar"}`}
        placeholder={
          kind === "bass"
            ? "e.g. Sire Marcus Miller V7 Vintage 4-string"
            : "e.g. Fender Custom Shop '59 Stratocaster Relic"
        }
        value={custom}
        onChangeText={setCustom}
      />

      <StepFooter
        active={active}
        label="Continue"
        disabled={!ready}
        onPress={submit}
      />
    </>
  );
}

// Step 4 — Amp
function AmpStep({
  onContinue,
  active,
}: {
  onContinue: () => void;
  active: number;
}) {
  const { prefs, addGear } = useApp();
  const kind = prefs.instrumentType ?? "guitar";
  const presets = kind === "bass" ? BASS_AMP_PRESETS : GUITAR_AMP_PRESETS;
  const ampType = kind === "bass" ? "bassamp" : "amp";
  const [pick, setPick] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  const ready = custom.trim().length > 0 || pick != null;

  const submit = () => {
    if (!ready) return;
    if (custom.trim()) {
      addGear({ type: ampType, brand: "", model: custom.trim() });
    } else if (pick && pick !== NONE) {
      addGear({ type: ampType, brand: "", model: pick });
    }
    onContinue();
  };

  return (
    <>
      <View className="mt-6">
        <Text className="text-ink text-[28px] font-extrabold tracking-tight">
          What's your amp?
        </Text>
        <Text className="text-ink-secondary mt-2 text-base leading-snug">
          Real or modeled — we'll dial knobs to match.
        </Text>
      </View>

      <ScrollView
        className="mt-6 flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row flex-wrap" style={{ gap: 8, rowGap: 8 }}>
          {presets.map((a) => (
            <GridCard
              key={a}
              label={a}
              selected={pick === a}
              onPress={() => setPick(a)}
            />
          ))}
        </View>
        <View className="mt-3">
          <SecondaryOption
            label="No amp — direct in"
            selected={pick === NONE}
            onPress={() => setPick(NONE)}
          />
        </View>
      </ScrollView>

      <ExactModelField
        label="Can't find it? Enter your exact amp"
        placeholder={
          kind === "bass"
            ? "e.g. Darkglass Microtubes 900 v2"
            : "e.g. Friedman BE-100 Deluxe '17"
        }
        value={custom}
        onChangeText={setCustom}
      />

      <StepFooter
        active={active}
        label="Continue"
        disabled={!ready}
        onPress={submit}
      />
    </>
  );
}

// Step 5 — Pedals or multi-FX
function PedalsStep({
  onContinue,
  active,
}: {
  onContinue: () => void;
  active: number;
}) {
  const { addGear } = useApp();
  const [pick, setPick] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  const ready = custom.trim().length > 0 || pick != null;

  const submit = () => {
    if (!ready) return;
    if (custom.trim()) {
      addGear({ type: "multifx", brand: "", model: custom.trim() });
    } else if (pick && pick !== NONE) {
      addGear({ type: "multifx", brand: "", model: pick });
    }
    onContinue();
  };

  return (
    <>
      <View className="mt-6">
        <Text className="text-ink text-[28px] font-extrabold tracking-tight">
          Pedals or multi-FX?
        </Text>
        <Text className="text-ink-secondary mt-2 text-base leading-snug">
          We'll translate every tone to the gear you actually own.
        </Text>
      </View>

      <ScrollView
        className="mt-6 flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row flex-wrap" style={{ gap: 8, rowGap: 8 }}>
          {PEDAL_PRESETS.map((p) => (
            <GridCard
              key={p}
              label={p}
              selected={pick === p}
              onPress={() => setPick(p)}
            />
          ))}
        </View>
        <View className="mt-3">
          <SecondaryOption
            label="None — just amp"
            selected={pick === NONE}
            onPress={() => setPick(NONE)}
          />
        </View>
      </ScrollView>

      <ExactModelField
        label="Can't find it? List your pedalboard"
        placeholder="e.g. TS9 → Klon KTR → Strymon Timeline → BigSky"
        value={custom}
        onChangeText={setCustom}
      />

      <StepFooter
        active={active}
        label="Continue"
        disabled={!ready}
        onPress={submit}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Genres
// ─────────────────────────────────────────────────────────────────────────────

function GenresStep({
  onContinue,
  active,
}: {
  onContinue: () => void;
  active: number;
}) {
  const { prefs, setGenres } = useApp();
  const ready = prefs.genres.length > 0;

  const toggle = (g: Genre) => {
    const set = new Set(prefs.genres);
    set.has(g) ? set.delete(g) : set.add(g);
    setGenres(Array.from(set));
  };

  return (
    <>
      <View className="mt-6">
        <Text className="text-ink text-[28px] font-extrabold tracking-tight">
          What do you play? 🎵
        </Text>
        <Text className="text-ink-secondary mt-2 text-base leading-snug">
          Pick all that apply. We'll surface tones for your styles first.
        </Text>
      </View>

      <ScrollView className="mt-6 flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap" style={{ gap: 8, rowGap: 8 }}>
          {GENRE_OPTIONS.map((g) => {
            const selected = prefs.genres.includes(g);
            return (
              <GridCard
                key={g}
                label={g}
                emoji={GENRE_EMOJI[g]}
                selected={selected}
                onPress={() => toggle(g)}
              />
            );
          })}
        </View>
      </ScrollView>

      <StepFooter
        active={active}
        label={ready ? `Continue (${prefs.genres.length})` : "Continue"}
        disabled={!ready}
        onPress={onContinue}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Tone heroes
// ─────────────────────────────────────────────────────────────────────────────

function HeroesStep({
  onContinue,
  active,
}: {
  onContinue: () => void;
  active: number;
}) {
  const { prefs, setToneHeroes } = useApp();
  const ready = prefs.toneHeroes.length >= 1;

  const toggle = (h: string) => {
    const set = new Set(prefs.toneHeroes);
    if (set.has(h)) set.delete(h);
    else if (set.size < 5) set.add(h);
    setToneHeroes(Array.from(set));
  };

  return (
    <>
      <View className="mt-6">
        <Text className="text-ink text-[28px] font-extrabold tracking-tight">
          Whose tone do you chase?
        </Text>
        <Text className="text-ink-secondary mt-2 text-base leading-snug">
          Pick up to 5. We'll prioritise their tones for your gear.
        </Text>
      </View>

      <ScrollView className="mt-6 flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap" style={{ gap: 10 }}>
          {HERO_OPTIONS.map((h) => {
            const selected = prefs.toneHeroes.includes(h.name);
            return (
              <Pressable
                key={h.name}
                onPress={() => toggle(h.name)}
                style={{ width: "31%" }}
              >
                <View
                  className={`items-center rounded-2xl border-2 px-2 py-3 ${
                    selected
                      ? "bg-white border-ink"
                      : "bg-surface border-transparent"
                  }`}
                >
                  <HeroAvatar name={h.name} photo={h.photo} />
                  <Text
                    className="text-ink mt-2 text-center text-[11px] font-semibold"
                    numberOfLines={2}
                  >
                    {h.name}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <StepFooter
        active={active}
        label={
          ready ? `Continue (${prefs.toneHeroes.length})` : "Pick at least one"
        }
        disabled={!ready}
        onPress={onContinue}
        secondary={{ label: "Skip", onPress: onContinue }}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 — Social proof
// ─────────────────────────────────────────────────────────────────────────────

function SocialProofStep({
  onContinue,
  active,
}: {
  onContinue: () => void;
  active: number;
}) {
  return (
    <>
      <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
        <Text className="text-ink mt-2 text-center text-[28px] font-extrabold leading-snug tracking-tight">
          The fastest way to dial{"\n"}any tone you've ever wanted.
        </Text>
        <Text className="text-ink-muted mt-3 text-center text-sm leading-snug">
          Why ToneKid is different.
        </Text>

        <View className="mt-8 gap-3">
          {VALUE_PROPS.map((v) => (
            <View key={v.title} className="bg-surface rounded-2xl px-5 py-4">
              <Text className="text-ink text-[15px] font-extrabold tracking-tight">
                {v.title}
              </Text>
              <Text className="text-ink-secondary mt-1.5 text-[13px] leading-snug">
                {v.body}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <StepFooter active={active} label="Continue" onPress={onContinue} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 5 — Personalised reveal (loading → number)
// ─────────────────────────────────────────────────────────────────────────────

const LOADING_LINES = [
  "📖 Reading your style...",
  "🔍 Mapping your tone heroes...",
  "⚡ Matching to your gear...",
  "🎛️ Building your library...",
];

function RevealStep({
  onContinue,
  active,
}: {
  onContinue: () => void;
  active: number;
}) {
  const { prefs } = useApp();
  const [phase, setPhase] = useState<"loading" | "reveal">("loading");
  const [line, setLine] = useState(0);
  const [count, setCount] = useState(0);

  // Compute personal tone count based on selections (deterministic, feels earned)
  const target = useMemo(() => {
    const base = 80;
    const fromGenres = prefs.genres.length * 32;
    const fromHeroes = prefs.toneHeroes.length * 24;
    const skillBoost =
      prefs.skillLevel === "pro"
        ? 60
        : prefs.skillLevel === "gigging"
          ? 40
          : 20;
    return Math.min(947, base + fromGenres + fromHeroes + skillBoost);
  }, [prefs]);

  useEffect(() => {
    if (phase !== "loading") return;
    const cycle = setInterval(
      () => setLine((n) => (n + 1) % LOADING_LINES.length),
      700,
    );
    const done = setTimeout(() => setPhase("reveal"), 2400);
    return () => {
      clearInterval(cycle);
      clearTimeout(done);
    };
  }, [phase]);

  // Count-up animation on reveal
  useEffect(() => {
    if (phase !== "reveal") return;
    const start = Date.now();
    const dur = 900;
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * target));
      if (t >= 1) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [phase, target]);

  if (phase === "loading") {
    return (
      <>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.ink} />
          <Text className="text-ink mt-6 text-[20px] font-extrabold tracking-tight">
            Building your tone library
          </Text>
          <Text className="text-ink-muted mt-3 h-5 text-sm">
            {LOADING_LINES[line]}
          </Text>
        </View>
        <StepFooter
          active={active}
          label="Continue"
          disabled
          onPress={onContinue}
        />
      </>
    );
  }

  return (
    <>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mt-6 items-center">
          <View className="bg-success-bg rounded-full px-3 py-1">
            <View className="flex-row items-center">
              <Sparkles size={12} color={colors.successInk} />
              <Text className="text-success-ink ml-1 text-xs font-bold">
                Personalised for you
              </Text>
            </View>
          </View>

          <Text className="text-ink mt-6 text-[88px] font-extrabold leading-none tracking-tighter">
            {count}
          </Text>
          <Text className="text-ink-secondary mt-1 text-base">
            🎯 tones matched to your style
          </Text>
        </View>

        <View className="mt-8 gap-3">
          <SummaryRow label="Skill" value={skillLabel(prefs.skillLevel)} />
          <SummaryRow
            label="Styles"
            value={prefs.genres.length ? prefs.genres.join(" · ") : "Any"}
          />
          <SummaryRow
            label="Tone heroes"
            value={
              prefs.toneHeroes.length
                ? prefs.toneHeroes.join(", ")
                : "Discovering"
            }
          />
        </View>

        <View className="bg-surface mt-6 rounded-2xl px-5 py-4">
          <Text className="text-ink text-[15px] leading-snug">
            We'll keep adapting your library as you save tones and add gear.
          </Text>
        </View>
      </ScrollView>

      <StepFooter active={active} label="Continue" onPress={onContinue} />
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="bg-surface flex-row items-start rounded-2xl px-4 py-3">
      <Text className="text-ink-muted w-24 text-[11px] font-bold uppercase tracking-widest">
        {label}
      </Text>
      <Text className="text-ink flex-1 text-sm font-semibold" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function skillLabel(s: SkillLevel | null): string {
  if (!s) return "Any level";
  return SKILL_OPTIONS.find((o) => o.value === s)?.label ?? "Any level";
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 6 — Notifications opt-in
// ─────────────────────────────────────────────────────────────────────────────

function NotificationsStep({
  onContinue,
  active,
}: {
  onContinue: () => void;
  active: number;
}) {
  const { setNotificationsEnabled } = useApp();
  const [busy, setBusy] = useState(false);

  const enable = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const existing = await Notifications.getPermissionsAsync();
      let status = existing.status;
      if (status !== "granted") {
        const result = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        status = result.status;
      }
      await setNotificationsEnabled(status === "granted");
    } catch {
      await setNotificationsEnabled(false);
    } finally {
      setBusy(false);
      onContinue();
    }
  };

  const skip = async () => {
    await setNotificationsEnabled(false);
    onContinue();
  };

  return (
    <>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mt-4 items-center">
          <View className="bg-surface h-24 w-24 items-center justify-center rounded-3xl">
            <Bell size={44} color={colors.ink} strokeWidth={2} />
          </View>
        </View>

        <Text className="text-ink mt-7 text-center text-[28px] font-extrabold leading-tight tracking-tight">
          Don't miss the tones{"\n"}built for you. 🔔
        </Text>
        <Text className="text-ink-secondary mt-3 text-center text-base leading-snug">
          We'll only ping you when a tone drops that fits your gear and style.
          Two notifications per week, max.
        </Text>

        <View className="bg-surface mt-7 rounded-2xl px-5 py-4">
          <NotificationPreviewRow
            title="New solo tone for your Pacifica"
            sub="Hotel California · 90% match"
          />
          <View className="bg-hairline my-3 h-px" />
          <NotificationPreviewRow
            title="3 new clean tones for blues"
            sub="Tap to explore"
          />
        </View>
      </ScrollView>

      <StepFooter
        active={active}
        label={busy ? "Requesting…" : "Enable Notifications"}
        disabled={busy}
        onPress={enable}
        secondary={{ label: "Maybe later", onPress: skip }}
      />
    </>
  );
}

function NotificationPreviewRow({
  title,
  sub,
}: {
  title: string;
  sub: string;
}) {
  return (
    <View className="flex-row items-center">
      <View className="bg-ink h-9 w-9 items-center justify-center rounded-xl">
        <Bell size={16} color="#fff" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-ink text-sm font-bold" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-ink-muted text-xs" numberOfLines={1}>
          {sub}
        </Text>
      </View>
      <Text className="text-ink-muted text-[10px]">now</Text>
    </View>
  );
}
