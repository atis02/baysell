import Carousel from "react-native-reanimated-carousel";
import { LoadingLarge } from "../../utils/LoadingStates";
import { apiURL } from "../../utils/utils";
import { useFetcher } from "../../utils/utils";
import { Image as ExpoImage } from "expo-image";
import { Image, View, Dimensions, Pressable } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";

const screenWidth = Dimensions.get("screen").width;

export default function BannerSwiper() {
  const {
    data: response = [],
    error,
    isLoading,
  } = useFetcher(`${apiURL}/banners/active`);
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselHeight, setCarouselHeight] = useState(200);

  const banners = response?.banners || [];

  useEffect(() => {
    if (banners.length > 0) {
      const firstImageUri = `${apiURL}/${banners[0]?.posterImage}`;
      Image.getSize(
        firstImageUri,
        (width, height) => {
          const aspectRatio = height / width;
          setCarouselHeight(screenWidth * aspectRatio);
        },
        (error) => {
          console.error("Failed to get image size", error);
        }
      );
    }
  }, [banners]);

  if (isLoading) {
    return (
      <View className="items-center justify-center mt-2 h-[190px] w-full">
        <LoadingLarge />
      </View>
    );
  }

  if (error) return <></>;

  const handlePress = (banner) => {
    if (!banner?.url) {
      return;
    } else if (banner.categoryId === banner?.url) {
      router.navigate(`/categories/${banner.categoryId}`);
    } else if (banner.subCategoryId === banner?.url) {
      router.navigate(`/categories/subcategories/${banner.subCategoryId}`);
    } else if (banner.barcode === banner?.url) {
      router.navigate(`/product/${banner.barcode}`);
    }
  };

  return (
    <View className="rounded-xl items-center justify-center mt-2 h-fit w-full">
      <Carousel
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10],
        }}
        loop={banners?.length > 1}
        height={carouselHeight}
        width={screenWidth - 16}
        autoPlay={true}
        autoPlayInterval={5000}
        scrollAnimationDuration={500}
        data={banners}
        snapEnabled={true}
        defaultIndex={0}
        onSnapToItem={setActiveIndex}
        renderItem={({ index }) => (
          <Pressable onPress={() => handlePress(banners[index])}>
            <ExpoImage
              source={{
                uri: `${apiURL}/${banners[index]?.posterImage}`,
              }}
              contentFit="cover"
              className="border border-grey-600 rounded-xl h-full w-full"
            />
          </Pressable>
        )}
      />
      <View className="flex-row mt-2">
        {banners.map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginHorizontal: 4,
              backgroundColor: activeIndex === index ? "#be2617" : "#dcdcdc",
            }}
          />
        ))}
      </View>
    </View>
  );
}
