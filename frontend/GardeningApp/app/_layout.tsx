// app/_layout.tsx
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '@/config/supabase';
import { useEffect } from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUpScreen from '@/components/SignUpScreen';
import OtpScreen from '@/components/OtpScreen';
import LoginScreen from '@/components/LoginScreen';
import Profile from '@/components/Profile';
import HomeScreen from './HomeScreen';

export type RootStackParamList = {
  LoginScreen: undefined;
  SignUpScreen: undefined;
  OtpScreen: {phone: string};
  Profile: undefined;
  HomeScreen: undefined;
};

const StackNavigator = createNativeStackNavigator<RootStackParamList>();

export default function Layout() {
  const RUN_ONCE_PER_DAY_KEY = 'RUN_ONCE_PER_DAY_DATE';

  async function updatePrevSchedule() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const response = await fetch('https://gardeningapp.onrender.com/update-prev-schedule', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const errorMessage = errorJson.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Parse response if OK
      const result = await response.json();

      // Check API-level status
      if (result.status !== "success") {
        throw new Error(result.error || "Failed to update previous schedule.");
      }

      // Optionally return something (e.g., result, message, etc.)
      return result;
    } catch (error) {
      console.error('Error updating previous schedule', error);
      throw error;
    }
  }

  async function runOncePerDay() {
    try {
      const today = new Date().toISOString().slice(0, 10); // e.g. '2025-08-14'
      const storedDate = await AsyncStorage.getItem(RUN_ONCE_PER_DAY_KEY);

      if (storedDate !== today) {
        // Run your one-time code here
        console.log('Running function for the first time today!');
        updatePrevSchedule()
        // Store today's date to prevent rerunning
        await AsyncStorage.setItem(RUN_ONCE_PER_DAY_KEY, today);
      } else {
        console.log('Function already ran today.');
      }
    } catch (error) {
      console.error('Error checking daily run status:', error);
    }
  }

  useEffect(() => {
    runOncePerDay();
  }, []);

  
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,      // This hides the header on all child screens/routes!
        }}
      />

      <NavigationIndependentTree>
        <StackNavigator.Screen name="LoginScreen" component={LoginScreen} />
        <StackNavigator.Screen name="SignUpScreen" component={SignUpScreen} />
        <StackNavigator.Screen name="OtpScreen" component={OtpScreen} />
        <StackNavigator.Screen name="Profile" component={Profile} />
        <StackNavigator.Screen name="HomeScreen" component={HomeScreen}/>
      </NavigationIndependentTree>
    </>
  );
}
