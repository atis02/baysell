import icons from "../../utils/icons";
import { CustomText } from "../../utils/CustomText";
import { useLanguageStore } from "../../utils/languageStore";
import { useState } from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { View, Modal, Pressable } from "react-native";

export default function NavBar() {
  const [languageChangeModalVisible, setLanguageChangeModalVisible] =
    useState(false);
  const { changeLanguage, getTranslations } = useLanguageStore();
  const t = getTranslations();
  const navigation = useNavigation();

  return (
    <View className="bg-black border-b border-dark flex-row justify-between items-center px-2 h-20">
      <Pressable
        onPress={() => navigation.openDrawer()}
        className="justify-center active:opacity-70 h-12 w-16"
      >
        <Image
          source={icons.menuBurger}
          contentFit="contain"
          className="h-6 w-6"
          transition={100}
          tintColor="#ffffff"
        />
      </Pressable>
      <Pressable onPress={() => router.navigate("/")} className="mr-6">
        <Image
          source={icons.defaultLogo}
          contentFit="contain"
          className="h-24 w-24"
          transition={100}
        />
      </Pressable>
      <Pressable
        onPress={() => {
          setLanguageChangeModalVisible(true);
        }}
        className="items-center justify-center active:opacity-70 h-11 w-11"
      >
        <Image
          source={icons.globe}
          contentFit="contain"
          className="h-6 w-6"
          tintColor="#ffffff"
        />
      </Pressable>
      <Modal
        animationType="fade"
        transparent={true}
        visible={languageChangeModalVisible}
      >
        <View className="flex-1 items-center justify-center">
          <View className="bg-dark border border-grey-400 rounded-xl items-center space-y-2 pt-2 pb-4 px-4 w-72">
            <View className="flex-row justify-between items-center w-full">
              <CustomText classes="text-base text-white">
                {t.chooseLanguage}
              </CustomText>
              <Pressable
                onPress={() => setLanguageChangeModalVisible(false)}
                className="border border-gray-400 rounded-xl items-center justify-center active:border-primary ml-auto h-9 w-9"
              >
                <Image
                  source={icons.cross}
                  contentFit="contain"
                  className="h-5 w-5"
                  tintColor="#ffffff"
                />
              </Pressable>
            </View>
            <View className="rounded-xl justify-between items-center w-full">
              <Pressable
                onPress={() => {
                  changeLanguage("tm");
                  setLanguageChangeModalVisible(false);
                }}
                className="border border-gray-400 rounded-xl items-center justify-center active:border-primary h-12 w-full"
              >
                <CustomText classes="font-bsemibold text-base text-white">
                  Türkmen
                </CustomText>
              </Pressable>
              <Pressable
                onPress={() => {
                  changeLanguage("ru");
                  setLanguageChangeModalVisible(false);
                }}
                className="border border-gray-400 rounded-xl items-center justify-center mt-2 active:border-primary h-12 w-full"
              >
                <CustomText classes="font-bsemibold text-base text-white">
                  Русский
                </CustomText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
