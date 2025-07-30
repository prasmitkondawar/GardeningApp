import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import supabase from '../config/supabase';
import { Button, Input } from '@rneui/themed';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <View>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? 'Loading...' : 'Sign In'}
        onPress={signInWithEmail}
        disabled={loading}
      />
    </View>
  );
}
