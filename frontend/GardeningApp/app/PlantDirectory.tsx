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
import { useRouter, usePathname } from 'expo-router';
import supabase from '@/config/supabase';
import { Ionicons } from '@expo/vector-icons';

interface PlantCard {
  ImageURL: string;
  PlantName: string;
  PlantPetName: string;
  ScientificName: string;
  Species: string;
  PlantID: number;
  PlantHealth: number;
}

const screenWidth = Dimensions.get('window').width;
const horizontalPadding = 32; // total padding for container
const numColumns = 2;
const cardSpacing = 16; // margin around each card

const cardWidth = (screenWidth - horizontalPadding - cardSpacing) / numColumns;


const PlantDirectory: React.FC = () => {
  const [plants, setPlants] = useState<PlantCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<number | null>(null); // id of plant being edited
  const [petNameDraft, setPetNameDraft] = useState<{ [id: number]: string }>({});
  const [savingId, setSavingId] = useState<number | null>(null); // id of currently saving plant

  const router = useRouter();
  const pathName = usePathname();

  const getDynamicFontSize = (text: string) => {
    if (text.length <= 10) return 27;
    if (text.length <= 15) return 20;
    return 15;
  };

  const truncateText = (text: string) => {
    if (text.length > 15) {
      return text.substring(0, 15) + '...';
    }
    return text
  }
  

  useEffect(() => {
    const loadPlants = async () => {
      try {
        const data = await fetchPlants();
        if (data) {
          setPlants(data);
        } else {
          setPlants([]);  // Treat null as empty array
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load plants.');
        setPlants([]); // Fallback to empty array
      } finally {
        setLoading(false);
      }
    };
    loadPlants();
  }, []);

  async function fetchPlants() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL
      const token = session?.access_token;
      const response = await fetch(`${baseUrl}/plants`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      const data = Array.isArray(json.plants) ? json.plants : [];
      const mappedData = data.map((item: any) => ({
        ImageURL: item.image_url,
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

  async function deletePlant(plant_id: number, path_url: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL
      const token = session?.access_token;
      const res = await fetch(`${baseUrl}/plants/${plant_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (!res.ok) {
        const errorData = await res.json(); // parse JSON error response
        console.error("Delete failed:", errorData);
        throw new Error(errorData.error || 'Delete failed');
      }

      const { error: storageError } = await supabase.storage
      .from('plant-images')  // Replace with your bucket name
      .remove([path_url]);
 
 
      if (storageError) {
        console.error('Failed to delete photo:', storageError);
        // optional: notify user or handle it gracefully
      }
      
      // Remove from local state
      setPlants((p) => p.filter(plant => plant.PlantID !== plant_id));
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to delete plant.');
    }
  }  

  // Backend update for pet name
  async function updatePetName(id: number, newPetName: string) {
    setSavingId(id);
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`${baseUrl}/plants/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ plant_pet_name: newPetName }),
      });      
      console.log("RES", res);
      if (!res.ok) {
        throw new Error('Failed to update pet name');
      }

      const errorData = await res.json();
      console.log("ERROR DATA", errorData);
      if (errorData["message"] == "Plant pet name already exists") {
        Alert.alert("Name already taken", "Please choose another name")
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
    const dynamicFontSize = getDynamicFontSize(item.PlantPetName);

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.imageWrapper}
          onPress={() => router.push({
            pathname: '/PlantDetailScreen',
            params: { plant: JSON.stringify(item) }
          } as any)}
        >
          <Image
            source={{ uri: item.ImageURL }}
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
              { fontSize: dynamicFontSize }, // dynamic font size here
            ]}
            value={
              isEditing
                ? petNameDraft[item.PlantID] ?? item.PlantPetName
                : truncateText(item.PlantPetName) // truncate if not editing

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
                  onPress: () => deletePlant(item.PlantID, item.ImageURL),
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

  if (!plants || plants.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>🌱</Text>
            <Text style={styles.headerTitle}>PLANTDEX</Text>
          </View>
          <Text style={styles.headerSubtitle}>Your Digital Garden</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text>No plants found.</Text>
        </View>
        
        {/* Navigation Bar */}
        <View style={styles.navigationBar}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.navigate('/PlantDirectory')}
          >
            <Ionicons name="folder" size={24} color={pathName === "/PlantDirectory" ? "#007AFF" : "#888"} />
            <Text style={[styles.navLabel, pathName === "/PlantDirectory" && styles.activeNavLabel]}>Plants</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.navigate('/components/CameraScreen')}
          >
            <Ionicons name="camera" size={24} color={pathName === "/components/CameraScreen" ? "#007AFF" : "#888"} />
            <Text style={[styles.navLabel, pathName === "/components/CameraScreen" && styles.activeNavLabel]}>Camera</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.navigate('/components/CalendarView')}
          >
            <Ionicons name="calendar" size={24} color={pathName === "/components/CalendarView" ? "#007AFF" : "#888"} />
            <Text style={[styles.navLabel, pathName === "/components/CalendarView" && styles.activeNavLabel]}>Calendar</Text>
          </TouchableOpacity>
        </View>
      </View>

    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>🪴</Text>
          <Text style={styles.headerTitle}>PLANTDEX</Text>
        </View>
        <Text style={styles.headerSubtitle}>Your Digital Garden</Text>
      </View>
      <FlatList
        data={plants}
        keyExtractor={(item) => item.PlantID.toString()}
        renderItem={renderPlantCard}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row} // This ensures proper row alignment
      />
      
      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.navigate('/PlantDirectory')}
        >
          <Ionicons name="folder" size={24} color={pathName === "/PlantDirectory" ? "#007AFF" : "#888"} />
          <Text style={[styles.navLabel, pathName === "/PlantDirectory" && styles.activeNavLabel]}>Plants</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.navigate('/components/CameraScreen')}
        >
          <Ionicons name="camera" size={24} color={pathName === "/components/CameraScreen" ? "#007AFF" : "#888"} />
          <Text style={[styles.navLabel, pathName === "/components/CameraScreen" && styles.activeNavLabel]}>Camera</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.navigate('/components/CalendarView')}
        >
          <Ionicons name="calendar" size={24} color={pathName === "/components/CalendarView" ? "#007AFF" : "#888"} />
          <Text style={[styles.navLabel, pathName === "/components/CalendarView" && styles.activeNavLabel]}>Calendar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16, // Reduced from 18 for better symmetry
    paddingVertical: 28,
  },
  row: {
    justifyContent: 'space-between', // This distributes cards evenly
    marginBottom: 16, // Consistent spacing between rows
  },
  card: {
    width: cardWidth,
    paddingTop: 18,
    paddingBottom: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderRadius: 22,
    alignItems: 'center',
    shadowColor: '#14967F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 7,
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
    paddingBottom: 25,
    paddingTop: 75,
    paddingLeft: 0,
    paddingRight: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // For gradient, you'll need react-native-linear-gradient
    // backgroundColor: 'linear-gradient(135deg, #4CAF50, #45a049)',
    backgroundColor: '#4CAF50', // fallback
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    marginRight: 12,
    fontSize: 32,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '300',
    paddingLeft: 30,
    letterSpacing: 1,
    marginTop: 4,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    zIndex: 10,
  },
  
  // Navigation Bar
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#007AFF',
  },
});

export default PlantDirectory;
