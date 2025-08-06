import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import supabase from '../config/supabase';

type SignUpScreenProps = {
  goToLogin: () => void;
};

const SignUpScreen: React.FC<SignUpScreenProps> = ({ goToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSignUp() {
        setLoading(true);
        const { error } = await supabase.auth.signUp({ email, password, options: {data: {username}}});
        setLoading(false);
    if (error) Alert.alert('Sign Up Error', error.message);
    else Alert.alert('Success!', 'Check your email for confirmation.');
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
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <View style={{ marginBottom: 20 }}>
        <Button title="Sign Up" onPress={handleSignUp} disabled={loading} />
      </View>
      <Button title="Already have an account? Login" onPress={goToLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  title: { fontSize:32, marginBottom:20 },
  input: { width:'100%', height:40, borderColor:'#ccc', borderWidth:1, marginBottom:12, paddingHorizontal:8 },
});

export default SignUpScreen;