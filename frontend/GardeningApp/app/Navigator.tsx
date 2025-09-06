import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '@/app/HomeScreen';
import LoginScreen from '@/app/components/LoginScreen';
import SignUpScreen from '@/app/components/SignUpScreen';
import OtpScreen from '@/app/components/OtpScreen';

// Import your screens here

export type RootStackParamList = {
    Home: undefined;
    LoginScreen: undefined;
    SignUpScreen: undefined;
    OtpScreen: { phone: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const Navigator: React.FC = () => (
    <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="OtpScreen" component={OtpScreen} />
        </Stack.Navigator>
    </NavigationContainer>
);

export default Navigator;