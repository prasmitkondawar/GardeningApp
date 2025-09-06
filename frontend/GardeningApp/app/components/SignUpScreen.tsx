import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import supabase from '../../config/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/index';
import { useNavigation } from 'expo-router';


type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUpScreen'>;

export default function SignUpScreen () {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const screenNav = useNavigation<NavigationProp>();

  async function handleSignUp() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) Alert.alert('Sign Up Error', error.message);
    else Alert.alert('Success!', 'Check your messages for OTP password.');

    screenNav.navigate('OtpScreen', {phone: phone });
  }

  async function handleDirLogin() {
    screenNav.navigate('LoginScreen');
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        placeholder="Phone Number"
        autoCapitalize="none"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />
      <View style={{ marginBottom: 20 }}>
        <Button title="Sign Up" onPress={handleSignUp} disabled={loading} />
      </View>
      <Button title="Already have an account? Login" onPress={handleDirLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  title: { fontSize:32, marginBottom:20 },
  input: { width:'100%', height:40, borderColor:'#ccc', borderWidth:1, marginBottom:12, paddingHorizontal:8 },
});