import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Dimensions
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';

interface PlantCard {
  Image: string;
  PlantName: string;
  PlantPetName: string;
  ScientificName: string;
  Species: string;
  PlantID: number;
}

const screenWidth = Dimensions.get('window').width;
const horizontalPadding = 32; // for example, 16 padding on left + 16 on right

const cardWidth = screenWidth - horizontalPadding;

const PlantDirectory: React.FC = () => {
  const [plants, setPlants] = useState<PlantCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<number | null>(null); // id of plant being edited
  const [petNameDraft, setPetNameDraft] = useState<{ [id: number]: string }>({});
  const [savingId, setSavingId] = useState<number | null>(null); // id of currently saving plant

  const router = useRouter();

  useEffect(() => {
    const loadPlants = async () => {
      try {
        const data = await fetchPlants();
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
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      const data = json.plants;
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

  // Backend update for pet name
  async function updatePetName(id: number, newPetName: string) {
    setSavingId(id);
    console.log(id, newPetName);
    try {
      const res = await fetch(`http://192.168.68.114:8000/update-plant-pet-name`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plant_id: id, plant_pet_name: newPetName }),
      });
      if (!res.ok) {
        throw new Error('Failed to update pet name');
      }

      setPlants((plants) =>
        plants.map((plant) =>
          plant.PlantID === id ? { ...plant, PlantPetName: newPetName } : plant
        )
      );
    } catch (err) {
      Alert.alert("Update Error", "Could not update pet name.");
    }
    setSavingId(null);
  }

  const renderPlantCard = ({ item }: { item: PlantCard }) => {
    const isEditing = editingId === item.PlantID;
    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.imageWrapper}
          onPress={() => router.push({
            pathname: '/PlantDetailScreen', // Use the correct route, no dot-slash
            params: { plant: JSON.stringify(item) },
          })}
        >
          <Image
            source={{ uri: item.Image }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
  
        <Text style={styles.label}>{item.PlantName}</Text>
        <Text style={styles.scientificName}>{item.ScientificName}</Text>
  
        <View style={styles.editableRow}>
          <TextInput
            style={[
              styles.petNameInput,
              isEditing && styles.petNameInputActive,
              savingId === item.PlantID && styles.petNameInputSaving,
            ]}
            value={
              isEditing
                ? petNameDraft[item.PlantID] ?? item.PlantPetName
                : item.PlantPetName
            }
            onChangeText={(text) =>
              setPetNameDraft((draft) => ({ ...draft, [item.PlantID]: text }))
            }
            onFocus={() => {
              setEditingId(item.PlantID);
              setPetNameDraft((draft) => ({
                ...draft,
                [item.PlantID]: item.PlantPetName,
              }));
            }}
            onBlur={() => {
              setEditingId(null);
              if (
                petNameDraft[item.PlantID] !== undefined &&
                petNameDraft[item.PlantID] !== item.PlantPetName
              ) {
                updatePetName(item.PlantID, petNameDraft[item.PlantID].trim());
              }
            }}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder="Pet name"
            editable={savingId !== item.PlantID}
            returnKeyType="done"
            placeholderTextColor="#b0b6bc"
          />
          {savingId === item.PlantID && (
            <ActivityIndicator size="small" color="#34C759" style={{ marginLeft: 6 }} />
          )}
        </View>
  
        <Text style={styles.species}>{item.Species}</Text>
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
    <View style={{ flex: 1 }}>
      <FlatList
        data={plants}
        keyExtractor={(item) => item.PlantID.toString()}
        renderItem={renderPlantCard}
        horizontal={false} // Remove this line or set to false
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 18,
    paddingVertical: 28,
  },
  card: {
    width: cardWidth / 2,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginRight: 22,
    backgroundColor: '#fff',
    borderRadius: 22,
    alignItems: 'center',
    // Shadow for depth
    shadowColor: '#14967F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 7,
    marginBottom: 16,
    // Neomorphic border/shadow effect
    borderWidth: 1.3,
    borderColor: '#e8f5ee',
  },
  imageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    backgroundColor: '#d7ede8',
    elevation: 3,
    shadowColor: '#8ed1c6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.26,
    shadowRadius: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#A7EDD9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    backgroundColor: '#b8dfd4',
  },
  label: {
    fontWeight: '700',
    fontSize: 18,
    color: '#2C4857',
    marginTop: 5,
    marginBottom: -3,
    textAlign: 'center',
  },
  scientificName: {
    fontStyle: 'italic',
    fontSize: 12.5,
    color: '#469E7C',
    marginBottom: 6,
    textAlign: 'center',
  },
  editableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 3,
  },
  petNameInput: {
    borderWidth: 0,
    backgroundColor: '#F2FAF7',
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 7,
    minWidth: 96,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
    color: '#358261',
    elevation: 1,
    shadowColor: '#9DE3C1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  petNameInputActive: {
    backgroundColor: '#d5f6e6',
    borderColor: '#66d19e',
    borderWidth: 1,
  },
  petNameInputSaving: {
    backgroundColor: '#fff3d3',
    borderColor: '#f4c564',
    borderWidth: 1,
  },
  species: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
    color: '#946EEE',
    letterSpacing: 0.5,
    backgroundColor: '#ede8fc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    textAlign: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlantDirectory;
