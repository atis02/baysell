import ProductContainer from "./ProductContainer";
import { apiURL } from "../../utils/utils";
import { CustomText } from "../../utils/CustomText";
import { LoadingLarge } from "../../utils/LoadingStates";
import { useLanguageStore } from "../../utils/languageStore";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { View } from "react-native";

export default function AllProducts({ isRefreshing }) {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${apiURL}/products/fetch/newclient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: 1,
          limit: 20,
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
  }, [isRefreshing]);

  return (
    <View className="mt-2 px-2 pb-2 w-full">
      <View className="flex-row items-center justify-between h-10 w-full">
        <CustomText classes="text-lg text-white font-bsemibold">
          {t.allProducts}
        </CustomText>
        <CustomText
          onPress={() => router.navigate("/products")}
          classes="text-xs text-white active:opacity-70"
        >
          {t.showAll}
        </CustomText>
      </View>
      <View>
        {isLoading ? (
          <View className="justify-center items-center h-28">
            <LoadingLarge />
          </View>
        ) : (
          <View className="flex-row flex-wrap items-center justify-between">
            {data?.map((item) => {
              return (
                <View key={item.id} className="mb-2 px-1 w-1/2">
                  <ProductContainer key={item.id} productData={item} />
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
