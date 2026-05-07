import { memo } from 'react';
import { Image, ImageSourcePropType, Text, View } from 'react-native';
import { CustomButton } from './custom-button';
import { palette, radii } from '@/constants/design';

type Props = {
  title: string;
  description: string;
  image: ImageSourcePropType;
  onPress?: () => void;
};

function DonationCardComponent({ title, description, image, onPress }: Props) {
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
      }}
    >
      <Image source={image} className="h-40 w-full" style={{ borderRadius: radii.card }} />
      <Text className="mt-3 font-beSemiBold text-lg text-[#2B2B2B]">{title}</Text>
      <Text className="mt-1 font-beRegular text-sm leading-6 text-[#786F68]">{description}</Text>
      <CustomButton label="View details" onPress={onPress} className="mt-3" />
    </View>
  );
}

export const DonationCard = memo(DonationCardComponent);
