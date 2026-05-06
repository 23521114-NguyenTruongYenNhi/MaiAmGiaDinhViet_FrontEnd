import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { palette } from '@/constants/design';

type Props = {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  meta?: string;
  inverted?: boolean;
  trailing?: ReactNode;
};

export function ScreenHeader({ title, icon = 'sparkles-outline', meta, inverted, trailing }: Props) {
  return (
    <View className="pt-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className={`mr-3 h-11 w-11 items-center justify-center rounded-2xl ${inverted ? 'bg-white/12' : 'bg-[#F3EAE1]'}`}>
            <Ionicons name={icon} size={20} color={inverted ? '#FFFFFF' : palette.primary} />
          </View>
          <View>
            {meta ? <Text className={`font-beBold text-[10px] uppercase ${inverted ? 'text-white/60' : 'text-[#B7842D]'}`}>{meta}</Text> : null}
            <Text className={`font-beBold text-[28px] leading-[34px] ${inverted ? 'text-white' : 'text-[#261F1A]'}`}>{title}</Text>
          </View>
        </View>
        {trailing}
      </View>
    </View>
  );
}
