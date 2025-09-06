import React from "react";
import { View } from "react-native";
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUpScreen from '@/components/SignUpScreen';
import OtpScreen from '@/components/OtpScreen';
import LoginScreen from '@/components/LoginScreen';
import Profile from '@/components/Profile';
import HomeScreen from './HomeScreen';
import PlantDirectory from "./PlantDirectory";
import PlantDetailScreen from "./PlantDetailScreen";
import PlantHealthMeterCircular from "./PlantHealthMeterCircular";

const StackNavigator = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
  PlantDirectory: undefined,
  PlantDetailScreen: undefined,
  PlantHealthMeterCircular: undefined,
  LoginScreen: undefined;
  SignUpScreen: undefined;
  OtpScreen: {phone: string};
  Profile: undefined;
  HomeScreen: undefined;
};

export const unstable_settings = { headerShown: false };

export default function Index() {
  return (
    <>
      <View style={{ flex: 1 }}>
        <HomeScreen />
      </View>
        <StackNavigator.Screen name="LoginScreen" component={LoginScreen} />
        <StackNavigator.Screen name="PlantDirectory" component={PlantDirectory} />
        <StackNavigator.Screen name="PlantDetailScreen" component={PlantDetailScreen} />
        <StackNavigator.Screen name="SignUpScreen" component={SignUpScreen} />
        <StackNavigator.Screen name="OtpScreen" component={OtpScreen} />
        <StackNavigator.Screen name="Profile" component={Profile} />
        <StackNavigator.Screen name="HomeScreen" component={HomeScreen}/>

    </>
  );
}
