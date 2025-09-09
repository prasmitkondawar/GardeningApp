import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import supabase from '../../config/supabase';
import { useNavigation, useRouter } from 'expo-router';

export default function SignUpScreen () {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

  async function handleSignUp() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) Alert.alert('Sign Up Error', error.message);
    else Alert.alert('Success!', 'Check your messages for OTP password.');

    router.push(`/components/OtpScreen?email=${encodeURIComponent(email)}?orgScreen=SignUpScreen`);
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <View style={{ marginBottom: 20 }}>
        <Button title="Sign Up" onPress={handleSignUp} disabled={loading} />
      </View>
      <Button title="Already have an account? Login" onPress={() => router.navigate('/components/LoginScreen')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  title: { fontSize:32, marginBottom:20 },
  input: { width:'100%', height:40, borderColor:'#ccc', borderWidth:1, marginBottom:12, paddingHorizontal:8 },
});