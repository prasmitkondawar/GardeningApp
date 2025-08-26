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
  Image: string;
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
  const plantParam = Array.isArray(params.plant) ? params.plant[0] : params.plant;
  const plant: PlantCard | null = plantParam ? JSON.parse(plantParam) : null;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    ]).start();
  }, []);

  if (!plant) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.containerCentered}
      >
        <Text style={styles.emptyText}>No plant selected</Text>
      </LinearGradient>
    );
  }

  const DetailItem: React.FC<{ label: string; text: string; icon: string }> = ({ label, text, icon }) => (
    <Animated.View 
      style={[
        styles.detailItem,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.detailIconContainer}>
        <Ionicons name={icon as any} size={20} color="#6366f1" />
      </View>
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailText}>{text}</Text>
      </View>
    </Animated.View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Background with plant image */}
        {plant.Image && (
          <ImageBackground
            source={{ uri: plant.Image }}
            style={styles.backgroundImage}
            blurRadius={10}
          >
            <LinearGradient
              colors={['rgba(102, 126, 234, 0.8)', 'rgba(118, 75, 162, 0.9)']}
              style={StyleSheet.absoluteFill}
            />
          </ImageBackground>
        )}

        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          {/* Modern Header */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                flexDirection: 'row',       // Add this for horizontal layout
                alignItems: 'center',       // Vertical alignment of children
                paddingHorizontal: 16,      // Optional, for inner horizontal spacing
              }
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.backButtonGradient}
              >
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text
                style={[styles.headerTitle, { textAlign: 'center' }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {plant.PlantPetName}
              </Text>
            </View>

            <View style={{ width: 40 }} /> {/* Placeholder to balance back button space */}
          </Animated.View>


          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* Hero Plant Image */}
            <Animated.View
              style={[
                styles.heroImageContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              {plant.Image && (
                <Image source={{ uri: plant.Image }} style={styles.heroImage} />
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0, 0, 0, 0.3)']}
                style={styles.imageOverlay}
              />
            </Animated.View>

            {/* Health Meter in floating card */}
            <Animated.View
              style={[
                styles.healthMeterCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
                }
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                style={styles.healthMeterGradient}
              >
                <Text style={styles.healthTitle}>Plant Health</Text>
                <PlantHealthMeterCircular health={plant.PlantHealth} />
              </LinearGradient>
            </Animated.View>

            {/* Modern Details Cards */}
            <Animated.View
              style={[
                styles.detailsSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                style={styles.detailsCard}
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
              </LinearGradient>
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
    backgroundColor: '#1a1a2e',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
  },
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  emptyText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '500',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroImageContainer: {
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  healthMeterCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  healthMeterGradient: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  healthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 22,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PlantDetailScreen;