import icons from "../../../../utils/icons";
import { apiURL } from "../../../../utils/utils";
import { CustomText } from "../../../../utils/CustomText";
import { useLanguageStore } from "../../../../utils/languageStore";
import { LoadingLarge } from "../../../../utils/LoadingStates";
import { useState } from "react";
import { useFetcher } from "../../../../utils/utils";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  Dimensions,
} from "react-native";

export default function CategoriesScreen() {
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();

  const {
    data: response = [],
    error,
    isLoading,
    mutate,
  } = useFetcher(`${apiURL}/categories/fetch/client`);

  const [refreshing, setRefreshing] = useState(false);

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

  const screenWidth = Dimensions.get("screen").width;

  return (
    <ScrollView
      className="bg-black p-2"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <CustomText classes="text-center text-white text-lg font-bbold">
        {t.categories}
      </CustomText>
      <View className="flex-row flex-wrap items-center">
        {response?.categories?.map((item, index) => {
          return (
            <Pressable
              onPress={() =>
                router.navigate(`/(drawer)/(tabs)/categories/${item.id}`)
              }
              key={index}
              className={`p-1 ${
                screenWidth < 500
                  ? "w-1/3"
                  : screenWidth >= 500 && screenWidth < 600
                  ? "w-1/4"
                  : "w-1/5"
              }`}
            >
              <Image
                source={
                  item?.image ? `${apiURL}/${item.image}` : icons.placeholder
                }
                contentFit="cover"
                className={`rounded-xl rounded-b-none w-full ${
                  screenWidth < 500 ? "h-32" : "h-48"
                }`}
                placeholder={icons.placeholder}
                placeholderContentFit="cover"
              />
              <View className="bg-dark rounded-b-xl items-center justify-center content-center h-11">
                <CustomText
                  classes="font-bsemibold text-center text-white"
                  numberOfLines={2}
                >
                  {language === "tm" ? item.nameTm : item.nameRu}
                </CustomText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
