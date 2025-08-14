// app/_layout.tsx
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Layout() {
  const RUN_ONCE_PER_DAY_KEY = 'RUN_ONCE_PER_DAY_DATE';

  async function runOncePerDay() {
    try {
      const today = new Date().toISOString().slice(0, 10); // e.g. '2025-08-14'
      const storedDate = await AsyncStorage.getItem(RUN_ONCE_PER_DAY_KEY);

      if (storedDate !== today) {
        // Run your one-time code here
        console.log('Running function for the first time today!');

        // Store today's date to prevent rerunning
        await AsyncStorage.setItem(RUN_ONCE_PER_DAY_KEY, today);
      } else {
        console.log('Function already ran today.');
      }
    } catch (error) {
      console.error('Error checking daily run status:', error);
    }
  }
  return (
    <Stack
      screenOptions={{
        headerShown: false,      // This hides the header on all child screens/routes!
      }}
    />
  );
}
