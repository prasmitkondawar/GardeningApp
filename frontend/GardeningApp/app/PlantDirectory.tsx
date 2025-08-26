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
import supabase from '@/config/supabase';
import { Ionicons } from '@expo/vector-icons';

interface PlantCard {
  Image: string;
  PlantName: string;
  PlantPetName: string;
  ScientificName: string;
  Species: string;
  PlantID: number;
  PlantHealth: number;
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
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const response = await fetch('https://gardeningapp.onrender.com/fetch-plants', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
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
        PlantHealth: item.plant_health
      }));
      return mappedData;
    } catch (error) {
      console.error('Error fetching plants:', error);
      throw error;
    }
  }

  async function deletePlant(plant_id: number) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`https://gardeningapp.onrender.com/delete-plant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plant_id: plant_id }),
      });
      if (!res.ok) {
        throw new Error('Delete failed');
      }
      // Remove from local state
      setPlants((p) => p.filter(plant => plant.PlantID !== plant_id));
    } catch (err) {
      Alert.alert('Error', 'Failed to delete plant.');
    }
  }  

  // Backend update for pet name
  async function updatePetName(id: number, newPetName: string) {
    setSavingId(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`https://gardeningapp.onrender.com/update-plant-pet-name`, {
        method: "POST",
        headers: {
           "Content-Type": "application/json",
           "Authorization": `Bearer ${token}`
        },
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

  function getHealthColor(health: number) {
    if (health >= 80) {
      return '#34C759';
    }         
    if (health >= 50) {
      return '#FFD900'; 
    }      
    if (health >= 25) {
      return '#FF9500';  
    } 
    return '#FF3B30';                           
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
        
        <View style={{ alignItems: 'center', marginVertical: 4 }}>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              color: getHealthColor(item.PlantHealth),
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            Health: {item.PlantHealth}
          </Text>
        </View>


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
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Delete Plant',
              'Are you sure you want to delete this plant?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => deletePlant(item.PlantID),
                },
              ]
            );
          }}
        >
          <Ionicons name="trash" size={24} color="#ff3b30" />
        </TouchableOpacity>

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PLANTDEX</Text>
      </View>
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
    paddingTop: 18,
    paddingBottom: 10,
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
    marginBottom: 10,
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
    marginBottom: 5,
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
  editableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  petNameInput: {
    borderWidth: 0,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 4,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 35,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 70, // space for status bar
    paddingBottom: 16,
    backgroundColor: '#89cff0', // light blue, change as needed
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C4857',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    zIndex: 10,
  },
});

export default PlantDirectory;
