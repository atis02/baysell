import icons from "../../../utils/icons";
import BannerSwiper from "../../../components/containers/BannerSwiper";
import SearchBox from "../../../components/navigation/SearchBox";
import SimpleButtons from "../../../components/navigation/SimpleButtons";
import SaleProductsBox from "../../../components/containers/SaleProductsBox";
import ProductContainer from "../../../components/containers/ProductContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiURL } from "../../../utils/utils";
import { CustomText } from "../../../utils/CustomText";
import { useLanguageStore } from "../../../utils/languageStore";
import { router } from "expo-router";
import { useState, useCallback, useEffect, useRef } from "react";
import { Image } from "expo-image";
import {
  FlatList,
  RefreshControl,
  View,
  Dimensions,
  ActivityIndicator,
  Pressable,
} from "react-native";

export default function HomeScreen() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();
  const flatListRef = useRef(null);

  const fetchProducts = async (currentPage = 1) => {
    if (currentPage === 1) {
      setInitialLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const response = await fetch(`${apiURL}/products/fetch/newclient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: currentPage,
          limit: 12,
        }),
      });
      const result = await response.json();

      if (result?.products) {
        const newProducts = result.products;

        if (currentPage === 1) {
          setData(newProducts);
        } else {
          const uniqueProducts = Array.from(
            new Set([...data, ...newProducts].map((item) => item.id))
          ).map((id) =>
            [...data, ...newProducts].find((item) => item.id === id)
          );
          setData(uniqueProducts);
        }

        setHasMore(newProducts.length === 12);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  const sendVisitorRequest = async () => {
    try {
      const lastVisitDate = await AsyncStorage.getItem("lastVisitDate");
      const today = new Date().toISOString().split("T")[0];

      if (lastVisitDate === today) {
        await fetch(`${apiURL}/user/visitors/new`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ boolean: false }),
        });
      } else {
        await fetch(`${apiURL}/user/visitors/new`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ boolean: true }),
        });

        await AsyncStorage.setItem("lastVisitDate", today);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts(1);
    sendVisitorRequest();
  }, []);

  const handleLoadMore = () => {
    if (hasMore && !refreshing) {
      setPage((prevPage) => prevPage + 1);
      fetchProducts(page + 1);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchProducts(1);
  };

  const handleBackToTop = () => {
    flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
  };

  const screenWidth = Dimensions.get("screen").width;
  const numColumns = screenWidth > 500 ? 3 : 2;

  const renderItem = useCallback(
    ({ item }) => (
      <View className={`mb-2 px-1 ${screenWidth < 500 ? "w-1/3" : "w-1/4"}`}>
        <ProductContainer productData={item} />
      </View>
    ),
    [screenWidth]
  );

  return (
    <View className="bg-black h-full">
      {initialLoading ? (
        <>
          <View className="items-center justify-center h-full">
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        </>
      ) : (
        <FlatList
          ref={flatListRef}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={screenWidth < 500 ? 3 : 4}
          key={`columns-${numColumns}`}
          ListHeaderComponent={
            <View>
              <BannerSwiper />
              <SearchBox />
              <SimpleButtons />
              <SaleProductsBox isRefreshing={refreshing} />
              <View className="mt-2 px-2 pb-2 w-full">
                <View className="flex-row items-center justify-between h-10 w-full">
                  <CustomText classes="text-lg text-white font-bsemibold">
                    {t.allProducts}
                  </CustomText>
                  <CustomText
                    onPress={() => router.navigate("/products")}
                    classes="text-xs text-white active:opacity-80"
                  >
                    {t.showAll}
                  </CustomText>
                </View>
              </View>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={6}
          windowSize={8}
          maxToRenderPerBatch={8}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            backgroundColor: "#070417",
            paddingHorizontal: 8,
          }}
        />
      )}
      <Pressable
        onPress={handleBackToTop}
        className="bg-dark border border-grey-600 rounded-full absolute right-5 bottom-5 justify-center items-center h-12 w-12 z-10"
      >
        <Image
          source={icons.upTo}
          contentFit="contain"
          className="h-6 w-6"
          tintColor="#ffffff"
        />
      </Pressable>
    </View>
  );
}
