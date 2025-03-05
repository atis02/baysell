import icons from "../../../../utils/icons";
import Carousel from "react-native-reanimated-carousel";
import SimilarProductsBox from "../../../../components/containers/SimilarProductsBox";
import ZoomImage from "../../../../components/containers/ZoomImage";
import CountdownTimer from "../../../../components/functions/CountDown";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { apiURL } from "../../../../utils/utils";
import { CustomText } from "../../../../utils/CustomText";
import { AddToWishlist } from "../../../../components/functions/AddToWishlist";
import { LoadingLarge } from "../../../../utils/LoadingStates";
import { useCustomerStore } from "../../../../utils/customerStore";
import { useLanguageStore } from "../../../../utils/languageStore";
import { throwToast } from "../../../../components/functions/ThrowToast";
import { useFetcher } from "../../../../utils/utils";
import { useState, useCallback } from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import {
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
  Dimensions,
  Modal,
} from "react-native";

const calculateDiscountPercentage = (originalPrice, discount) => {
  if (!discount || parseFloat(discount.value) <= 0) return 0;

  let discountedPrice;
  if (discount.type === "PERCENTAGE") {
    return parseFloat(discount.value);
  } else {
    if (discount.isActive) {
      discountedPrice = originalPrice - parseFloat(discount.value);
    } else {
      discountedPrice = parseFloat(discount.value);
    }
    const difference = originalPrice - discountedPrice;
    return Math.round((difference / originalPrice) * 100);
  }
};

const PriceDisplay = ({ productData }) => {
  const calculatePrice = (originalPrice, discount) => {
    if (!discount || parseFloat(discount.value) <= 0) {
      return originalPrice;
    }

    if (discount.type === "PERCENTAGE") {
      const discountAmount = (parseFloat(discount.value) / 100) * originalPrice;
      return originalPrice - discountAmount;
    } else if (discount.isActive === false) {
      return parseFloat(discount.value);
    } else if (discount.type === "FIXED" && discount.isActive === true) {
      const discountedPrice = originalPrice - parseFloat(discount.value);
      return discountedPrice;
    } else {
      return parseFloat(discount.value);
    }
  };

  const originalPrice = parseFloat(productData?.sellPrice);
  const discountedPrice = calculatePrice(originalPrice, productData?.Discount);
  const hasDiscount =
    productData?.Discount && parseFloat(productData.Discount.value) > 0;

  return (
    <View className="flex-row items-center justify-between grow mr-4">
      <CustomText classes="text-lg text-primary font-bbold">
        {discountedPrice} M
      </CustomText>
      {hasDiscount && (
        <CustomText classes="text-lg text-gray-400 font-bbold line-through">
          {originalPrice}M
        </CustomText>
      )}
    </View>
  );
};

