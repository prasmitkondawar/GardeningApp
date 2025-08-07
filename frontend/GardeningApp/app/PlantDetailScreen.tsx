import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PlantCard {
  Image: string;
  PlantName: string;
  PlantPetName: string;
  ScientificName: string;
  Species: string;
  PlantID: number;
}

const PlantDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const plantParam = Array.isArray(params.plant) ? params.plant[0] : params.plant;
  const plant: PlantCard | null = plantParam ? JSON.parse(plantParam) : null;

  if (!plant) {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <Text style={styles.emptyText}>No plant selected</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={26} color="#0a74da" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {plant.PlantPetName}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {plant.Image && (
            <Image source={{ uri: plant.Image }} style={styles.plantImage} />
          )}

          {/* Details Card */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailLabel}>Scientific Name</Text>
            <Text style={styles.detailText}>{plant.ScientificName}</Text>

            <View style={styles.divider} />

            <Text style={styles.detailLabel}>Plant Name</Text>
            <Text style={styles.detailText}>{plant.PlantName}</Text>

            <View style={styles.divider} />

            <Text style={styles.detailLabel}>Species</Text>
            <Text style={styles.detailText}>{plant.Species}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f0fe', // very light blue background for gentle contrast
  },
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f0fe',
  },
  emptyText: {
    fontSize: 18,
    color: '#7b7c81',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d0d7de',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#f2f6fc',
  },
  headerTitle: {
    flex: 1,
    fontWeight: '700',
    fontSize: 20,
    color: '#0a74da',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    marginTop: 12,
  },
  plantImage: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    backgroundColor: '#cfd8f7',
    marginBottom: 24,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#1c3c88',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4c5870',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailText: {
    fontSize: 16,
    color: '#2e3a59',
    fontWeight: '500',
    marginTop: 6,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#e4e9f0',
    marginVertical: 20,
  },
});

export default PlantDetailScreen;
