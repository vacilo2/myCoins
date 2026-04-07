import { useRef } from 'react';
import { PanResponder, Animated } from 'react-native';
import { router } from 'expo-router';

type SwipeableTab = 'index' | 'transactions' | 'reports';

const TAB_ORDER: SwipeableTab[] = ['index', 'transactions', 'reports'];

// Rota correta para cada tab (index.tsx → /(tabs), não /(tabs)/index)
const TAB_ROUTES: Record<SwipeableTab, string> = {
  index: '/(tabs)',
  transactions: '/(tabs)/transactions',
  reports: '/(tabs)/reports',
};

const SWIPE_THRESHOLD = 70;

export function useSwipeNavigation(current: SwipeableTab) {
  const translateX = useRef(new Animated.Value(0)).current;
  const currentIndex = TAB_ORDER.indexOf(current);

  const canGoNext = currentIndex < TAB_ORDER.length - 1;
  const canGoPrev = currentIndex > 0;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > Math.abs(g.dy) * 1.5 && Math.abs(g.dx) > 12,

      onPanResponderMove: (_, g) => {
        if ((g.dx < 0 && canGoNext) || (g.dx > 0 && canGoPrev)) {
          translateX.setValue(g.dx * 0.1);
        }
      },

      onPanResponderRelease: (_, g) => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }).start();

        if (g.dx < -SWIPE_THRESHOLD && canGoNext) {
          router.navigate(TAB_ROUTES[TAB_ORDER[currentIndex + 1]] as any);
        } else if (g.dx > SWIPE_THRESHOLD && canGoPrev) {
          router.navigate(TAB_ROUTES[TAB_ORDER[currentIndex - 1]] as any);
        }
      },

      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }).start();
      },
    })
  ).current;

  const animatedStyle = {
    flex: 1,
    transform: [{ translateX }],
  };

  return { panHandlers: panResponder.panHandlers, animatedStyle };
}