export default function ProductScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [zoomImageModal, setZoomImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(1);
  const { shoppingCart, addToShoppingCart } = useCustomerStore();
  const { barcode } = useLocalSearchParams();
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();

  useFocusEffect(
    useCallback(() => {
      setSelectedSize(null);

      return () => {
        setSelectedSize(null);
      };
    }, [barcode])
  );

  const { data: sizeTypes = [] } = useFetcher(`${apiURL}/sizetypes/fetch/all`);

  const {
    data: productData = [],
    error,
    isLoading,
    mutate,
  } = useFetcher(`${apiURL}/products/fetch/new/${barcode}`);

  const onRefresh = () => {
    setRefreshing(true);
    setSelectedSize(null);
    mutate()
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  };

  if (isLoading)
    return (
      <View className="bg-black pt-[50%] h-full">
        <LoadingLarge />
      </View>
    );
  if (error) return <></>;

  const productInCart = shoppingCart?.find(
    (item) => item.uniqueId === `${barcode}-${selectedSize}`
  );

  const handleAddToCart = () => {
    if (selectedSize === null) {
      Alert.alert(t.noSize, t.chooseSize);
      return;
    } else {
      const productWithSelectedSize = {
        ...productData,
        selectedSize: productData?.ProductSizes?.find(
          (size) => size?.Size?.id === selectedSize
        )?.Size,
      };

      const uniqueId = `${productWithSelectedSize?.barcode}-${productWithSelectedSize?.selectedSize.id}`;
      addToShoppingCart({ ...productWithSelectedSize, uniqueId });
      throwToast(t.productAdded);
    }
  };

  const screenWidth = Dimensions.get("screen").width;

  return (
    <View className="relative bg-black">
      <View className="flex-row items-center px-4 h-16">
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
        {productData?.Discount?.endDate && (
          <View className="bg-fullred rounded-3xl flex-row justify-center items-center h-10 grow">
            <CustomText classes="font-bbitalic text-white text-base">
              {t.timeLeftForSale}{" "}
            </CustomText>
            <CountdownTimer endDate={productData.Discount.endDate} />
          </View>
        )}
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="bg-black px-2 mb-12"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        nestedScrollEnabled={true}
      >
        <View>
          <View className="items-center w-full">
            <Carousel
              panGestureHandlerProps={{
                activeOffsetX: [-10, 10],
              }}
              loop={productData?.images?.length > 1 ? true : false}
              height={
                screenWidth < 500
                  ? 500
                  : screenWidth >= 500 && screenWidth < 600
                  ? 700
                  : 700
              }
              width={screenWidth - 32}
              autoPlay={productData?.images?.length > 1 ? true : false}
              autoPlayInterval={5000}
              scrollAnimationDuration={500}
              data={productData?.images}
              snapEnabled={true}
              onSnapToItem={setActiveIndex}
              defaultIndex={0}
              renderItem={({ index }) => (
                <View className="rounded-t-2xl">
                  <View className="rounded-t-2xl relative w-full z-10">
                    {productData?.Status?.id === 2 ? (
                      <View className="bg-fullred rounded-tl-xl rounded-br-xl flex-row items-center justify-center absolute top-0 left-0 px-2 h-10">
                        <CustomText classes="text-white font-bbitalic">
                          {productData?.Status?.id === 1 ? (
                            <></>
                          ) : language === "tm" ? (
                            productData?.Status?.nameTm
                          ) : (
                            productData?.Status?.nameRu
                          )}
                        </CustomText>
                      </View>
                    ) : (
                      <></>
                    )}
                    {productData?.Discount?.value > 0 && (
                      <View className="bg-fullred rounded-tl-xl rounded-br-xl items-center justify-center absolute top-0 left-0 px-4 min-h-[40px] min-w-[80px] z-10">
                        <CustomText classes="text-white font-bbitalic">
                          -
                          {calculateDiscountPercentage(
                            parseFloat(productData.sellPrice),
                            productData.Discount
                          )}
                          %
                        </CustomText>
                      </View>
                    )}
                    <Pressable
                      onPress={() => {
                        setZoomImageModal(true);
                        setCurrentImage(index);
                      }}
                      className="bg-grey-600 rounded-bl-xl rounded-tr-xl flex-row items-center justify-center active:opacity-70 absolute right-0 px-4 h-10 z-10"
                    >
                      <Image
                        source={icons.zoom}
                        contentFit="contain"
                        className="h-6 w-6"
                        tintColor="#ffffff"
                      />
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={() => {
                      setZoomImageModal(true);
                      setCurrentImage(index);
                    }}
                    className="rounded-t-2xl"
                  >
                    <Image
                      source={
                        productData?.images[index]?.url
                          ? {
                              uri: `${apiURL}/${productData?.images[index]?.url}`,
                            }
                          : icons.placeholder
                      }
                      contentFit="cover"
                      className={`rounded-t-2xl w-full ${
                        screenWidth < 400
                          ? "h-[500px]"
                          : screenWidth >= 400 && screenWidth < 600
                          ? "h-[600px]"
                          : "h-[900px]"
                      }`}
                      transition={0}
                      placeholder={icons.placeholder}
                      placeholderContentFit="cover"
                    />
                  </Pressable>
                </View>
              )}
            />
            <View className="flex-row mt-2">
              {productData?.images?.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    marginHorizontal: 4,
                    backgroundColor:
                      activeIndex === index ? "#be2617" : "#dcdcdc",
                  }}
                />
              ))}
            </View>
          </View>
          <View className="flex-row items-center justify-between px-2 min-h-[44px]">
            <CustomText
              classes="text-lg text-primary font-bbold max-w-[350px]"
              numberOfLines={8}
            >
              {language === "tm" ? productData?.nameTm : productData?.nameRu}
            </CustomText>
            <AddToWishlist product={productData} />
          </View>
          <CustomText classes="text-base text-white px-2 h-6">
            {t.barcode} : {productData?.article}
          </CustomText>
          {productData?.SizeFit ? (
            <View className="flex-row items-center px-2 w-full">
              <Image
                source={icons.defaultLogo}
                contentFit="contain"
                className="mr-2 h-8 w-8"
              />
              <CustomText classes="text-white mr-2">
                {language === "tm"
                  ? productData?.SizeFit?.nameTm
                  : productData?.SizeFit?.nameRu}
              </CustomText>
              <Image
                source={icons.info}
                contentFit="contain"
                className="h-4 w-4"
                tintColor="#ffffff"
              />
            </View>
          ) : (
            <></>
          )}
          {productData?.descriptionTm || productData?.descriptionRu ? (
            <View className="bg-dark rounded-xl p-2 mt-2">
              <CustomText classes="text-base text-white" numberOfLines={100}>
                {language === "tm"
                  ? productData?.descriptionTm
                  : productData?.descriptionRu}
              </CustomText>
            </View>
          ) : (
            <></>
          )}
          <View className="flex-row items-center flex-wrap justify-start pl-1 mt-2">
            {sizeTypes?.sizeTypes
              ?.find((type) => type.id === productData?.SizeType?.id)
              ?.Sizes.map((size) => {
                const availableSize = productData?.ProductSizes.find(
                  (item) => item.Size?.id === size.id && item.quantity >= 1
                );
                const isAvailable = Boolean(availableSize);
                return (
                  <View className="p-1 w-1/8" key={size.id}>
                    <Pressable
                      disabled={!isAvailable}
                      onPress={() => isAvailable && setSelectedSize(size.id)}
                      className={`border rounded-lg flex flex-row justify-center items-center px-2 h-10 min-w-[56px] ${
                        selectedSize === size.id && isAvailable
                          ? "border-primary bg-primary"
                          : "border-white bg-dark"
                      } ${!isAvailable ? "opacity-50" : ""}`}
                    >
                      <CustomText
                        classes={`${
                          selectedSize === size.id && isAvailable
                            ? "text-white"
                            : "text-white"
                        } ${!isAvailable ? "line-through" : ""}`}
                      >
                        {size.value}
                      </CustomText>
                    </Pressable>
                  </View>
                );
              })}
          </View>
          <SimilarProductsBox
            isRefreshing={refreshing}
            subCatId={
              productData?.subCategoryId ? productData?.subCategoryId : null
            }
            catId={productData?.categoryId ? productData?.categoryId : null}
          />
          <View className="mb-20"></View>
        </View>
      </ScrollView>
      <View className="bg-dark rounded-t-3xl flex-row items-center justify-between absolute bottom-14 py-2 px-4">
        <PriceDisplay productData={productData} />
        <View className="w-36">
          {productInCart ? (
            <View className="border-primary bg-grey-600 rounded-xl flex flex-row justify-center items-center px-2 h-12 grow">
              <Image
                source={icons.check}
                contentFit="contain"
                className="mr-2 h-5 w-5"
                tintColor="#ffffff"
              />
              <CustomText classes="text-white font-bbold">
                {t.inCart}
              </CustomText>
            </View>
          ) : (
            <Pressable
              onPress={handleAddToCart}
              className="bg-primary rounded-xl flex flex-row justify-center items-center active:bg-primary-800 h-12 grow"
            >
              <Image
                source={icons.cartPlus}
                contentFit="contain"
                className="mr-2 h-5 w-5"
                tintColor="#ffffff"
              />
              <CustomText classes="text-white font-bbold">
                {t.addToCart}
              </CustomText>
            </Pressable>
          )}
        </View>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={zoomImageModal}
        onRequestClose={() => setZoomImageModal(false)}
      >
        <GestureHandlerRootView>
          <Pressable
            onPress={() => {
              setZoomImageModal(false);
            }}
            className="bg-black flex-1 items-center justify-center"
          >
            <ZoomImage
              imageUrl={`${apiURL}/${productData?.images[currentImage]?.url}`}
              onPress={() => setZoomImageModal(false)}
            />
          </Pressable>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}
