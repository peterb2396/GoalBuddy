import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const AnimatedCheckbox = ({ checked, onPress, color = theme.colors.primary, size = 28 }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (checked) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 10 })
      );
      rotation.value = withSequence(
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    } else {
      scale.value = withSpring(1);
      rotation.value = withTiming(0);
    }
  }, [checked]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={[styles.container, { width: size, height: size }, animatedStyle]}>
        {checked ? (
          <Animated.View
            style={[
              styles.checkedBox,
              { backgroundColor: color, borderColor: color }
            ]}
          >
            <Ionicons name="checkmark" size={size * 0.7} color="#FFFFFF" />
          </Animated.View>
        ) : (
          <Animated.View style={[styles.uncheckedBox, { borderColor: theme.colors.border }]} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uncheckedBox: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    backgroundColor: theme.colors.cardBackground,
  },
});

export default AnimatedCheckbox;
