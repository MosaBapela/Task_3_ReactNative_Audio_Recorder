import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { COLORS } from '../constants/colors';

interface WaveformVisualizerProps {
  isActive?: boolean;
  barCount?: number;
  height?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isActive = false,
  barCount = 50,
  height = 40,
}) => {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    const generateBars = () => {
      const newBars = Array.from({ length: barCount }, () => 20 + Math.random() * 60);
      setBars(newBars);
    };

    generateBars();
    if (isActive) {
      const interval = setInterval(generateBars, 100);
      return () => clearInterval(interval);
    }
  }, [isActive, barCount]);

  const barWidth = 100 / barCount;

  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height="100%">
        {bars.map((barHeight, index) => (
          <Rect
            key={index}
            x={`${index * barWidth}%`}
            y={`${50 - barHeight / 2}%`}
            width={`${barWidth * 0.6}%`}
            height={`${barHeight}%`}
            fill={isActive ? COLORS.tertiary : COLORS.light}
            rx={2}
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
});