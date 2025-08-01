import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';

interface PlantCard {
  Image: string
  PlantName: string
  PlantPetName: string
  ScientificName: string
  Species: string
  PlantID: number
  
}
const PlantDirectory: React.FC = () => {
    const [plants, setPlants] = useState<PlantCard[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
      const loadPlants = async () => {
        try {
          const data = await fetchPlants();
          console.log(data);
          setPlants(data);
        } catch (error) {
          Alert.alert('Error', 'Failed to load plants.');
        } finally {
          setLoading(false);
        }
      };
    
      loadPlants();
    }, []);

    
    async function fetchPlants() {
      try {
        const response = await fetch('http://192.168.68.114:8000/fetch-plants', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        console.log('Fetched response:', json);
    
        // Extract the plants array from response
        const data = json.plants; // <-- Important: get the array inside "plants"
        
        // Optional: map backend keys to your interface keys if necessary
        const mappedData = data.map((item: any) => ({
          Image: item.image_url,
          PlantName: item.plant_name,
          PlantPetName: item.plant_pet_name,
          ScientificName: item.scientific_name,
          Species: item.species,
          PlantID: item.plant_id,
        }));
    
        return mappedData;
    
      } catch (error) {
        console.error('Error fetching plants:', error);
        throw error;
      }
    }
    

    const renderPlantCard = ({ item }: { item: PlantCard }) => {
      return (
        <View style={styles.card}>
          <Image
            source={{ uri: item.Image }}
            style={styles.image}
            resizeMode="cover"
          />
          <Text style={styles.petName}>{item.PlantPetName}</Text>
        </View>
      );
    };
  
    if (loading) {
      return <ActivityIndicator style={{ flex: 1 }} size="large" />;
    }

    if (plants.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text>No plants found.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={plants}
        keyExtractor={(item) => item.PlantID.toString()}
        renderItem={renderPlantCard}
        horizontal={true} // Optional: horizontal scroll for tiny cards
        contentContainerStyle={styles.listContainer}
      />
    );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10,
  },
  card: {
    width: 100,
    height: 140,
    marginHorizontal: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 6,
  },
  petName: {
    marginTop: 6,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});


export default PlantDirectory;