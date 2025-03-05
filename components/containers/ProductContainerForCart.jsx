import icons from "../../utils/icons";
import { CustomText } from "../../utils/CustomText";
import { apiURL } from "../../utils/utils";
import { useCustomerStore } from "../../utils/customerStore";
import { useLanguageStore } from "../../utils/languageStore";
import { throwToast } from "../functions/ThrowToast";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import { View, Pressable, Modal } from "react-native";

export default function ProductContainerForCart({ product }) {
  const {
    uniqueId,
    barcode,
    article,
    sellPrice,
    images,
    Discount,
    quantity: initialQuantity,
  } = product;

  const [productDeleteModal, setConfirmProductDeleteModal] = useState(false);
  const { shoppingCart, setShoppingCartQuantity, removeFromShoppingCart } =
    useCustomerStore();
  const [quantity, setQuantity] = useState(initialQuantity);
  useCustomerStore();
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();

  useEffect(() => {
    const cartItem = shoppingCart?.find((item) => item?.uniqueId === uniqueId);
    if (cartItem) {
      setQuantity(cartItem?.quantity);
    }
  }, [shoppingCart]);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      removeFromShoppingCart(uniqueId);
      throwToast(t.productRemoved);
    } else {
      setShoppingCartQuantity(uniqueId, Number(newQuantity));
      setQuantity(Number(newQuantity));
      throwToast(t.quantityChanged);
    }
  };

  const increaseQuantity = () => {
    const newQuantity = quantity + 1;
    handleQuantityChange(newQuantity);
  };

  const handleRemoveProduct = () => {
    setConfirmProductDeleteModal(true);
  };

  const imageUrl = images?.[0]?.url ? `${apiURL}/${images[0].url}` : null;

  return (
    <View className="bg-black border border-grey-600 rounded-xl p-2 w-full">
      <View className="flex-row items-center">
        <Pressable onPress={() => router.navigate(`/product/${barcode}`)}>
          <Image
            source={imageUrl || icons.placeholder}
            contentFit="cover"
            className="border border-grey-600 rounded-xl mr-2 h-24 w-24"
            transition={50}
            placeholder={icons.placeholder}
            placeholderContentFit="cover"
          />
        </Pressable>
        <View className="justify-between grow h-24">
          <View className="flex-row h-12">
            <Pressable
              className="flex-col justify-between active:opacity-50 h-full"
              onPress={() => router.navigate(`/product/${barcode}`)}
            >
              <CustomText classes="font-bsemibold text-white w-[180px]">
                {t.code} : {article}
              </CustomText>
              <CustomText classes="text-grey-400">
                {t.size} : {product?.selectedSize?.value}
              </CustomText>
            </Pressable>
            <Pressable
              className="justify-center items-center active:opacity-50 ml-auto h-10 w-10"
              onPress={handleRemoveProduct}
            >
              <Image
                source={icons.cross}
                contentFit="contain"
                className="h-6 w-6"
                transition={100}
                tintColor="#be2617"
              />
            </Pressable>
          </View>
          <View className="flex-row items-center justify-between h-10">
            <View className="justify-between h-full">
              <View className="flex-row justify-between items-center mt-auto h-10">
                <Pressable
                  onPress={() => handleQuantityChange(quantity - 1)}
                  className="items-center justify-center rounded-full active:opacity-50 h-8 w-6"
                >
                  <Image
                    source={icons.minus}
                    contentFit="contain"
                    className="h-6 w-6"
                    transition={100}
                    tintColor="#a9a9a9"
                  />
                </Pressable>
                <View className="border border-grey-400 rounded-xl items-center justify-center h-9 w-20">
                  <CustomText classes="font-bbold text-white">
                    {quantity}
                  </CustomText>
                </View>
                <Pressable
                  onPress={() => increaseQuantity()}
                  className="items-center justify-center rounded-full active:opacity-50 h-8 w-6"
                >
                  <Image
                    source={icons.plus}
                    contentFit="contain"
                    className="h-6 w-6"
                    transition={100}
                    tintColor="#a9a9a9"
                  />
                </Pressable>
              </View>
            </View>
            <CustomText classes="text-base text-primary font-bbold">
              {parseFloat(Discount?.value) > 0
                ? (() => {
                    const originalPrice = parseFloat(sellPrice);

                    if (Discount.type === "PERCENTAGE") {
                      const discountAmount =
                        (parseFloat(Discount.value) / 100) * originalPrice;
                      return (
                        parseFloat(originalPrice - discountAmount) * quantity
                      ).toFixed(2);
                    } else if (Discount.isActive === false) {
                      return (parseFloat(Discount.value) * quantity).toFixed(2);
                    } else if (
                      Discount.type === "FIXED" &&
                      Discount.isActive === true
                    ) {
                      const discountedPrice =
                        originalPrice - parseFloat(Discount.value);
                      return (parseFloat(discountedPrice) * quantity).toFixed(
                        2
                      );
                    } else {
                      return (parseFloat(Discount.value) * quantity).toFixed(2);
                    }
                  })()
                : (parseFloat(sellPrice) * quantity).toFixed(2)}
              M
            </CustomText>
          </View>
        </View>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={productDeleteModal}
      >
        <View className="flex-1 items-center justify-center">
          <View className="bg-dark border border-grey-400 rounded-xl items-center space-y-2 pt-2 pb-4 px-4 w-[320px]">
            <View className="flex-row justify-between items-center w-full">
              <CustomText classes="text-base text-white">
                {t.productDeleteHeader}
              </CustomText>
              <Pressable
                onPress={() => setConfirmProductDeleteModal(false)}
                className="border border-gray-400 rounded-xl items-center justify-center active:border-primary ml-auto h-9 w-9"
              >
                <Image
                  source={icons.cross}
                  contentFit="contain"
                  className="h-5 w-5"
                  tintColor="#ffffff"
                />
              </Pressable>
            </View>
            <View className="flex-row justify-between items-center h-fit w-full">
              <Pressable
                onPress={() => {
                  setConfirmProductDeleteModal(false);
                }}
                className="border border-gray-400 rounded-xl items-center justify-center active:border-primary h-12 w-[48%]"
              >
                <CustomText classes="font-bsemibold text-base text-white">
                  {t.no}
                </CustomText>
              </Pressable>
              <Pressable
                onPress={() => {
                  removeFromShoppingCart(uniqueId);
                  throwToast(t.productRemoved);
                  setConfirmProductDeleteModal(false);
                }}
                className="border border-gray-400 rounded-xl items-center justify-center active:border-primary h-12 w-[48%]"
              >
                <CustomText classes="font-bsemibold text-base text-white">
                  {t.yes}
                </CustomText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
