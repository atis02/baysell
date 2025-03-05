import icons from "../../../../utils/icons";
import SearchBox from "../../../../components/navigation/SearchBox";
import ProductsFilter from "../../../../components/functions/ProductsFilter";
import ProductContainer from "../../../../components/containers/ProductContainer";
import { apiURL } from "../../../../utils/utils";
import { CustomText } from "../../../../utils/CustomText";
import { useLanguageStore } from "../../../../utils/languageStore";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import {
  View,
  FlatList,
  RefreshControl,
  Pressable,
  Dimensions,
} from "react-native";
import { useState, useEffect } from "react";

export default function SearchScreen() {
  const { searchquery } = useLocalSearchParams();
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [sortValue, setSortValue] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();

  const fetchData = async (query, sortValue, currentPage) => {
    setRefreshing(true);

    try {
      const response = await fetch(`${apiURL}/products/fetch/newclient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          page: currentPage,
          limit: 500,
          sortBy: sortValue === null ? null : "sellPrice",
          order: sortValue,
        }),
      });

      const result = await response.json();

      if (currentPage === 1) {
        setProducts(result?.products || []);
      } else {
        setProducts((prevProducts) => [
          ...prevProducts,
          ...(result?.products || []),
        ]);
      }

      if (result?.products) {
        const newProducts = result.products;

        if (currentPage === 1) {
          setProducts(newProducts);
        } else {
          const uniqueProducts = Array.from(
            new Set([...products, ...newProducts].map((item) => item.id))
          ).map((id) =>
            [...products, ...newProducts].find((item) => item.id === id)
          );

          setProducts(uniqueProducts);
        }

        setHasMore(newProducts.length === 500);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(searchquery, sortValue, page);
  }, [searchquery, sortValue, page]);

  const handleLoadMore = () => {
    if (hasMore && !refreshing) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleRefresh = () => {
    setPage(1);
  };

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
    <View className="bg-black px-2 h-full">
      <SearchBox />
      <View className="mt-2">
        <ProductsFilter onSortChange={handleSortChange} />
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
            {t.search}
          </CustomText>
        </View>
      </View>
      {products.length > 0 ? (
        <>
          <CustomText
            classes="text-white text-base mb-2 h-fit w-fit"
            numberOfLines={2}
          >
            {t.searchResults}
            <CustomText classes="text-white text-base font-bbold">
              {searchquery}
            </CustomText>
          </CustomText>
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
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
        </>
      ) : (
        <CustomText classes="text-white text-base h-14 w-fit" numberOfLines={2}>
          {t.noSearchResults}
          <CustomText classes="text-white font-bbold">{searchquery}</CustomText>
        </CustomText>
      )}
    </View>
  );
}
