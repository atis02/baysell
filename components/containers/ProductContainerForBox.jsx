import icons from "../../utils/icons";
import { apiURL } from "../../utils/utils";
import { CustomText } from "../../utils/CustomText";
import { AddToWishlistForBox } from "../functions/AddToWishlistForBox";
import { useLanguageStore } from "../../utils/languageStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import { View, Pressable, Dimensions } from "react-native";

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
    <View
      className={`flex-row items-center ${
        hasDiscount ? "justify-between" : "justify-center"
      } w-full`}
    >
      <CustomText classes="text-base text-primary font-bbold">
        {discountedPrice} M
      </CustomText>
      {hasDiscount && (
        <CustomText classes="text-base text-gray-400 font-bbold line-through">
          {originalPrice}M
        </CustomText>
      )}
    </View>
  );
};

export default function ProductContainerForBox({ productData }) {
  const screenWidth = Dimensions.get("screen").width;
  const { language } = useLanguageStore();

  const imageUrl = productData?.images?.[0]?.url
    ? `${apiURL}/${productData.images[0].url}`
    : null;

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

  return (
    <View
      className={`border border-grey-600 rounded-xl relative mr-2 ${
        screenWidth < 500 ? "w-[152px]" : "w-[170px]"
      }`}
    >
      <Pressable
        onPress={() => router.push(`/product/${productData?.barcode}`)}
        className="rounded-xl flex flex-col h-fit"
      >
        <View className="relative">
          {productData?.Discount?.value > 0 ? (
            <View className="bg-primary rounded-xl items-center justify-center absolute top-[2px] left-[2px] h-8 px-1 z-10">
              <CustomText classes="text-[10px] text-white font-bbold">
                -
                {calculateDiscountPercentage(
                  parseFloat(productData.sellPrice),
                  productData.Discount
                )}
                %
              </CustomText>
            </View>
          ) : (
            <>
              {productData?.Status?.id === 2 ? (
                <View className="absolute bg-primary rounded-tl-xl rounded-br-xl p-1 z-10">
                  <CustomText classes="text-xs text-white font-bitalic">
                    {language === "tm"
                      ? productData?.Status?.nameTm
                      : productData?.Status?.nameRu}
                  </CustomText>
                </View>
              ) : (
                <></>
              )}
            </>
          )}
          <Image
            source={imageUrl || icons.placeholder}
            contentFit="cover"
            className="rounded-t-xl h-48"
            transition={50}
            placeholder={icons.placeholder}
            placeholderContentFit="cover"
          />
          <AddToWishlistForBox product={productData} />
        </View>
        <View className="bg-dark rounded-b-xl px-2 py-1">
          <PriceDisplay productData={productData} />
          <View className="flex-row items-center justify-center content-center flex-wrap px-2 h-11">
            {productData?.ProductSizes?.filter((item) => item.quantity > 0).map(
              (item, index, filteredArray) => {
                const isLast = index === filteredArray.length - 1;
                return (
                  <CustomText
                    key={index}
                    classes="text-base text-center text-white font-bbold"
                    numberOfLines={2}
                  >
                    {item.Size?.value}
                    {!isLast && ","}{" "}
                  </CustomText>
                );
              }
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
}
