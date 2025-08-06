import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import supabase from '../config/supabase';

type LoginScreenProps = {
  goToSignUp: () => void;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ goToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('Login Error', error.message);
    } else {
      Alert.alert('Login successful', `Logged in as ${email}`);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <View style={{ marginBottom: 20 }}>
        <Button title="Login" onPress={handleLogin} disabled={loading} />
      </View>
      <Button title="Want to create an account? Sign Up" onPress={goToSignUp} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 32, marginBottom: 20 },
  input: { width: '100%', height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 12, paddingHorizontal: 8 },
});

export default LoginScreen;