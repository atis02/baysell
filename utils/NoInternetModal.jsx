import icons from "./icons";
import { CustomText } from "./CustomText";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { Modal, View, Pressable } from "react-native";
import { checkInternetConnectivity } from "./utils";

export default function NoInternetModal({ visible, setIsConnected }) {
  const handleRetry = async () => {
    const isConnected = await checkInternetConnectivity();
    if (isConnected) {
      setIsConnected(true);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      style={{ zIndex: 10 }}
    >
      <View className="bg-black flex-1 justify-center items-center">
        <View className="items-center p-2 h-auto w-[300px]">
          <Image
            source={icons.cloudX}
            contentFit="contain"
            className="mb-4 h-16 w-16"
            tintColor="#ffffff"
          />
          <CustomText classes="text-white text-center mb-4" numberOfLines={3}>
            Internet näsazlygy. Internediňizi täzeden barlaň.
          </CustomText>
          <Pressable
            className="bg-primary rounded-xl flex flex-row justify-center items-center active:bg-primary-800 px-4 h-12"
            onPress={handleRetry}
          >
            <CustomText classes="text-white text-white text-base">
              Täzeden synanyş
            </CustomText>
          </Pressable>
        </View>
      </View>
      <StatusBar backgroundColor="#070417" style="light" />
    </Modal>
  );
}
