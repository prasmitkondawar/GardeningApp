import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import supabase from '../../config/supabase';
import { useRouter } from 'expo-router';

// type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUpScreen'>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
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
    <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
    >
      <View style={styles.box}>
        <Text style={styles.title}>Log In</Text>
        <Text style={styles.subtitle}>Enter your email address to receive a one-time password.</Text>
        <TextInput
          placeholder="Email Address"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#94796b"
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Send OTP</Text>
          }
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.navigate("/components/SignUpScreen")}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Want to create an account? <Text style={styles.linkText}>Sign Up</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const PRIMARY_GREEN = '#52844B';   // earthy green
const DARK_BROWN = '#62473e';      // deep brown
const LIGHT_BROWN = '#ede5df';     // light beige/brown
const ACCENT_BROWN = '#94796b';    // mid brown

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BROWN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 16,
    width: '92%',
    maxWidth: 425,
    elevation: 6,
    shadowColor: DARK_BROWN,
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 13,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: PRIMARY_GREEN,
    marginBottom: 8,
  },
  subtitle: {
    color: DARK_BROWN,
    fontSize: 15,
    marginBottom: 18,
    textAlign: 'center',
    fontWeight: '400',
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: ACCENT_BROWN,
    borderWidth: 1.5,
    borderRadius: 9,
    marginBottom: 22,
    paddingHorizontal: 12,
    fontSize: 16,
    color: DARK_BROWN,
    backgroundColor: '#faf8f6',
  },
  button: {
    width: '100%',
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonDisabled: {
    backgroundColor: '#9cc99e',
  },
  secondaryButton: {
    padding: 7,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: DARK_BROWN,
    fontSize: 14,
  },
  linkText: {
    color: PRIMARY_GREEN,
    fontWeight: '600',
  },
});

