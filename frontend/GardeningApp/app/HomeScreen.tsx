import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CameraScreen from "@/components/CameraScreen";
import PlantDirectory from "@/components/PlantDirectory";
import LoginScreen from "@/components/LoginScreen";
import SignUpScreen from "@/components/SignUpScreen";

export default function HomeScreen() {
  // Tracks which "screen" is shown
  const [activeScreen, setActiveScreen] = useState<"home" | "camera" | "plant_directory" | "signup" | "login">("home");

  // Render the active child-screen
  let ScreenComponent;
    if (activeScreen === "camera") {
        ScreenComponent = <CameraScreen />;
    } else if (activeScreen == "plant_directory") {
        ScreenComponent = <PlantDirectory></PlantDirectory>
    } else if (activeScreen == "login") {
        ScreenComponent = <LoginScreen goToSignUp={() => setActiveScreen('signup')}/>
    } else if (activeScreen == "signup"){
        ScreenComponent = <SignUpScreen goToLogin={() => setActiveScreen('login')} />
    }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {ScreenComponent}
      </View>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.plusButton} 
          onPress={() => setActiveScreen("plant_directory")}
        >
          <Ionicons 
            name="folder"            // <-- folder icon instead of add-circle
            size={54} 
            color={activeScreen === "plant_directory" ? "#007AFF" : "#888"} 
          />

        </TouchableOpacity>
        <TouchableOpacity style={styles.plusButton} onPress={() => setActiveScreen("camera")}>
          <Ionicons name="add-circle" size={54} color={activeScreen === "camera" ? "#007AFF" : "#888"} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.plusButton} onPress={() => setActiveScreen("login")}>
          <Ionicons name="person-circle" size={54} color={activeScreen === "login" ? "#007AFF" : "#888"} />
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: "row",
    height: 70,
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-around",
  },
  barButton: {
    flex: 1,
    alignItems: "center",
    paddingTop: 8,
  },
  plusButton: {
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  barLabel: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
  activeLabel: {
    color: "#007AFF",
    fontWeight: "bold",
  },
});
