import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import supabase from '../config/supabase';
import * as FileSystem from 'expo-file-system';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CameraScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  
  
  const cameraRef = useRef<CameraView>(null);

  async function sendPlantPhoto(photoUri: string) {
    try {
      console.log("Uploading photo to Firebase Storage...");
  
      // Generate a unique id for the plant image, you can use UUID or timestamp
      const plantId = Date.now().toString();
  
      // Upload the photo and get URL
      const photoUrl = await uploadPhotoAsync(photoUri, plantId);
  
      console.log("Photo uploaded, URL:", photoUrl);
  
      // Prepare payload with photo URL (not base64 anymore)
      const payload = {
        image_url: photoUrl,  // your backend expects this field now
        plant_name: "test plant name",
        scientific_name: "test scientific name",
        species: "test species",
      };
  
      // Send to backend including JWT token, adjust headers as needed
      const response = await fetch("http://192.168.68.108:8000/add-plant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Response from backend:", data);
  
      return data;
    } catch (error) {
      console.error("Error sending plant photo:", error);
      throw error;
    }
  }
  

  async function uploadPhotoAsync(uri: string, plantId: string): Promise<string> {
    // Fetch the file from local URI and get blob
    const response = await fetch(uri);
    const blob = await response.blob();
  
    // Define the path inside the bucket, e.g., "plants/{plantId}.jpg"
    const filePath = `plants/${plantId}.jpg`;
  
    // Upload the blob to Supabase Storage bucket (make sure the bucket 'plant-photos' exists)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('plant-images') // replace with your actual bucket name if different
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: true, // Overwrite file if it exists
      });
  
    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw uploadError;
    }
  
    // Get the public URL for the uploaded image
    // If bucket is private, replace getPublicUrl with createSignedUrl:
    const { data: signedData, error: signedError } = await supabase.storage
      .from('plant-photos')
      .createSignedUrl(filePath, 60 * 60);  // valid for 1 hour

    if (signedError) {
      throw signedError;
    }

    return signedData.signedUrl;
  }
  

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      if (photo) {
        setCapturedPhoto(photo.uri);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setShowPreview(false);
  };

  const savePhoto = () => {
    if (capturedPhoto) {
      sendPlantPhoto(capturedPhoto);
    }
  
    Alert.alert('Photo Captured', 'Your photo has been captured successfully!', [
      {
        text: 'Take Another',
        onPress: retakePhoto,
      },
      {
        text: 'OK',
        style: 'default',
      },
    ]);
  };
  

  const toggleCameraType = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.permissionContent}>
          <Ionicons name="camera-outline" size={80} color="#666" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionDescription}>
            This app needs camera access to take photos
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.permissionButtonText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {showPreview && capturedPhoto ? (
        // Photo Preview Mode
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
          
          <View style={styles.previewOverlay}>
            <View style={styles.previewControls}>
              <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
                <Ionicons name="refresh" size={24} color="#fff" />
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={savePhoto}>
                <Ionicons name="checkmark" size={24} color="#fff" />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        // Camera Live Preview Mode
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
          />
          
          {/* Camera UI Overlay */}
          <View style={styles.cameraOverlay}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <View style={styles.topBarLeft} />
              
              <View style={styles.topBarCenter}>
                <Text style={styles.cameraTitle}>Camera</Text>
              </View>
              
              <View style={styles.topBarRight}>
                <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
                  <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <View style={styles.bottomLeft}>
                {capturedPhoto && (
                  <TouchableOpacity
                    style={styles.thumbnailContainer}
                    onPress={() => setShowPreview(true)}
                  >
                    <Image source={{ uri: capturedPhoto }} style={styles.thumbnail} />
                    <View style={styles.thumbnailBorder} />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.bottomCenter}>
                <TouchableOpacity
                  style={[styles.captureButton, isCapturing && styles.captureButtonActive]}
                  onPress={takePhoto}
                  disabled={isCapturing}
                  activeOpacity={0.8}
                >
                  <View style={[styles.captureButtonInner, isCapturing && styles.captureButtonInnerActive]}>
                    {isCapturing && <View style={styles.capturingDot} />}
                  </View>
                </TouchableOpacity>
              </View>
              
              <View style={styles.bottomRight} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  
  // Loading States
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  
  // Permission Screen
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionContent: {
    alignItems: 'center',
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionDescription: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Camera View
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  
  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  topBarLeft: {
    width: 50,
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  topBarRight: {
    width: 50,
    alignItems: 'flex-end',
  },
  cameraTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  
  // Bottom Controls
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  bottomLeft: {
    width: 70,
    alignItems: 'flex-start',
  },
  bottomCenter: {
    flex: 1,
    alignItems: 'center',
  },
  bottomRight: {
    width: 70,
  },
  
  // Capture Button
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonActive: {
    transform: [{ scale: 0.95 }],
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInnerActive: {
    backgroundColor: '#f5f5f5',
  },
  capturingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
  },
  
  // Thumbnail
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  thumbnailBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  
  // Preview Mode
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
    width: screenWidth,
    resizeMode: 'contain',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(20px)',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 40,
  },
  
  // Preview Buttons
  retakeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  saveButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CameraScreen;