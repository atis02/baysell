import icons from "../../../utils/icons";
import { apiURL } from "../../../utils/utils";
import { useLanguageStore } from "../../../utils/languageStore";
import { CustomText } from "../../../utils/CustomText";
import { LoadingLarge } from "../../../utils/LoadingStates";
import { useFetcher } from "../../../utils/utils";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { View, ScrollView, Pressable, RefreshControl } from "react-native";

export default function AboutScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();

  const {
    data: response = {},
    error,
    isLoading,
    mutate,
  } = useFetcher(`${apiURL}/info/get`);

  const onRefresh = () => {
    setRefreshing(true);
    mutate()
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  };

  if (isLoading)
    return (
      <View className="bg-black pt-4 h-full">
        <LoadingLarge />
      </View>
    );
  if (error) return <></>;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="bg-black px-2"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="flex-row items-center h-14">
        <Pressable
          onPress={() => router.back()}
          className="bg-grey-700 rounded-full items-center justify-center active:bg-grey-500 mr-2 h-10 w-10"
        >
          <Image
            source={icons.back}
            contentFit="contain"
            className="h-6 w-6"
            tintColor="#ffffff"
          />
        </Pressable>
        <View className="justify-center items-start">
          <CustomText classes="font-bbold text-primary text-lg">
            {t.about}
          </CustomText>
        </View>
      </View>
      <View className="bg-dark rounded-xl p-2">
        <CustomText classes="text-white" numberOfLines={300}>
          {language === "tm" ? response?.aboutTm : response?.aboutRu}
        </CustomText>
      </View>
      <View className="mb-4"></View>
    </ScrollView>
  );
}
