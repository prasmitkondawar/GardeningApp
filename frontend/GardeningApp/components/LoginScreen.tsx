import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import supabase from '../config/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/index';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUpScreen'>;

export default function LoginScreen() {
  const [phone, setPhone] = useState(' ');
  const [loading, setLoading] = useState(false);
  const screenNav = useNavigation<NavigationProp>();

  async function handleLogin() {
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithOtp({ phone });
    console.log("DATA", data);
    setLoading(false);
    if (error) {
      Alert.alert('Login Error', error.message);
    } else {
      Alert.alert('Login successful', `Logged in as ${phone}`);
    }
  }

  async function handleDirSignUp() {
    screenNav.navigate("SignUpScreen");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Phone"
        autoCapitalize="none"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />
      <View style={{ marginBottom: 20 }}>
        <Button title="Login" onPress={handleLogin} disabled={loading} />
      </View>
      {<Button title="Want to create an account? Sign Up" onPress={handleDirSignUp} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 32, marginBottom: 20 },
  input: { width: '100%', height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 12, paddingHorizontal: 8 },
});

