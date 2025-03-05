import icons from "../../utils/icons";
import { CustomText } from "../../utils/CustomText";
import { useLanguageStore } from "../../utils/languageStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import { View, Pressable } from "react-native";

export default function SimpleButtons() {
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();

  return (
    <View className="rounded-xl flex-row items-center justify-between space-x-1 mt-2 w-full">
      <View className="w-[32%]">
        <Pressable
          onPress={() => router.navigate("/products")}
          className="bg-grey-600 rounded-xl items-center justify-between active:bg-grey-600/80 p-2 h-fit"
        >
          <View className="items-center justify-center h-16 w-16">
            <Image
              source={icons.bag}
              contentFit="contain"
              className="h-16 w-16"
              transition={100}
            />
          </View>
          <View className="items-center h-9 w-full">
            <CustomText classes="text-white" numberOfLines={2}>
              {t.allProducts}
            </CustomText>
          </View>
        </Pressable>
      </View>
      <View className="w-[32%]">
        <Pressable
          onPress={() => router.navigate("/newproducts")}
          className="bg-grey-600 rounded-xl items-center justify-between active:bg-grey-600/80 p-2 h-fit"
        >
          <View className="items-center justify-center h-16 w-16">
            <Image
              source={icons.newStuff}
              contentFit="contain"
              className="h-14 w-14"
              transition={100}
            />
          </View>
          <View className="items-center h-9 w-full">
            <CustomText classes="text-start text-white" numberOfLines={2}>
              {t.newProducts}
            </CustomText>
          </View>
        </Pressable>
      </View>
      <View className="w-[32%]">
        <Pressable
          onPress={() => router.navigate("/sale")}
          className="bg-grey-600 rounded-xl items-center justify-between active:bg-grey-600/80 p-2 h-fit"
        >
          <View className="items-center justify-center h-16 w-16">
            <Image
              source={icons.saleStuff}
              contentFit="contain"
              className="h-14 w-14"
              transition={100}
            />
          </View>
          <View className="items-center h-9 w-full">
            <CustomText classes="text-white" numberOfLines={2}>
              {t.saleProducts}
            </CustomText>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
