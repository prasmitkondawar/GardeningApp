import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { supabase } from './lib/supabase';
import Auth from './components/Auth'; // adjust path as needed

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <View>
      {!session ? <Auth /> : <Text>Welcome, User!</Text>}
    </View>
  );
}
