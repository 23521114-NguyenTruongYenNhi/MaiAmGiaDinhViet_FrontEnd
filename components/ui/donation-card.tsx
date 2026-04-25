import { memo } from 'react';
import { Image, Text, View } from 'react-native';
import { CustomButton } from './custom-button';
import { palette, radii } from '@/constants/design';

type Props = {
  title: string;
  description: string;
  image: string;
  progress: number;
  onPress?: () => void;
};

function DonationCardComponent({ title, description, image, progress, onPress }: Props) {
  return (
    <View
      className="mb-4 bg-white p-4"
      style={{
        borderRadius: radii.card,
        borderWidth: 1,
        borderColor: palette.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
      }}>
      <Image source={{ uri: image }} className="h-40 w-full" style={{ borderRadius: radii.card }} />
      <Text className="mt-3 font-beSemiBold text-lg text-[#2B2B2B]">{title}</Text>
      <Text className="mt-1 font-beRegular text-sm leading-6 text-[#786F68]">{description}</Text>
      <View className="mt-3 h-2 rounded-full bg-[#F2ECE4]">
        <View className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
      </View>
      <Text className="mt-2 font-beMedium text-xs text-primary">{progress}% funded</Text>
      <CustomButton label="View Progress" onPress={onPress} className="mt-3" />
    </View>
  );
}

export const DonationCard = memo(DonationCardComponent);
