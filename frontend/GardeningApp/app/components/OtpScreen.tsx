import React, { useState } from 'react';
import { View, TextInput, Button, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import supabase from '../../config/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSearchParams } from 'expo-router/build/hooks';

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
      // Optionally, update user's profile with name/other info here
      router.navigate("/HomeScreen")
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
    <View style={styles.container}>
      <TextInput placeholder="Enter OTP" onChangeText={setOtp} value={otp} keyboardType="number-pad" style = {styles.input} />
      <Button title="Verify OTP" onPress={handleVerify} disabled={loading}/>
      <TouchableOpacity style={styles.backButton} onPress={handleOrgScreen}>
        <Ionicons name="arrow-undo-circle-outline" color={ "3B2C35" } size={30}/>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1, 
    justifyContent:'center', 
    alignItems:'center', 
    padding:20
  },

  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'flex-start',
    alignSelf: 'flex-start', 
  },

  input: {
    width: '100%', 
    height: 40,  
    borderWidth: 1, 
    marginBottom: 12, 
    paddingHorizontal: 8
  },
});
