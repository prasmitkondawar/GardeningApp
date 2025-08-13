import React, { useState, useRef, useEffect } from 'react';
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
  const [isUploading, setIsUploading] = useState(false);
  
  
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if user is already signed in
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);
      
      if (!session) {
        // Sign in anonymously for storage access
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error('Auth error:', error);
          Alert.alert('Authentication Error', 'Failed to authenticate with storage service');
        } else {
          console.log('Anonymous auth successful:', data);
        }
      } else {
        console.log('Already authenticated:', session.user.id);
      }
    } catch (error) {
      console.error('Initialize auth error:', error);
    }
  };

  async function sendPlantPhoto(photoUri: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      // Step 1: Check if user can add more plants
      const checkResponse = await fetch("http://192.168.68.114:8000/can-add-plant", {
        method: "GET", // or POST if needed
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        // You can add authentication headers if needed, e.g. JWT token
      });

      const checkData = await checkResponse.json();  // parse response body JSON

      if (!checkData["can add plants"]) {
        Alert.alert("Plant limit reached", "You cannot add more plants.");
        return
        // Skip upload
      }

      setIsUploading(true);
      console.log("Uploading photo to Supabase Storage...");

      // Generate a unique id for the plant image
      const plantId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Upload the photo and get URL
      const photoUrl = await uploadPhotoAsync(photoUri, plantId);

      console.log("Photo uploaded, URL:", photoUrl);

      // Prepare payload with photo URL
      const payload = {
        image_url: photoUrl
      };

    //   // Send to backend
    //   const response = await fetch("http://192.168.68.114:8000/add-plant", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(payload),
    //   });

    //   const data = await response.json();
    //   console.log("Response from backend:", data);

    // return data;
    } catch (error) {
      console.error("Error sending plant photo:", error);
      Alert.alert('Upload Error', 'Failed to upload photo. Please try again.');
      throw error;
    } finally {
      setIsUploading(false);
    }
  }

  async function uploadPhotoAsync(uri: string, plantId: string): Promise<string> {
    try {
      console.log('Starting upload process...');
      
      // Check current session before upload
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session before upload:', session?.user?.id);
      
      if (!session) {
        throw new Error('No authenticated session found');
      }
      
      // Method 1: Try using FormData (recommended for React Native)
      const formData = new FormData();
      
      // Add the file to FormData
      formData.append('file', {
        uri: uri,
        type: 'image/jpeg',
        name: `${plantId}.jpg`,
      } as any);

      // Define the path inside the bucket - include user ID for better organization
      const filePath = `plants/${session.user.id}/${plantId}.jpg`;

      console.log('Uploading to path:', filePath);

      // Upload using FormData
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('plant-images')
        .upload(filePath, formData, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error("FormData upload failed, trying alternative method:", uploadError);
        
        // Method 2: Fallback to base64 decode method
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Create a File-like object from base64
        const response = await fetch(`data:image/jpeg;base64,${base64}`);
        const blob = await response.blob();

        const { data: uploadData2, error: uploadError2 } = await supabase.storage
          .from('plant-images')
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: true,
            contentType: 'image/jpeg'
          });

        if (uploadError2) {
          console.error("Supabase upload error:", uploadError2);
          throw uploadError2;
        }

        console.log('Upload successful (method 2):', uploadData2);
      } else {
        console.log('Upload successful (FormData):', uploadData);
      }

      // Get the public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from('plant-images')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        console.log('Got public URL:', urlData.publicUrl);
        return urlData.publicUrl;
      } else {
        // If bucket is private, create signed URL
        const { data: signedData, error: signedError } = await supabase.storage
          .from('plant-images')
          .createSignedUrl(filePath, 60 * 60 * 24); // Valid for 24 hours

        if (signedError) {
          throw signedError;
        }

        console.log('Got signed URL:', signedData.signedUrl);
        return signedData.signedUrl;
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
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

  const savePhoto = async () => {
    if (capturedPhoto && !isUploading) {
      try {
        await sendPlantPhoto(capturedPhoto);
        
        Alert.alert('Success!', 'Your photo has been uploaded successfully!', [
          {
            text: 'Take Another',
            onPress: retakePhoto,
          },
          {
            text: 'OK',
            style: 'default',
          },
        ]);
      } catch (error) {
        // Error already handled in sendPlantPhoto
      }
    }
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
              <TouchableOpacity 
                style={[styles.retakeButton, isUploading && styles.buttonDisabled]} 
                onPress={retakePhoto}
                disabled={isUploading}
              >
                <Ionicons name="refresh" size={24} color="#fff" />
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, isUploading && styles.buttonDisabled]} 
                onPress={savePhoto}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                    <Text style={styles.saveButtonText}>Uploading...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark" size={24} color="#fff" />
                    <Text style={styles.saveButtonText}>Save</Text>
                  </>
                )}
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
  
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CameraScreen;