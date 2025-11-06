import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

const AnimatedProgressBar = ({ current, target, color = theme.colors.primary, height = 24 }) => {
  const progress = useSharedValue(0);
  const percentage = Math.min((current / target) * 100, 100);

  useEffect(() => {
    progress.value = withSpring(percentage, {
      damping: 15,
      stiffness: 80,
    });
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const getProgressColor = () => {
    if (percentage === 100) return theme.colors.success;
    if (percentage >= 70) return color;
    if (percentage >= 30) return theme.colors.warning;
    return theme.colors.error;
  };

  const progressColor = getProgressColor();

  return (
    <View style={styles.container}>
      <View style={[styles.progressTrack, { height }]}>
        <Animated.View style={[styles.progressBar, animatedStyle, { height }]}>
          <LinearGradient
            colors={[progressColor, progressColor + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
        </Animated.View>
      </View>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: progressColor }]}>
          {current} / {target}
        </Text>
        <Text style={[styles.percentage, { color: progressColor }]}>
          {percentage.toFixed(0)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressTrack: {
    width: '100%',
    backgroundColor: theme.colors.progressBackground,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  percentage: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
});

export default AnimatedProgressBar;
