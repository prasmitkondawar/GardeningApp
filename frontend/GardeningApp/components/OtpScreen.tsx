import React, { useState } from 'react';
import { View, TextInput, Button, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import supabase from '../config/supabase';
import { RootStackParamList } from '@/app/_layout';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

type OtpScreenRouteProp = RouteProp<RootStackParamList, 'OtpScreen'>;
type OtpProp = NativeStackNavigationProp<RootStackParamList, 'OtpScreen'>;

export default function OtpScreen() {
  const [otp, setOtp] = useState('');
  const route = useRoute<OtpScreenRouteProp>();
  const screenNav = useNavigation<OtpProp>();
  const { phone } = route.params;

  const handleVerify = async () => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });
    if (error) {
      Alert.alert('OTP Error', error.message);
    } else {
      Alert.alert('Success', 'You are signed in!');
      // Optionally, update user's profile with name/other info here
      screenNav.navigate('HomeScreen');
    }
  };

  function handleGoBack() {
    screenNav.navigate('SignUpScreen');
  }

  return (
    <View>
      <TextInput placeholder="Enter OTP" onChangeText={setOtp} value={otp} keyboardType="number-pad" />
      <Button title="Verify OTP" onPress={handleVerify}/>
      <TouchableOpacity style={} onPress={handleGoBack}>
        <Ionicons name="arrow-undo-circle-outline" color={ "3B2C35" } />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    
  }
});
