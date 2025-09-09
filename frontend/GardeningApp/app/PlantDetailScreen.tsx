import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import PlantHealthMeterCircular from './PlantHealthMeterCircular';

const { width, height } = Dimensions.get('window');

interface PlantCard {
  ImageURL: string;
  PlantName: string;
  PlantPetName: string;
  ScientificName: string;
  Species: string;
  PlantID: number;
  PlantHealth: number;
}

const PlantDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const plant: PlantCard | null = params?.plant
    ? JSON.parse(params.plant as string)
    : null;


  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!plant) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#fff' }}>No plant selected</Text>
      </View>
    );
  }

  const DetailItem: React.FC<{ label: string; text: string; icon: string }> = ({
    label,
    text,
    icon,
  }) => (
    <View style={styles.detailItem}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon as any} size={20} color="#6366f1" />
      </View>
      <View>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailText}>{text}</Text>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Blurred background plant image */}
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          {/* Header with back and pet name */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {plant.PlantPetName}
            </Text>
            <View style={{ width: 28 }} />{/* Placeholder for spacing */}
          </Animated.View>


          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Image */}
            <Animated.View
              style={[
                styles.imageBox,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Image source={{ uri: plant.ImageURL }} style={styles.heroImage} />
            </Animated.View>



            {/* Health Meter */}
            <Animated.View
              style={[
                styles.healthCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['#ffffffee', '#ffffffcc']}
                style={styles.healthGradient}
              >
                <Text style={styles.sectionTitle}>Plant Health</Text>
                <PlantHealthMeterCircular health={plant.PlantHealth} />
              </LinearGradient>
            </Animated.View>

            {/* Details */}
            <Animated.View
              style={[
                styles.detailsCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.sectionTitle}>Plant Information</Text>
              <DetailItem
                label="Scientific Name"
                text={plant.ScientificName}
                icon="flask-outline"
              />
              <DetailItem
                label="Common Name"
                text={plant.PlantName}
                icon="leaf-outline"
              />
              <DetailItem
                label="Species"
                text={plant.Species}
                icon="library-outline"
              />
              <DetailItem
                label="Plant ID"
                text={String(plant.PlantID)}
                icon="barcode-outline"
              />
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#223355', // nice muted blue instead of blurred image
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backgroundImage: {
    position: 'absolute',
    width,
    height,
  },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  heroImageContainer: {
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
  },
  healthCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 6,
  },
  healthGradient: {
    padding: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  detailsCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#fff',
    elevation: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(99,102,241,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  detailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  imageBox: {
    width: 250,
    height: 250,
    borderRadius: 20,
    backgroundColor: '#fff',  // white background inside the box
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff', // ensure white background behind image if transparent
  },
});

export default PlantDetailScreen;
