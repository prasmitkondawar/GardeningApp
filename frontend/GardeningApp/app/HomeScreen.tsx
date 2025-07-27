import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CameraScreen from "@/components/CameraScreen";

export default function HomeScreen() {
  // Tracks which "screen" is shown
  const [activeScreen, setActiveScreen] = useState<"home" | "camera" | "profile">("home");

  // Render the active child-screen
  let ScreenComponent;
    if (activeScreen === "camera") {
        ScreenComponent = <CameraScreen />;
    }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {ScreenComponent}
      </View>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.plusButton} onPress={() => setActiveScreen("camera")}>
          <Ionicons name="add-circle" size={54} color={activeScreen === "camera" ? "#007AFF" : "#888"} />
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
