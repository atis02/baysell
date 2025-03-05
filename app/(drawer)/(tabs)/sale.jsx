import icons from "../../../utils/icons";
import ProductsFilter from "../../../components/functions/ProductsFilter";
import ProductContainer from "../../../components/containers/ProductContainer";
import { apiURL } from "../../../utils/utils";
import { CustomText } from "../../../utils/CustomText";
import { LoadingLarge } from "../../../utils/LoadingStates";
import { useLanguageStore } from "../../../utils/languageStore";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Pressable,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export default function SaleProductsScreen() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [sortValue, setSortValue] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();

  const fetchProducts = async (sortValue, currentPage) => {
    if (currentPage === 1) {
      setInitialLoading(true);
    }
    setRefreshing(currentPage !== 1);
    try {
      const response = await fetch(`${apiURL}/products/fetch/newclient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: currentPage,
          limit: 12,
          sortBy: sortValue === null ? "updatedAt" : "sellPrice",
          order: sortValue,
          hasDiscount: true,
        }),
      });
      const result = await response.json();
      if (result?.products) {
        if (currentPage === 1) {
          setData(result.products || []);
        } else {
          const combinedProducts = [...data, ...(result.products || [])];

          const uniqueProducts = Array.from(
            new Set(combinedProducts.map((product) => product.id))
          ).map((id) => combinedProducts.find((product) => product.id === id));

          setData(uniqueProducts);
        }
      }
      if (result?.products?.length < 12) {
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (currentPage === 1) {
        setInitialLoading(false);
      }
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts(sortValue, page);
  }, [sortValue, page]);

  const handleLoadMore = () => {
    if (hasMore && !refreshing) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchProducts(sortValue, 1);
  };

  const handleSortChange = (newSortValue) => {
    setSortValue(newSortValue);
    setPage(1);
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSortValue(null);
      };
    }, [])
  );

  const screenWidth = Dimensions.get("screen").width;
  const numColumns = screenWidth > 500 ? 3 : 2;

  const renderItem = ({ item }) => (
    <View className={`mb-2 px-1 ${screenWidth < 500 ? "w-1/3" : "w-1/4"}`}>
      <ProductContainer productData={item} />
    </View>
  );

  return (
    <View className="bg-black px-2 h-full">
      <View className="mt-2">
        <ProductsFilter onSortChange={handleSortChange} sortValue={sortValue} />
      </View>
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
          <CustomText classes="font-bbold text-white text-lg">
            {t.saleProducts}
          </CustomText>
        </View>
      </View>
      {initialLoading ? (
        <View className="mt-8">
          <LoadingLarge />
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={screenWidth < 500 ? 3 : 4}
          key={`columns-${numColumns}`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          windowSize={8}
          initialNumToRender={6}
          initialListSize={6}
          maxToRenderPerBatch={8}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{
            backgroundColor: "#070417",
            gap: 2,
          }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListFooterComponent={<View className="mb-2"></View>}
        />
      )}
    </View>
  );
}
