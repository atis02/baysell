import icons from "../../../../../utils/icons";
import ProductsFilter from "../../../../../components/functions/ProductsFilter";
import ProductContainer from "../../../../../components/containers/ProductContainer";
import CountdownTimer from "../../../../../components/functions/CountDown";
import { apiURL } from "../../../../../utils/utils";
import { CustomText } from "../../../../../utils/CustomText";
import { useLanguageStore } from "../../../../../utils/languageStore";
import { LoadingLarge } from "../../../../../utils/LoadingStates";
import { Image } from "expo-image";
import { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  FlatList,
  RefreshControl,
  Pressable,
  Dimensions,
} from "react-native";

export default function SubCategoryScreen() {
  const { id } = useLocalSearchParams();
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [sortValue, setSortValue] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();

  const fetchSubCatData = async (subCatId, sortValue, currentPage) => {
    if (currentPage === 1) {
      setInitialLoading(true);
    }
    setRefreshing(currentPage !== 1);

    try {
      const response = await fetch(`${apiURL}/subcategories/fetch/client/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          subCatId: subCatId,
          page: currentPage,
          limit: 12,
          sortBy: sortValue === null ? null : "sellPrice",
          order: sortValue,
        }),
      });

      const subCatData = await response.json();
      const fetchedProducts = subCatData?.result?.Products || [];

      if (fetchedProducts.length > 0) {
        if (currentPage === 1) {
          setData(subCatData.result);
          setProducts(fetchedProducts);
        } else {
          setProducts((prevProducts) => [...prevProducts, ...fetchedProducts]);
        }

        setHasMore(fetchedProducts.length === 12);
      } else {
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

  const handleLoadMore = () => {
    if (hasMore && !refreshing) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchSubCatData(id, sortValue, 1);
  };

  useEffect(() => {
    fetchSubCatData(id, sortValue, page);
  }, [id, sortValue, page]);

  const handleSortChange = (newSortValue) => {
    setSortValue(newSortValue);
    setPage(1);
  };

  const screenWidth = Dimensions.get("screen").width;
  const numColumns = screenWidth > 500 ? 3 : 2;

  const renderItem = ({ item }) => (
    <View className={`px-1 ${screenWidth < 500 ? "w-1/3" : "w-1/4"}`}>
      <ProductContainer productData={item} />
    </View>
  );

  return (
    <View className="bg-black h-full">
      <View className="mt-2">
        <ProductsFilter onSortChange={handleSortChange} />
      </View>
      {initialLoading ? (
        <View className="mt-8">
          <LoadingLarge />
        </View>
      ) : (
        <>
          <View className="flex-row items-center px-2 h-14">
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
                {data?.Discount?.isActive === true ? (
                  <View className="bg-fullred rounded-3xl flex-row justify-center items-center px-4 h-10">
                    <CustomText classes="font-bbitalic text-white text-base">
                      {t.timeLeftForSale}{" "}
                    </CustomText>
                    <CountdownTimer endDate={data?.Discount?.endDate} />
                  </View>
                ) : (
                  <CustomText
                    classes="font-bbold text-white text-sm w-full"
                    numberOfLines={2}
                  >
                    {t.categories}/
                    {language === "tm" ? (
                      <>
                        {data?.Category?.nameTm}/{data?.nameTm}
                      </>
                    ) : (
                      <>
                        {data?.Category?.nameRu}/{data?.nameRu}
                      </>
                    )}
                  </CustomText>
                )}
              </>
            </View>
          </View>
          {products?.length > 0 ? (
            <FlatList
              data={products}
              renderItem={renderItem}
              keyExtractor={(item) => item?.id}
              numColumns={screenWidth < 500 ? 3 : 4}
              key={`columns-${numColumns}`}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
              onEndReached={handleLoadMore}
              windowSize={16}
              initialNumToRender={12}
              initialListSize={12}
              maxToRenderPerBatch={9}
              onEndReachedThreshold={0.5}
              contentContainerStyle={{
                backgroundColor: "#070417",
                gap: 2,
              }}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              ListFooterComponent={<View className="mb-2"></View>}
            />
          ) : (
            <CustomText classes="text-white text-base px-2">
              {t.productsNotFound}
            </CustomText>
          )}
        </>
      )}
    </View>
  );
}
