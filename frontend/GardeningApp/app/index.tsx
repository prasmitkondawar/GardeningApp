import React from "react";
import { View } from "react-native";
import HomeScreen from "./HomeScreen";
export const unstable_settings = { headerShown: false };

export default function Index() {

  
  return (
    <View style={{ flex: 1 }}>
      <HomeScreen />
    </View>
  );
}
