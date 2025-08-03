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
          // You can implement onPress for image enlarge, etc.
        >
          <Image
            source={{ uri: item.Image }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
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
            onSubmitEditing={() => {
              Keyboard.dismiss();
            }}
            placeholder="Pet name"
            editable={savingId !== item.PlantID}
            returnKeyType="done"
          />
          {savingId === item.PlantID && (
            <ActivityIndicator size="small" color="#34C759" style={{ marginLeft: 6 }} />
          )}
        </View>
        <Text style={styles.label} numberOfLines={1}>{item.PlantName}</Text>
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
        horizontal
        contentContainerStyle={styles.listContainer}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    width: cardWidth/2,
    height: 180,
    marginRight: 16,
    padding: 14,
    backgroundColor: '#eef5f5',
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#90caf9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 7,
    elevation: 7,
    marginBottom: 10,
  },
  imageWrapper: {
    overflow: 'hidden',
    borderRadius: 12,
    marginBottom: 10,
  },
  image: {
    width: 100, // 14 padding on each side
    height: 100,
    borderRadius: 12,
    backgroundColor: '#cce8e6',
  },
  label: {
    fontWeight: '700',
    marginTop: 6,
    fontSize: 12,
    color: '#22384D',
    marginBottom: 6,
    textAlign: 'center',
    maxWidth: 120,
  },
  editableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  petNameInput: {
    borderWidth: 1,
    borderColor: '#cdd4d7',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 80,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 15,
    color: '#2b5166',
  },
  petNameInputActive: {
    borderColor: '#34C759',
    backgroundColor: '#eaffea',
  },
  petNameInputSaving: {
    borderColor: '#f4c43c',
    backgroundColor: '#fffceb',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlantDirectory;
