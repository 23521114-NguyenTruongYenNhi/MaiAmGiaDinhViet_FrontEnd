import React, { ReactNode, useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { radii, palette } from '@/constants/design';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Đã chỉnh lại độ cao: 0.58 nghĩa là sheet sẽ nằm thấp hơn (chỉ chiếm khoảng 42% màn hình phía dưới)
const SHEET_MAX_TOP = SCREEN_HEIGHT * 0.58;

// Cấu hình lò xo: damping cao (25) giúp sheet lướt êm, không bị nảy mạnh
const SPRING_CONFIG = {
    damping: 25,
    stiffness: 120,
    mass: 0.8,
};

interface SwipeableBottomSheetProps {
    children: ReactNode;
}

export default function SwipeableBottomSheet({ children }: SwipeableBottomSheetProps) {
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const contextY = useSharedValue(0);

    useEffect(() => {
        translateY.value = withSpring(SHEET_MAX_TOP, SPRING_CONFIG);
    }, []);

    const panGesture = Gesture.Pan()
        .onStart(() => {
            contextY.value = translateY.value;
        })
        .onUpdate((event) => {
            let newTranslateY = contextY.value + event.translationY;
            if (newTranslateY < SHEET_MAX_TOP) {
                newTranslateY = SHEET_MAX_TOP;
            }
            translateY.value = newTranslateY;
        })
        .onEnd((event) => {
            if (event.velocityY > 500 || translateY.value > SCREEN_HEIGHT * 0.75) {
                translateY.value = withSpring(SCREEN_HEIGHT, SPRING_CONFIG);
            } else {
                translateY.value = withSpring(SHEET_MAX_TOP, SPRING_CONFIG);
            }
        });

    const rSheetStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateY.value,
            [SHEET_MAX_TOP, SCREEN_HEIGHT],
            [1, 0.6],
            Extrapolation.CLAMP
        );

        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity,
        };
    });

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.bottomSheetContainer, rSheetStyle]}>
                <View style={styles.dragWrap}>
                    <View style={styles.dragLine} />
                </View>
                <View style={styles.content}>
                    {children}
                </View>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    bottomSheetContainer: {
        height: SCREEN_HEIGHT,
        width: '100%',
        backgroundColor: palette.cream,
        position: 'absolute',
        bottom: 0,
        borderTopLeftRadius: radii.card,
        borderTopRightRadius: radii.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    dragWrap: {
        alignItems: 'center',
        marginBottom: 8,
    },
    dragLine: {
        width: 40,
        height: 4,
        borderRadius: radii.pill,
        backgroundColor: '#A7A7AD',
    },
    content: {
        flex: 1,
    },
});