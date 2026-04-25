import * as Haptics from 'expo-haptics';
import { Pressable, Text, ViewStyle } from 'react-native';
import { palette, radii } from '@/constants/design';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
};

export function CustomButton({ label, onPress, variant = 'primary', className = '' }: Props) {
  const variants: Record<typeof variant, string> = {
    primary: 'bg-primary',
    secondary: 'bg-mustard',
    outline: 'border border-primary bg-white',
  };

  const textColors: Record<typeof variant, string> = {
    primary: 'text-white',
    secondary: 'text-primary',
    outline: 'text-primary',
  };

  const shadowStyle: ViewStyle = {
    borderRadius: radii.input,
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: palette.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  };

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={({ pressed }) => [
        shadowStyle,
        { transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
      className={`h-12 items-center justify-center rounded-2xl px-4 ${variants[variant]} ${className}`}>
      <Text className={`font-beSemiBold text-base ${textColors[variant]}`}>{label}</Text>
    </Pressable>
  );
}
