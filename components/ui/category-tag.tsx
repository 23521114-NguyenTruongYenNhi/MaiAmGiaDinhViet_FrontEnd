import * as Haptics from 'expo-haptics';
import { Pressable, Text, ViewStyle } from 'react-native';
import { palette, radii } from '@/constants/design';

type Props = {
  label: string;
  highlighted?: boolean;
  onPress?: () => void;
};

export function CategoryTag({ label, highlighted, onPress }: Props) {
  const style: ViewStyle = {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: highlighted ? palette.mustard : palette.border,
  };

  return (
    <Pressable
      onPress={() => {
        void Haptics.selectionAsync();
        onPress?.();
      }}
      style={({ pressed }) => [style, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}
      className={`rounded-2xl px-3 py-1.5 ${highlighted ? 'bg-mustard' : 'bg-[#F2ECE4]'}`}>
      <Text className={`font-beMedium text-xs ${highlighted ? 'text-primary' : 'text-[#7F7269]'}`}>{label}</Text>
    </Pressable>
  );
}
