import icons from "../../utils/icons";
import ProductContainerForBox from "./ProductContainerForBox";
import { apiURL } from "../../utils/utils";
import { CustomText } from "../../utils/CustomText";
import { LoadingLarge } from "../../utils/LoadingStates";
import { useLanguageStore } from "../../utils/languageStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { View, ScrollView, Pressable } from "react-native";

export default function SimilarProductsBox({ isRefreshing, subCatId, catId }) {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiURL}/products/fetch/newclient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: 1,
          limit: 10,
          subCategoryId: subCatId,
          categoryId: catId,
        }),
      });
      const data = await response.json();
      setData(data?.products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [isRefreshing, subCatId, catId]);

  const handleNavigation = (subCat, cat) => {
    if (subCat) {
      router.push(`/categories/subcategories/${subCat}`);
    } else if (cat) {
      router.push(`/categories/${cat}`);
    } else {
      router.navigate("/");
    }
  };

  return (
    <>
      {data?.length > 0 ? (
        <View className="mt-2 px-2 pb-2 w-full">
          <View className="flex-row items-center justify-between h-10 w-full">
            <CustomText classes="text-lg text-white font-bsemibold">
              {t.similarProducts}
            </CustomText>
          </View>
          <View>
            {isLoading ? (
              <View className="justify-center items-center h-28">
                <LoadingLarge />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  alignItems: "center",
                }}
                className="flex-row"
              >
                {data?.map((item, index) => {
                  return (
                    <ProductContainerForBox
                      key={`${item.id}-${index}-${isRefreshing}`}
                      productData={item}
                    />
                  );
                })}
                <Pressable
                  onPress={() => handleNavigation(subCatId, catId)}
                  className="flex-row items-center justify-center active:opacity-50 h-10 w-[152px]"
                >
                  <CustomText classes="text-white mr-2">{t.showAll}</CustomText>
                  <Image
                    source={icons.forward}
                    contentFit="contain"
                    className="h-5 w-5"
                    transition={100}
                    tintColor="#ffffff"
                  />
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      ) : (
        <></>
      )}
    </>
  );
}
