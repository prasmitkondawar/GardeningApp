import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import supabase from '../../config/supabase';
import { useRouter } from 'expo-router';

// type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUpScreen'>;

export default function LoginScreen() {
  const [email, setEmail] = useState(' ');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // const screenNav = useNavigation<NavigationProp>();

  async function handleLogin() {
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithOtp({ email });
    console.log("Email: " + email);
    setLoading(false);
    
    if (error) {
      Alert.alert('Login Error', error.message);
    } else {
      Alert.alert('OTP Sent!', `Check your email for the password: ${email}`);
      router.push({
        pathname: '/components/OtpScreen',
        params: { email: email, orgScreen: 'LoginScreen' }
      });
    }
  }

  return (
    <>
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <View style={{ marginBottom: 20 }}>
        <Button title="Login" onPress={handleLogin} disabled={loading} />
      </View>
      {<Button title="Want to create an account? Sign Up" onPress={() => router.navigate("/components/SignUpScreen")} />}
    </View>    
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 32, marginBottom: 20 },
  input: { width: '100%', height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 12, paddingHorizontal: 8 },
});

