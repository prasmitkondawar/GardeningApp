import React, { useState } from 'react';
import { View, TextInput, Button, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import supabase from '../../config/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function OtpScreen() {
  const [loading, setLoading] = useState(false);
  const { email, orgScreen } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const router = useRouter();
  const emailStr = Array.isArray(email) ? email[0] : email;
  const orgScreenStr = Array.isArray(orgScreen) ? orgScreen[0] : orgScreen;

  const handleVerify = async () => {
    setLoading(true);
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
      // Optionally, update user's profile with name/other info here
      router.navigate("/HomeScreen")
    }
  };


  return (
    <View>
      <TextInput placeholder="Enter OTP" onChangeText={setOtp} value={otp} keyboardType="number-pad" style = {styles.input} />
      <Button title="Verify OTP" onPress={handleVerify} disabled={loading}/>
      <TouchableOpacity style={styles.backButton} onPress={() => router.navigate("/components/LoginScreen")}>
        <Ionicons name="arrow-undo-circle-outline" color={ "3B2C35" } />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start', 
    margin: 16,
    scaleX: 2.0,
    scaleY: 2.0,
  },

  input: {
    width: '100%', 
    height: 40, 
    borderColor: '#ccc', 
    borderWidth: 1, 
    marginBottom: 12, 
    paddingHorizontal: 8
  },
});
