import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

type Props = {
  className?: string;
};

export function PulseSkeleton({ className = '' }: Props) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }} className={`overflow-hidden rounded-2xl bg-[#EDE5DB] ${className}`}>
      <View />
    </Animated.View>
  );
}
