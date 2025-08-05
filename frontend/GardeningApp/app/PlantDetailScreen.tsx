// app/PlantDetail.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

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
      <View style={styles.container}>
        <Text>No plant selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{plant.PlantPetName}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {plant.Image && <Image source={{ uri: plant.Image }} style={styles.plantImage} />}
        {/* Additional plant details can go here */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  placeholder: { width: 40 },
  content: { flex: 1 },
  plantImage: { width: '100%', height: 250, resizeMode: 'cover' },
});

export default PlantDetailScreen;
