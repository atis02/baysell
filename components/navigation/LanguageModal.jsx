import icons from "../../utils/icons";
import { CustomText } from "../../utils/CustomText";
import { useLanguageStore } from "../../utils/languageStore";
import { Image } from "expo-image";
import { View, Modal, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function LanguageModal({ visible, setVisible }) {
  const { changeLanguage } = useLanguageStore();

  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View className="bg-dark flex-1 items-center justify-center">
        <View className="">
          <Image
            source={icons.defaultLogo}
            contentFit="contain"
            className="h-52 w-52"
          />
        </View>
        <CustomText classes="text-xl text-white font-bbold mb-4">
          Добро пожаловать в BaySel !
        </CustomText>
        <View className="items-center space-y-2 w-72">
          <View className="flex-row justify-center items-center w-full">
            <CustomText classes="text-base text-white font-bsemibold">
              Выберите язык
            </CustomText>
          </View>
          <View className="rounded-xl justify-between items-center w-full">
            <Pressable
              onPress={() => {
                changeLanguage("tm");
                setVisible(false);
              }}
              className="border border-gray-400 rounded-xl flex-row items-center active:border-primary mb-2 px-2 h-12 w-full"
            >
              <Image
                source={icons.turkmenistan}
                contentFit="contain"
                className="mr-4 h-10 w-10"
              />
              <CustomText classes="font-bsemibold text-base text-white">
                Türkmen
              </CustomText>
            </Pressable>
            <Pressable
              onPress={() => {
                changeLanguage("ru");
                setVisible(false);
              }}
              className="border border-gray-400 rounded-xl flex-row items-center active:border-primary px-2 h-12 w-full"
            >
              <Image
                source={icons.russia}
                contentFit="contain"
                className="mr-4 h-10 w-10"
              />
              <CustomText classes="font-bsemibold text-base text-white">
                Русский
              </CustomText>
            </Pressable>
          </View>
        </View>
      </View>
      <StatusBar backgroundColor="#212125" style="light" />
    </Modal>
  );
}
