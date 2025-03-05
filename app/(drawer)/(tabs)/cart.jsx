import icons from "../../../utils/icons";
import ProductContainerForCart from "../../../components/containers/ProductContainerForCart";
import FormField from "../../../components/containers/FormField";
import { apiURL } from "../../../utils/utils";
import { CustomText } from "../../../utils/CustomText";
import { LoadingLarge } from "../../../utils/LoadingStates";
import { useCustomerStore } from "../../../utils/customerStore";
import { useLanguageStore } from "../../../utils/languageStore";
import { throwToast } from "../../../components/functions/ThrowToast";
import { useState, useEffect, useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import {
  View,
  ScrollView,
  Pressable,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function CartScreen() {
  const {
    customer,
    shoppingCart,
    clearShoppingCart,
    updateCustomerData,
    setShoppingCartQuantity,
    setShoppingCartQuantityByProductId,
  } = useCustomerStore();
  const [orderModal, setOrderModalVisible] = useState(false);
  const [cartCleanModal, setCartCleanModal] = useState(false);
  const [citiesModal, setCitiesModal] = useState(false);
  const [townsModal, setTownsModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [changedItems, setChangedItems] = useState([]);
  const [form, setForm] = useState({
    phoneNumber: customer?.phoneNumber ? customer.phoneNumber.slice(3) : "",
    address: customer?.address ? customer.address : "",
    comment: "",
  });
  const [productsArray, setProductsArray] = useState([]);
  const [info, setInfo] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [towns, setTowns] = useState([]);
  const [deliveryTypes, setDeliveryTypes] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [orderTimes, setOrderTimes] = useState([]);

  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCityData, setSelectedCityData] = useState([]);
  const [selectedTown, setSelectedTown] = useState(null);
  const [selectedTownData, setSelectedTownData] = useState([]);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [selectedOrderTime, setSelectedOrderTime] = useState(null);
  const [availableOrderTimes, setAvailableOrderTimes] = useState([]);
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const infoResponse = await fetch(`${apiURL}/info/get`);
          const infoData = await infoResponse.json();
          setInfo(infoData);

          const orderTimesResponse = await fetch(
            `${apiURL}/ordertimes/fetch/client`
          );
          const orderTimesData = await orderTimesResponse.json();
          setOrderTimes(orderTimesData?.orderTimes);

          setSelectedRegion(1);

          const uniqueProductIds = [
            ...new Set(shoppingCart.map((item) => item.productId)),
          ];

          const requestBody = {
            products: uniqueProductIds.map((productId) => ({ productId })),
          };

          const response = await fetch(`${apiURL}/products/newlatestdata`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          const updatedProducts = await response.json();

          const mergedProducts = shoppingCart.map((cartItem) => {
            const productData = updatedProducts.find(
              (product) => product.id === cartItem.productId
            );

            if (productData) {
              return {
                ...cartItem,
                ...productData,
              };
            }

            return cartItem;
          });

          setProductsArray(mergedProducts);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }, [shoppingCart])
  );

  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      try {
        const regionsResponse = await fetch(
          `${apiURL}/orderregions/fetch/client`
        );
        const regionsData = await regionsResponse.json();
        setRegions(regionsData?.orderRegions);

        const paymentResponse = await fetch(`${apiURL}/paymenttypes/fetch/all`);
        const paymentData = await paymentResponse.json();
        setPaymentTypes(paymentData?.paymentTypes);

        const deliveryTypesResponse = await fetch(
          `${apiURL}/deliverytypes/fetch/all`
        );
        const deliveryTypesData = await deliveryTypesResponse.json();
        setDeliveryTypes(deliveryTypesData?.deliveryTypes);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // useEffect(() => {
  //   if (!orderTimes.length) return;

  //   const currentDateTime = new Date();
  //   const currentHours = currentDateTime.getHours();

  //   const filteredTimes = orderTimes.filter((item) => {
  //     if (item.nameRu === "Сегодня" || item.nameTm === "Şu gün") {
  //       const startHour = parseInt(item.time.split(" - ")[0].split(":")[0], 10);
  //       return startHour > currentHours;
  //     }
  //     return true;
  //   });

  //   setAvailableOrderTimes(filteredTimes);
  // }, [orderTimes]);
  useEffect(() => {
    function updateAvailableTimes() {
      if (!orderTimes.length) return;

      const currentDateTime = new Date();
      const currentHours = currentDateTime.getHours();
      const currentMinutes = currentDateTime.getMinutes();

      const filteredTimes = orderTimes.filter((item) => {
        if (item.nameRu === "Сегодня" || item.nameTm === "Şu gün") {
          const [startTime, endTime] = item.time.split(" - ");
          const [startHour, startMinute] = startTime.split(":").map(Number);

          if (
            startHour > currentHours ||
            (startHour === currentHours && startMinute > currentMinutes)
          ) {
            return true;
          }
          return false;
        }
        return true;
      });

      setAvailableOrderTimes(filteredTimes);

      setSelectedOrderTime((prevSelected) => {
        if (
          prevSelected &&
          !filteredTimes.find((time) => time.id === prevSelected.id)
        ) {
          return null;
        }
        return prevSelected;
      });
    }

    updateAvailableTimes();

    const intervalId = setInterval(updateAvailableTimes, 60000);

    return () => clearInterval(intervalId);
  }, [orderTimes]);

  useEffect(() => {
    if (selectedRegion) {
      fetch(`${apiURL}/orderregions/fetch/singleactive/${selectedRegion}`)
        .then((response) => response.json())
        .then((data) => {
          setCities(data?.orderRegion?.Cities || []);
          setSelectedCity(null);
          setTowns([]);
        })
        .catch((error) => console.error("Error fetching cities:", error));
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedCity) {
      fetch(`${apiURL}/cities/fetch/singleactive/${selectedCity}`)
        .then((response) => response.json())
        .then((data) => {
          setTowns(data?.city?.Towns || []);
        })
        .catch((error) => console.error("Error fetching towns:", error));
    }
  }, [selectedCity]);

  const currentTown = towns.find((town) => town.id === selectedTown);

  let totalSum = 0;

  productsArray?.length > 0 &&
    productsArray.forEach((product) => {
      const quantity = parseFloat(product.quantity);
      const originalPrice = parseFloat(product.sellPrice);
      const discount = product.Discount;

      let productTotal = 0;

      if (!discount || parseFloat(discount?.value) <= 0) {
        productTotal = originalPrice * quantity;
      } else if (discount.type === "PERCENTAGE") {
        const discountAmount =
          (parseFloat(discount.value) / 100) * originalPrice;
        productTotal = (originalPrice - discountAmount) * quantity;
      } else if (discount.isActive === false) {
        productTotal = parseFloat(discount.value) * quantity;
      } else if (discount.type === "FIXED" && discount.isActive === true) {
        const discountedPrice = originalPrice - parseFloat(discount.value);
        productTotal = discountedPrice * quantity;
      } else {
        productTotal = parseFloat(discount.value) * quantity;
      }

      totalSum += productTotal;
    });

  const products = shoppingCart?.map((item) => {
    const productDetails = productsArray.find(
      (prod) => prod.productId === item.productId
    );

    const currentPrice = (() => {
      const originalPrice = parseFloat(productDetails?.sellPrice);
      const discount = productDetails?.Discount;

      if (!discount || parseFloat(discount?.value) <= 0) {
        return parseFloat(originalPrice).toFixed(2);
      }

      if (discount.type === "PERCENTAGE") {
        const discountAmount =
          (parseFloat(discount.value) / 100) * originalPrice;
        return parseFloat(originalPrice - discountAmount).toFixed(2);
      } else if (discount.isActive === false) {
        return parseFloat(discount.value).toFixed(2);
      } else if (discount.type === "FIXED" && discount.isActive === true) {
        const discountedPrice = originalPrice - parseFloat(discount.value);
        return parseFloat(discountedPrice).toFixed(2);
      } else {
        return parseFloat(discount.value).toFixed(2);
      }
    })();

    return {
      id: item?.productId,
      quantity: parseFloat(item?.quantity),
      sizeId: Number(item?.selectedSize?.id),
      currentSellPrice: currentPrice,
    };
  });

  const checkStockAndProceed = async () => {
    setSubmitting(true);

    try {
      const formattedOrderItems = shoppingCart?.map((item) => ({
        productId: item?.productId,
        sizeId: item?.selectedSize?.id,
        quantity: item?.quantity,
      }));

      const response = await fetch(`${apiURL}/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItems: formattedOrderItems }),
      });

      const data = await response.json();
      const adjustedItems = data?.adjustedItems || [];

      const updatedProducts = adjustedItems.reduce((acc, adjustedItem) => {
        const originalItem = productsArray.find(
          (item) =>
            item.productId === adjustedItem.productId &&
            item.selectedSize.id === adjustedItem.sizeId
        );
        if (
          originalItem &&
          originalItem.quantity !== Number(adjustedItem.quantity)
        ) {
          acc.push({
            image: originalItem.images,
            productId: adjustedItem.productId,
            oldQuantity: originalItem.quantity,
            newQuantity: adjustedItem.quantity,
            nameRu: originalItem.nameRu,
            nameTm: originalItem.nameTm,
            article: originalItem.article,
            size: originalItem.selectedSize.value,
          });

          setShoppingCartQuantity(
            adjustedItem.productId,
            adjustedItem.sizeId,
            Number(adjustedItem.quantity)
          );
        }
        return acc;
      }, []);

      const updateLocalShoppingCart = (adjustedItems) => {
        adjustedItems.forEach((adjustedItem) => {
          const originalItem = productsArray.find(
            (item) =>
              item.productId === adjustedItem.productId &&
              item.selectedSize.id === adjustedItem.sizeId
          );

          if (
            originalItem &&
            originalItem.quantity !== Number(adjustedItem.quantity)
          ) {
            setShoppingCartQuantityByProductId(
              adjustedItem.productId,
              adjustedItem.sizeId,
              Number(adjustedItem.quantity)
            );
          }
        });
      };

      updateLocalShoppingCart(adjustedItems);

      if (updatedProducts.length > 0) {
        setChangedItems(updatedProducts);
        setModalVisible(true);
      } else {
        await handleMakeOrder();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMakeOrder = async () => {
    if (form.phoneNumber === "") {
      Alert.alert(t.noPhoneNumber, t.fillPhoneNumber);
      return;
    }

    if (form.phoneNumber?.length < 8) {
      Alert.alert(t.incorrentPhoneFormat, t.fillPhoneNumberCorrectly);
      return;
    }

    if (!selectedRegion) {
      Alert.alert(t.noSelectedRegion, t.fillRegion);
      return;
    }

    if (selectedRegion !== 1 && !selectedCity) {
      Alert.alert(t.noSelectedCity, t.fillCity);
      return;
    }

    if (selectedRegion !== 1 && !selectedTown) {
      Alert.alert(t.noSelectedTown, t.fillTown);
      return;
    }

    if (selectedRegion === 1 && !selectedDeliveryType) {
      Alert.alert(t.noDeliveryType, t.fillDeliveryType);
      return;
    }

    if (selectedRegion === 1 && !selectedPaymentType) {
      Alert.alert(t.noPaymentType, t.fillPaymentType);
      return;
    }

    if (selectedRegion === 1 && !selectedOrderTime) {
      Alert.alert(t.noOrderTime, t.fillOrderTime);
      return;
    }

    setSubmitting(true);

    const orderFormData = {
      phoneNumber: "993" + form.phoneNumber,
      address: form.address || "",
      comment: form.comment,
      sum: 0,
      orderItems: products,
      orderRegionId: selectedRegion,
      cityId: selectedCity,
      townId: selectedTown,
      orderTimeId: selectedOrderTime,
      paymentTypeId: selectedPaymentType === null ? 1 : selectedPaymentType,
      deliveryTypeId: selectedDeliveryType,
      orderStatusId: 1,
      customerId: customer?.customerId || null,
    };

    try {
      const response = await fetch(`${apiURL}/orders/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderFormData),
      });

      if (response.status === 403) {
        const data = await response.json();
        Alert.alert(t.youAreBlocked, data.message, [{ text: "ОК" }]);
        return;
      }

      if (response.ok) {
        const res = await response.json();
        Alert.alert(t.success, t.orderIsMade);
        updateCustomerData(res?.order);
        setSelectedRegion(1);
        setSelectedDeliveryType(null);
        setSelectedPaymentType(null);
        setSelectedOrderTime(null);
        setSelectedCity(null);
        setSelectedCityData([]);
        setSelectedTown(null);
        setSelectedTownData([]);
        setOrderModalVisible(false);
        router.navigate(`/orders/view/${res?.order?.id}`);
        clearShoppingCart();
      } else {
        Alert.alert(t.error, t.networkError);
      }
    } catch (err) {
      Alert.alert(t.error, err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnToCart = () => {
    setModalVisible(false);
  };

  const handleConfirmChanges = async () => {
    if (products?.length === 0) {
      Alert.alert(t.emptyCartHeader, t.addProductsToCart);
      setModalVisible(false);
      setOrderModalVisible(false);
      return;
    } else {
      await handleMakeOrder();
      setModalVisible(false);
    }
  };

  return (
    <View className="bg-black px-2 h-full" style={{ flex: 1 }}>
      <>
        {loading ? (
          <View className="bg-black mt-[50%] h-full">
            <LoadingLarge />
          </View>
        ) : (
          <>
            {shoppingCart?.length > 0 ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center h-10">
                    <View className="justify-center items-start">
                      <CustomText classes="font-bbold text-primary text-lg">
                        {t.shoppingcart}
                      </CustomText>
                    </View>
                  </View>
                  <Pressable
                    className="justify-center items-center active:opacity-50 ml-auto h-6 w-6"
                    onPress={() => {
                      setCartCleanModal(true);
                    }}
                  >
                    <Image
                      source={icons.trashBin}
                      contentFit="contain"
                      className="h-5 w-5"
                      transition={100}
                      tintColor="#be2617"
                    />
                  </Pressable>
                </View>
                <View className="w-full">
                  {productsArray?.map((product) => {
                    return (
                      <View key={product?.uniqueId} className="mb-2 w-full">
                        <ProductContainerForCart product={product} />
                      </View>
                    );
                  })}
                </View>
                <View className="mb-2"></View>
              </ScrollView>
            ) : (
              <>
                <View className="flex-row items-center h-10">
                  <View className="justify-center items-start">
                    <CustomText classes="font-bbold text-primary text-lg">
                      {t.shoppingcart}
                    </CustomText>
                  </View>
                </View>
                <CustomText classes="text-base text-white" numberOfLines={2}>
                  {t.emptyShoppingCart}
                </CustomText>
              </>
            )}
          </>
        )}
      </>
      <View className="border-t border-dark flex-row items-center justify-between mt-auto h-16 w-full">
        <View className="flex-row items-center">
          <CustomText classes="text-white text-lg font-bbold mr-2">
            {parseFloat(totalSum).toFixed(2)} TMT
          </CustomText>
        </View>
        {info?.ordersValid === true ? (
          <Pressable
            onPress={() => {
              if (shoppingCart?.length > 0) {
                setOrderModalVisible(true);
              } else {
                throwToast(t.noProducts);
              }
            }}
            className="bg-primary rounded-xl flex flex-row justify-center items-center active:bg-primary-800 px-8 h-12"
          >
            <CustomText classes="text-white font-bbold">
              {t.prepareOrder}
            </CustomText>
          </Pressable>
        ) : (
          <View className="bg-dark rounded-xl flex flex-row justify-center items-center active:bg-primary-800 px-2 h-12">
            <CustomText classes="text-white">{t.noOrdersToday}</CustomText>
          </View>
        )}
      </View>
      <Modal animationType="fade" transparent={true} visible={cartCleanModal}>
        <View className="flex-1 items-center justify-center">
          <View className="bg-dark border border-grey-400 rounded-xl items-center space-y-2 pt-2 pb-4 px-4 w-[320px]">
            <View className="flex-row justify-between items-center w-full">
              <CustomText classes="text-base text-white">
                {t.cartCleanHeader}
              </CustomText>
              <Pressable
                onPress={() => setCartCleanModal(false)}
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
                  setCartCleanModal(false);
                }}
                className="border border-gray-400 rounded-xl items-center justify-center active:border-primary h-12 w-[48%]"
              >
                <CustomText classes="font-bsemibold text-base text-white">
                  {t.no}
                </CustomText>
              </Pressable>
              <Pressable
                onPress={() => {
                  clearShoppingCart();
                  throwToast(t.cartCleared);
                  setCartCleanModal(false);
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={orderModal}
        onRequestClose={() => {
          setSelectedRegion(1);
          setSelectedDeliveryType(null);
          setSelectedPaymentType(null);
          setSelectedOrderTime(null);
          setSelectedCity(null);
          setSelectedCityData([]);
          setSelectedTown(null);
          setSelectedTownData([]);
          setOrderModalVisible(false);
        }}
        style={{ flex: 1 }}
      >
        <Modal animationType="fade" transparent={true} visible={modalVisible}>
          <View className="bg-dark/50 flex-1 items-center justify-center">
            <View className="bg-black border border-grey-400 rounded-xl items-center p-4 pt-2 w-80">
              <CustomText classes="font-bbold text-white text-lg">
                {t.stockHeader}
              </CustomText>
              <View className="flex-col space-y-2 mt-2 w-full">
                {changedItems?.length > 0 &&
                  changedItems.map((item) => (
                    <View
                      className="border border-grey-400 rounded-xl flex-row items-center"
                      key={toString(item.image[0].url)}
                    >
                      <Image
                        source={{ uri: `${apiURL}/${item.image[0].url}` }}
                        contentFit="contain"
                        className="border-r border-grey-400 mr-4 h-16 w-16"
                        transition={100}
                      />
                      <View className="justify-between grow">
                        <CustomText classes="font-bsemibold text-sm text-white max-w-[200px]">
                          {language === "tm" ? item.nameTm : item.nameRu}
                        </CustomText>
                        <CustomText classes="font-bsemibold text-sm text-white">
                          {t.oldQuantity}: {item.oldQuantity}
                        </CustomText>
                        <CustomText classes="font-bsemibold text-sm text-white">
                          {t.newQuantity}:{" "}
                          <CustomText classes="text-primary font-bbold">
                            {item.newQuantity}
                          </CustomText>
                        </CustomText>
                      </View>
                    </View>
                  ))}
              </View>
              <View className="flex-row justify-between mt-4 w-full">
                <Pressable
                  onPress={handleReturnToCart}
                  className="bg-dark rounded-xl flex-row justify-center items-center active:opacity-80 h-12 w-32"
                >
                  <CustomText classes="text-white text-base text-center">
                    {t.back}
                  </CustomText>
                </Pressable>
                <Pressable
                  onPress={handleConfirmChanges}
                  className="bg-primary rounded-xl flex-row justify-center items-center active:opacity-80 h-12 w-32"
                >
                  <CustomText classes="text-base text-center text-white">
                    {t.continue}
                  </CustomText>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
        <Modal animationType="fade" transparent={true} visible={citiesModal}>
          <Modal animationType="fade" transparent={true} visible={townsModal}>
            <View className="bg-dark rounded-t-3xl relative p-2 mt-auto h-full w-full">
              <View
                className={`flex-row items-center justify-between pr-1 ${
                  Platform.OS === "ios" ? "pt-14" : "pt-0"
                }`}
              >
                <CustomText classes="text-white px-2">
                  {t.selectCity}{" "}
                  <CustomText classes="text-fullred">{t.important}</CustomText>
                </CustomText>
                <Pressable
                  onPress={() => setTownsModal(false)}
                  className="bg-dark border border-gray-400 rounded-xl items-center justify-center active:border-primary h-10 w-10 z-10"
                >
                  <Image
                    source={icons.back}
                    contentFit="contain"
                    className="h-5 w-5"
                    tintColor="#ffffff"
                  />
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {selectedCity && towns.length > 0 && (
                  <View className="mt-2 px-2">
                    {towns?.map((town) => (
                      <View className="mb-2 w-full" key={town?.id}>
                        <Pressable
                          key={town?.id}
                          onPress={() => {
                            setSelectedTown(town?.id);
                            setSelectedTownData(town);
                            setTownsModal(false);
                            setCitiesModal(false);
                          }}
                          className={`rounded-lg flex flex-row justify-between items-center px-2 h-12 w-full ${
                            selectedTown === town?.id
                              ? "bg-primary"
                              : "bg-grey-600"
                          }`}
                        >
                          <CustomText classes="text-white">
                            {language === "tm" ? town?.nameTm : town?.nameRu}
                          </CustomText>
                          <CustomText classes="text-white">
                            {town.deliveryPrice} TMT
                          </CustomText>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          </Modal>
          <View className="flex-1">
            <View className="bg-dark rounded-t-3xl relative p-2 mt-auto h-full w-full">
              <View
                className={`flex-row items-center justify-between pr-1 ${
                  Platform.OS === "ios" ? "pt-14" : "pt-0"
                }`}
              >
                <CustomText classes="text-white px-2">
                  {t.selectRegion}{" "}
                  <CustomText classes="text-fullred">{t.important}</CustomText>
                </CustomText>
                <Pressable
                  onPress={() => setCitiesModal(false)}
                  className="bg-dark border border-gray-400 rounded-xl items-center justify-center active:border-primary h-10 w-10 z-10"
                >
                  <Image
                    source={icons.back}
                    contentFit="contain"
                    className="h-5 w-5"
                    tintColor="#ffffff"
                  />
                </Pressable>
              </View>
              <ScrollView className="mt-2" showsVerticalScrollIndicator={false}>
                {selectedRegion && cities.length > 0 && (
                  <View className="px-2">
                    {cities?.map((city) => (
                      <View className="mb-2 w-full" key={city?.id}>
                        <Pressable
                          key={city?.id}
                          onPress={() => {
                            setSelectedCity(city?.id);
                            setSelectedCityData(city);
                            setSelectedTown(null);
                            setTownsModal(true);
                          }}
                          className={`rounded-lg flex flex-row justify-center items-center h-12 w-full ${
                            selectedCity === city?.id
                              ? "bg-primary"
                              : "bg-grey-600"
                          }`}
                        >
                          <CustomText classes="text-white">
                            {language === "tm" ? city?.nameTm : city?.nameRu}
                          </CustomText>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
          style={{ flexGrow: 1 }}
          className="bg-dark rounded-t-3xl"
        >
          <ScrollView
            className="bg-dark rounded-t-3xl relative p-2 h-full w-full"
            showsVerticalScrollIndicator={false}
            style={{ flexGrow: 1 }}
          >
            <View
              className={`flex-row items-center justify-between pr-1 ${
                Platform.OS === "ios" ? "pt-14" : "pt-0"
              }`}
            >
              <CustomText classes="text-white px-2">
                {t.deliveryRegion}{" "}
                <CustomText classes="text-fullred">{t.important}</CustomText>
              </CustomText>
              <Pressable
                onPress={() => {
                  setSelectedRegion(1);
                  setSelectedDeliveryType(null);
                  setSelectedPaymentType(null);
                  setSelectedOrderTime(null);
                  setSelectedCity(null);
                  setSelectedCityData([]);
                  setSelectedTown(null);
                  setSelectedTownData([]);
                  setOrderModalVisible(false);
                }}
                className="bg-dark border border-gray-400 rounded-xl items-center justify-center active:border-primary h-10 w-10 z-10"
              >
                <Image
                  source={icons.cross}
                  contentFit="contain"
                  className="h-5 w-5"
                  tintColor="#ffffff"
                />
              </Pressable>
            </View>
            <View className="flex-row items-center flex-wrap mt-2">
              {regions?.map((item) => (
                <View className="p-1 w-1/2" key={item?.id}>
                  <Pressable
                    onPress={() => {
                      setSelectedRegion(item?.id);
                      setSelectedCity(null);
                      setSelectedTown(null);
                      setSelectedDeliveryType(null);
                      setSelectedOrderTime(null);
                      if (item?.id === 2) {
                        setCitiesModal(true);
                        setSelectedPaymentType(1);
                      } else {
                        setSelectedCity(null);
                        setSelectedTown(null);
                        setSelectedCityData(null);
                        setSelectedTownData(null);
                      }
                    }}
                    className={`rounded-lg flex flex-row justify-center items-center h-12 w-full ${
                      selectedRegion === item?.id ? "bg-primary" : "bg-grey-600"
                    }`}
                  >
                    <CustomText classes="text-white">
                      {language === "tm" ? item?.nameTm : item?.nameRu}
                    </CustomText>
                  </Pressable>
                </View>
              ))}
            </View>
            {selectedRegion === 1 ? (
              <>
                <CustomText classes="text-white px-2 mt-1">
                  {t.deliveryType}
                </CustomText>
                <View className="flex-row items-center flex-wrap">
                  {deliveryTypes?.map((item) => (
                    <View className="p-1 w-1/2" key={item?.id}>
                      <Pressable
                        onPress={() => {
                          setSelectedDeliveryType(item?.id);
                        }}
                        className={`rounded-lg flex flex-row justify-between items-center px-2 h-12 w-full ${
                          selectedDeliveryType === item?.id
                            ? "bg-primary"
                            : "bg-grey-600"
                        }`}
                      >
                        <CustomText classes="text-white">
                          {language === "tm" ? item?.nameTm : item?.nameRu}
                        </CustomText>
                        <CustomText classes="text-white">
                          {item.price} M
                        </CustomText>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <></>
            )}
            {selectedRegion === 1 ? (
              <>
                <CustomText classes="text-white px-2 mt-1">
                  {t.paymentType}
                </CustomText>
                <View className="flex-row items-center flex-wrap">
                  {paymentTypes?.map((item) => (
                    <View className="p-1 w-1/2" key={item?.id}>
                      <Pressable
                        onPress={() => setSelectedPaymentType(item?.id)}
                        className={`rounded-lg flex flex-row justify-center items-center h-12 w-full ${
                          selectedPaymentType === item?.id
                            ? "bg-primary"
                            : "bg-grey-600"
                        }`}
                      >
                        <CustomText classes="text-white">
                          {language === "tm" ? item?.nameTm : item?.nameRu}
                        </CustomText>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <>
                <CustomText classes="text-white px-2 mt-1">
                  {t.paymentType}
                </CustomText>
                <Pressable
                  className={`rounded-lg flex flex-row justify-center items-center mx-1 h-12 bg-primary`}
                >
                  <CustomText classes="text-white">
                    {language === "tm"
                      ? paymentTypes[0]?.nameTm
                      : paymentTypes[0]?.nameRu}
                  </CustomText>
                </Pressable>
              </>
            )}
            {selectedRegion === 1 ? (
              <>
                <CustomText classes="text-white px-2 mt-1">
                  {t.deliveryTime}
                </CustomText>
                <View className="flex-row items-center flex-wrap">
                  {availableOrderTimes?.map((item) => (
                    <View className="p-1 w-1/2" key={item?.id}>
                      <Pressable
                        onPress={() => {
                          setSelectedOrderTime(item?.id);
                        }}
                        className={`rounded-lg flex flex-row justify-between items-center px-2 h-12 w-full ${
                          selectedOrderTime === item?.id
                            ? "bg-primary"
                            : "bg-grey-600"
                        }`}
                      >
                        <CustomText classes="text-white text-xs">
                          {language === "tm" ? item?.nameTm : item?.nameRu}
                        </CustomText>
                        <CustomText classes="text-white text-xs">
                          {item?.time ? item.time : "N/A"}
                        </CustomText>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <>
                <CustomText classes="text-white px-2 mt-1">
                  {t.deliveryTime}
                </CustomText>
                <CustomText classes="text-white px-2 mt-1" numberOfLines={2}>
                  {t.operatorWillCallYou}
                </CustomText>
              </>
            )}
            {selectedCity ? (
              <View className="bg-primary rounded-lg flex flex-row justify-center items-center mt-2 mx-2 px-2 h-12">
                <CustomText classes="text-white">
                  {language === "tm"
                    ? selectedCityData?.nameTm
                    : selectedCityData?.nameRu}
                </CustomText>
              </View>
            ) : (
              <></>
            )}
            {selectedTown ? (
              <View className="bg-primary rounded-lg flex flex-row justify-center items-center mt-2 mx-2 px-2 h-12">
                <CustomText classes="text-white mr-2">
                  {language === "tm"
                    ? selectedTownData?.nameTm
                    : selectedTownData?.nameRu}
                </CustomText>
                <CustomText classes="text-white">
                  {selectedTownData?.deliveryPrice} TMT
                </CustomText>
              </View>
            ) : (
              <></>
            )}
            <FormField
              icon={icons.phone}
              containerClasses="mt-2 w-full"
              value={form.phoneNumber}
              handleChangeText={(e) => setForm({ ...form, phoneNumber: e })}
              isPhoneNumberField={true}
              placeholder={t.phoneNumber}
              minLength={8}
            />
            <FormField
              icon={icons.home}
              containerClasses="mt-2 w-full"
              value={form.address}
              handleChangeText={(e) => setForm({ ...form, address: e })}
              isPhoneNumberField={false}
              placeholder={t.address}
            />
            <FormField
              icon={icons.list}
              containerClasses="mt-2 w-full"
              value={form.comment}
              handleChangeText={(e) => setForm({ ...form, comment: e })}
              isPhoneNumberField={false}
              placeholder={t.comment}
            />
            <View className="flex-row items-center justify-between mt-2 px-2 h-16 w-full">
              <View>
                <CustomText classes="text-white text-lg font-bbold">
                  {parseFloat(totalSum).toFixed(2)} TMT
                </CustomText>
                <CustomText classes="text-white text-xs">
                  {selectedDeliveryType ? (
                    <>
                      +{" "}
                      {selectedDeliveryType
                        ? `${parseFloat(
                            deliveryTypes?.find(
                              (type) => type.id === selectedDeliveryType
                            )?.price || 0
                          ).toFixed(2)} TMT `
                        : "0.00 TMT "}
                      {t.forDelivery}
                    </>
                  ) : (
                    <>
                      +{" "}
                      {currentTown?.deliveryPrice
                        ? `${parseFloat(currentTown.deliveryPrice).toFixed(
                            2
                          )} TMT `
                        : "0.00 TMT "}
                      {t.forDelivery}
                    </>
                  )}
                </CustomText>
              </View>
              <Pressable
                onPress={() => checkStockAndProceed()}
                disabled={submitting}
                className="bg-primary rounded-xl flex flex-row justify-center items-center active:bg-primary-800 px-8 h-12"
              >
                <CustomText classes="text-white text-base font-bbold">
                  {t.makeorder}
                </CustomText>
                {submitting && (
                  <ActivityIndicator
                    color="#ffffff"
                    size="small"
                    className="ml-2"
                  />
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
