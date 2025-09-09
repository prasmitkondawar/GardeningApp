import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CameraScreen from "@/app/components/CameraScreen";
import PlantDirectory from "@/app/PlantDirectory";
import LoginScreen from "@/app/components/LoginScreen";
import SignUpScreen from "@/app/components/SignUpScreen";
import CalendarView from "@/app/components/CalendarView";
import ProfilePage from "@/app/components/Profile";
import { Stack, usePathname, useRouter } from "expo-router";


// type HomeScreenProp = NativeStackNavigationProp<RootStackParamList, 'HomeScreen'>;

export default function HomeScreen() {
  // Tracks which "screen" is shown
  // const [activeScreen, setActiveScreen] = useState<"home" | "camera" | "plant_directory" | "signup" | "login" | "calendar-view" | "profile">("login");
  // const screenNav = useNavigation<HomeScreenProp>

  // // Render the active child-screen
  // let ScreenComponent;
  //   if (activeScreen === "camera") {
  //       ScreenComponent = <CameraScreen />;
  //   } else if (activeScreen == "plant_directory") {
  //       ScreenComponent = <PlantDirectory></PlantDirectory>
  //   } else if (activeScreen == "login") {
  //       ScreenComponent = <LoginScreen/>
  //   } else if (activeScreen == "signup"){
  //       ScreenComponent = <SignUpScreen/>
  //   } else if (activeScreen == "calendar-view") {
  //       ScreenComponent = <CalendarView/>;
  //   } else if (activeScreen == "profile") {
  //       ScreenComponent = <ProfilePage/>;
  //   }

  const router = useRouter();
  const pathName = usePathname();

  return (
    <>
      <Stack.Screen options={{ headerShown: true }} />
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
          </View>

          {/* Bottom bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity 
              style={styles.plusButton} 
              onPress={() => router.navigate('/PlantDirectory')}
            >
              <Ionicons 
                name="folder"            // <-- folder icon instead of add-circle
                size={54} 
                color={pathName === "/PlantDirectory" ? "#007AFF" : "#888"} 
              />

            </TouchableOpacity>
            <TouchableOpacity style={styles.plusButton} onPress={() => router.navigate('/components/CameraScreen')}>
              <Ionicons name="add-circle" size={54} color={pathName === "/components/CameraScreen" ? "#007AFF" : "#888"} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.plusButton}
              onPress={() => router.navigate('/components/CalendarView')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="calendar" 
                size={40} 
                color={pathName === "/components/CalendarView" ? "#007AFF" : "#888"} 
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.plusButton} onPress={() => router.navigate('/components/LoginScreen')}>
              <Ionicons name="person-circle" size={54} color={pathName === "/component/LoginScreen" ? "#007AFF" : "#888"} />
            </TouchableOpacity>


          </View>
      </View>
    </>

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
