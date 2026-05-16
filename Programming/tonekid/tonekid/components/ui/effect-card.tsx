import { Text, View } from 'react-native';
import { Star } from 'lucide-react-native';

import { colors } from '@/constants/tokens';
import type { Effect } from '@/lib/types';

import { Card } from './card';
import { Pill, type PillVariant } from './pill';

interface EffectCardProps {
  effect: Effect;
}

const tagVariantMap: Record<Effect['tags'][number]['variant'], PillVariant> = {
  critical: 'warning',
  exact: 'success',
  similar: 'info',
};

export function EffectCard({ effect }: EffectCardProps) {
  return (
    <Card padding="md" className="flex-row">
      <View className="bg-surface mr-3 h-9 w-9 items-center justify-center rounded-full">
        <Text className="text-ink text-base font-bold">{effect.number}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-ink text-base font-bold">{effect.name}</Text>
        <Text className="text-ink-muted mt-0.5 text-xs">
          Replaces: <Text className="text-ink-secondary">{effect.replaces}</Text>
        </Text>
        <View className="mt-2 flex-row flex-wrap gap-1.5">
          {effect.tags.map((t) => (
            <Pill
              key={t.label}
              label={t.label}
              variant={tagVariantMap[t.variant]}
              size="sm"
              leftIcon={
                t.variant === 'critical' ? (
                  <Star size={11} color={colors.warning} fill={colors.warning} />
                ) : undefined
              }
            />
          ))}
        </View>
        <Text className="text-ink-secondary mt-2 text-sm leading-snug">{effect.description}</Text>
        {effect.params.length > 0 ? (
          <View className="mt-3 flex-row flex-wrap gap-1.5">
            {effect.params.map((p) => (
              <View key={p.label} className="bg-surface rounded-full px-3 py-1.5">
                <Text className="text-ink text-xs font-semibold">
                  <Text className="text-ink-secondary font-medium">{p.label}: </Text>
                  {p.value}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Card>
  );
}
