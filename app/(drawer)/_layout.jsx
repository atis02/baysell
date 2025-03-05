import icons from "../../utils/icons";
import { apiURL } from "../../utils/utils";
import { CustomText } from "../../utils/CustomText";
import { useLanguageStore } from "../../utils/languageStore";
import { LoadingLarge } from "../../utils/LoadingStates";
import { useState } from "react";
import { useFetcher } from "../../utils/utils";
import { Image } from "expo-image";
import { Pressable, Linking, View, Modal } from "react-native";
import { Drawer } from "expo-router/drawer";
import { router, usePathname } from "expo-router";
import { DrawerContentScrollView } from "@react-navigation/drawer";

const DrawerButton = ({ name, icon, focused, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      className={`border-b flex-row items-center active:opacity-80 mb-1 px-2 min-h-[44px] h-fit w-full ${
        focused ? "border-primary" : "border-grey-400"
      }`}
    >
      {icon && (
        <Image
          source={icon}
          tintColor={focused ? "#be2617" : "#ffffff"}
          className="mr-2 h-5 w-5"
        />
      )}
      <CustomText
        classes={focused ? "text-primary" : "text-white max-w-[200px]"}
        numberOfLines={12}
      >
        {name}
      </CustomText>
    </Pressable>
  );
};

const CustomDrawerContent = () => {
  const [languageChangeModalVisible, setLanguageChangeModalVisible] =
    useState(false);
  const pathname = usePathname();
  const { language, getTranslations, changeLanguage } = useLanguageStore();
  const t = getTranslations();

  const {
    data: response = {},
    error,
    isLoading,
  } = useFetcher(`${apiURL}/info/get`);

  if (isLoading)
    return (
      <View className="bg-black pt-4 h-full">
        <LoadingLarge />
      </View>
    );
  if (error) return <></>;

  return (
    <DrawerContentScrollView
      contentContainerStyle={{ flex: 1 }}
      style={{
        backgroundColor: "#212125",
        paddingHorizontal: 8,
      }}
    >
      <Pressable
        onPress={() => router.navigate("/")}
        className="flex-row items-center justify-center h-24 w-full"
      >
        <Image
          source={icons.defaultLogo}
          contentFit="contain"
          className="h-24 w-24"
        />
      </Pressable>
      <DrawerButton
        name={t.about}
        icon={icons.info}
        focused={pathname === "/about"}
        onPress={() => router.navigate("/(drawer)/(tabs)/about")}
      />
      <DrawerButton
        name={t.usage}
        icon={icons.document}
        focused={pathname === "/usage"}
        onPress={() => router.navigate("/(drawer)/(tabs)/usage")}
      />
      <DrawerButton
        name={t.call}
        icon={icons.phone}
        onPress={() => {
          const phoneNumber = response?.contactNumber;
          Linking.openURL(`tel:${phoneNumber}`);
        }}
      />
      <DrawerButton
        name={t.write}
        icon={icons.message}
        onPress={() => {
          const phoneNumber = response?.contactNumber;
          Linking.openURL(`sms:${phoneNumber}`);
        }}
      />
      <DrawerButton
        name={t.chooseLanguage}
        icon={icons.globe}
        onPress={() => {
          setLanguageChangeModalVisible(true);
        }}
      />
      <DrawerButton
        name="@bayselshop"
        icon={icons.instagram}
        onPress={() => {
          const url = response?.instagramFirst;
          Linking.openURL(url);
        }}
      />
      <DrawerButton
        name="@baysel_store"
        icon={icons.instagram}
        onPress={() => {
          const url = response?.instagramSecond;
          Linking.openURL(url);
        }}
      />
      <DrawerButton
        name="@bayselshop"
        icon={icons.tiktok}
        onPress={() => {
          const url = response?.tiktok;
          Linking.openURL(url);
        }}
      />
      <DrawerButton
        name={language === "tm" ? response?.addressTm : response?.addressRu}
        icon={icons.mapMark}
      />
      <View className="items-center justify-center mt-auto">
        <Pressable
          onPress={() => {
            const url = "https://alemtilsimat.com/";
            Linking.openURL(url);
          }}
          className="flex-row items-center active:opacity-50"
        >
          <CustomText classes="text-white">{t.version} 1.11</CustomText>
        </Pressable>
      </View>
      <View className="items-center justify-center mb-4">
        <Pressable
          onPress={() => {
            const url = "https://alemtilsimat.com/";
            Linking.openURL(url);
          }}
          className="flex-row items-center active:opacity-50"
        >
          <CustomText classes="text-white">
            Powered by{" "}
            <CustomText classes="font-bsemibold text-primary">
              Älem Tilsimat
            </CustomText>
          </CustomText>
        </Pressable>
      </View>
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
    </DrawerContentScrollView>
  );
};

export default () => {
  return (
    <Drawer
      drawerContent={() => <CustomDrawerContent />}
      screenOptions={{ headerShown: false }}
    />
  );
};
