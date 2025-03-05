import icons from "../../../../utils/icons";
import ProductsFilter from "../../../../components/functions/ProductsFilter";
import ProductContainer from "../../../../components/containers/ProductContainer";
import CountdownTimer from "../../../../components/functions/CountDown";
import { apiURL } from "../../../../utils/utils";
import { CustomText } from "../../../../utils/CustomText";
import { useFetcher } from "../../../../utils/utils";
import { LoadingLarge } from "../../../../utils/LoadingStates";
import { useLanguageStore } from "../../../../utils/languageStore";
import { useState, useEffect, useMemo } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import {
  View,
  RefreshControl,
  Pressable,
  FlatList,
  ScrollView,
  Dimensions,
} from "react-native";

export default function CategoryIdScreen() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [sortValue, setSortValue] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { id } = useLocalSearchParams();
  const { language, getTranslations } = useLanguageStore();
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
          categoryId: id,
          page: currentPage,
          limit: 12,
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

  const {
    data: response = {},
    error,
    isLoading,
  } = useFetcher(`${apiURL}/categories/fetch/client/${id}`);

  if (isLoading)
    return (
      <View className="bg-black pt-4 h-full">
        <LoadingLarge />
      </View>
    );
  if (error) return <></>;

  const { nameTm, nameRu, SubCategories, category } = response || [];

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

  const screenWidth = Dimensions.get("screen").width;
  const numColumns = screenWidth > 500 ? 3 : 2;

  const renderItem = ({ item }) => (
    <View
      key={item.id}
      className={`px-1 ${screenWidth < 500 ? "w-1/3" : "w-1/4"}`}
    >
      <ProductContainer productData={item} key={item.id} />
    </View>
  );

  return (
    <View className="bg-black px-2 h-full">
      {SubCategories?.length > 0 ? (
        <></>
      ) : (
        <View className="mt-2">
          <ProductsFilter onSortChange={handleSortChange} />
        </View>
      )}
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
        <View className="justify-center items-start grow">
          <>
            {category?.Discount?.isActive === true ? (
              <View className="bg-fullred rounded-3xl flex-row justify-center items-center px-4 h-10">
                <CustomText classes="font-bbitalic text-white text-base">
                  {t.timeLeftForSale}{" "}
                </CustomText>
                <CountdownTimer endDate={category?.Discount?.endDate} />
              </View>
            ) : (
              <CustomText classes="font-bbold text-white text-sm">
                {SubCategories?.length > 0 ? (
                  <>
                    {t.categories} / {language === "tm" ? nameTm : nameRu}
                  </>
                ) : (
                  <>{language === "tm" ? category?.nameTm : category?.nameRu}</>
                )}
              </CustomText>
            )}
          </>
        </View>
      </View>
      <>
        {SubCategories?.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap">
              {SubCategories?.map((item) => {
                return (
                  <Pressable
                    onPress={() =>
                      router.navigate(
                        `/(drawer)/(tabs)/categories/subcategories/${item.id}`
                      )
                    }
                    key={item.id}
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
                        item?.image
                          ? `${apiURL}/${item.image}`
                          : icons.placeholder
                      }
                      contentFit="cover"
                      className={`rounded-xl rounded-b-none w-full ${
                        screenWidth < 500 ? "h-40" : "h-48"
                      }`}
                      placeholder={icons.placeholder}
                      placeholderContentFit="cover"
                    />
                    <View className="bg-dark rounded-b-xl items-center justify-center py-1 min-h-[48px]">
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
        ) : (
          <>
            {initialLoading ? (
              <View className="mt-[50%]">
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
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                  />
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
          </>
        )}
      </>
    </View>
  );
}
