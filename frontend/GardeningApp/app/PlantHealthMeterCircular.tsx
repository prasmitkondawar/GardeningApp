import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';

interface Props {
  health: number; // 1-100
}

const PlantHealthMeterCircular: React.FC<Props> = ({ health }) => {
  // Clamp health between 0 and 100
  const clampedHealth = Math.max(0, Math.min(health, 100));

  // Pick color based on health value
  const getHealthColor = (value: number) => {
    if (value >= 80) return '#34C759'; // green
    if (value >= 50) return '#FFD600'; // yellow
    if (value >= 25) return '#FF9500'; // orange
    return '#FF3B30';                  // red
  };

  return (
    <View style={styles.container}>
      <CircularProgress
        value={clampedHealth}
        radius={70}
        duration={1000}
        progressValueColor={getHealthColor(clampedHealth)}
        maxValue={100}
        activeStrokeColor={getHealthColor(clampedHealth)}
        inActiveStrokeColor="#d9d9d9"
        inActiveStrokeOpacity={0.3}
        activeStrokeWidth={15}
        inActiveStrokeWidth={15}
        progressValueStyle={styles.progressValue}
        title="Health"
        titleColor="#4c5870"
        titleStyle={styles.titleStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  titleStyle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
});

export default PlantHealthMeterCircular;
