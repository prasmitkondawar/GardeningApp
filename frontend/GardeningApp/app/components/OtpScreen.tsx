import React, { useState } from 'react';
import { View, TextInput, Button, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import supabase from '../../config/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSearchParams } from 'expo-router/build/hooks';
import { Text } from 'react-native';
import { KeyboardAvoidingView, Platform } from 'react-native';

export default function OtpScreen() {
  const [loading, setLoading] = useState(false);
  const { email, orgScreen } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const router = useRouter();
  const emailStr = Array.isArray(email) ? email[0] : email;
  const orgScreenStr = Array.isArray(orgScreen) ? orgScreen[0] : orgScreen;

  const handleVerify = async () => {
    setLoading(true);
    console.log("EMAIL: " + emailStr);
    const { data, error } = await supabase.auth.verifyOtp({
      email: emailStr,
      token: otp,
      type: 'email',
    });
    setLoading(false);

    if (error) {
      Alert.alert('OTP Error', error.message);
    } else {
      Alert.alert('Success', 'You are signed in!');
      router.navigate("/components/CameraScreen");  // Navigate to HomeScreen after successful verification
    }
  };

  const handleOrgScreen = async () => {
    if (orgScreenStr === 'LoginScreen') {
      router.navigate("/components/LoginScreen")
    } else if (orgScreenStr === 'SignUpScreen') {
      router.navigate("/components/SignUpScreen")
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={48}
    >
      <TouchableOpacity style={styles.backButton} onPress={handleOrgScreen}>
        <Ionicons name="arrow-back" color="#52844B" size={28} />
      </TouchableOpacity>
      <View style={styles.content}>
        <Ionicons name="keypad-outline" size={48} color="#52844B" style={{ marginBottom: 16 }} />
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>We've sent a code to your email</Text>
        <TextInput
          placeholder="Enter OTP"
          onChangeText={setOtp}
          value={otp}
          keyboardType="number-pad"
          style={styles.input}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity
          style={[styles.verifyButton, loading && { opacity: 0.7 }]}
          onPress={handleVerify}
          disabled={loading}
        >
          <Text style={styles.verifyButtonText}>{loading ? "Verifying..." : "Verify OTP"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    paddingTop: 48,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 24,
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#52844B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94796b',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    fontSize: 18,
    color: '#52844B',
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#52844B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
