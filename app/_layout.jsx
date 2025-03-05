import * as SplashScreen from "expo-splash-screen";
import StartUpModal from "../components/functions/StartUpModal";
import NoInternetModal from "../utils/NoInternetModal";
import { useConnectivity } from "../utils/useConnectivity";
import { usePushNotifications } from "../utils/usePushNotifications";
import { useFonts } from "expo-font";
import { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { NativeWindStyleSheet } from "nativewind";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

NativeWindStyleSheet.setOutput({
  default: "native",
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "Rubik-Regular": require("../assets/fonts/regular.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/semibold.ttf"),
    "Rubik-Bold": require("../assets/fonts/bold.ttf"),
    "Rubik-Italic": require("../assets/fonts/italic.ttf"),
    "Rubik-BoldItalic": require("../assets/fonts/bolditalic.ttf"),
  });
  const [internetModal, setInternetModal] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [allowModal, setAllowModal] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const { notification } = usePushNotifications();
  const isOnline = useConnectivity();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (fontsLoaded || error) {
        SplashScreen.hideAsync().then(() => {
          if (isOnline && isConnected) {
            setLangModalVisible(true);
            setAllowModal(true);
          }
        });
      }
    }, 3000);

    if (!isOnline || !isConnected) {
      setInternetModal(true);
    } else {
      setInternetModal(false);
    }

    return () => clearTimeout(timeout);
  }, [fontsLoaded, error, isOnline, isConnected]);

  const handleStartUpModalClose = () => {
    setLangModalVisible(false);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <RootSiblingParent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          </Stack>
          <NoInternetModal
            visible={internetModal}
            setIsConnected={setIsConnected}
          />
          <StartUpModal
            languageIsVisible={langModalVisible}
            setLanguageIsVisible={handleStartUpModalClose}
            isAllowed={allowModal}
            noInternet={internetModal}
          />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </RootSiblingParent>
  );
}
