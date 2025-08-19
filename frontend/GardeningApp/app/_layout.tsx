// app/_layout.tsx
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '@/config/supabase';
import { useEffect } from 'react';

export default function Layout() {


  
  return (
    <Stack
      screenOptions={{
        headerShown: false,      // This hides the header on all child screens/routes!
      }}
    />
  );
}
