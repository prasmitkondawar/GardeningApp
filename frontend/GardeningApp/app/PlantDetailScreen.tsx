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
  
        {/* Additional plant details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Scientific Name:</Text>
          <Text style={styles.detailText}>{plant.ScientificName}</Text>
  
          <Text style={styles.detailLabel}>Plant Name:</Text>
          <Text style={styles.detailText}>{plant.PlantName}</Text>
  
          <Text style={styles.detailLabel}>Species:</Text>
          <Text style={styles.detailText}>{plant.Species}</Text>
        </View>
      </ScrollView>
      
      <ScrollView>
        
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
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: '#89cff0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  placeholder: { width: 40 },
  content: {
    flex: 1, 
    paddingRight: 10,
    paddingLeft: 10,
    marginTop: 10,
  },
  plantImage: { width: '100%', height: 250, resizeMode: 'cover' },
  detailsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  detailLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8
  },  
});

export default PlantDetailScreen;
