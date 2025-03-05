import icons from "../../../../../utils/icons";
import { apiURL } from "../../../../../utils/utils";
import { CustomText } from "../../../../../utils/CustomText";
import { useFetcher } from "../../../../../utils/utils";
import { LoadingLarge } from "../../../../../utils/LoadingStates";
import { useLanguageStore } from "../../../../../utils/languageStore";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import {
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  Modal,
  Alert,
} from "react-native";

const statusClasses = {
  1: "bg-grey-500",
  2: "bg-blue-600",
  3: "bg-yellow-500",
  4: "bg-green-600",
  5: "bg-primary",
};

const Container = ({ title, text, containerclasses }) => {
  return (
    <View
      className={`bg-black border-b border-grey-600 flex-row items-center justify-between p-2 w-full ${containerclasses}`}
      style={{ flexWrap: "wrap" }}
    >
      <CustomText classes="text-white">{title} :</CustomText>
      <CustomText
        classes="text-white text-right"
        numberOfLines={0}
        style={{ flex: 1, flexWrap: "wrap", textAlign: "right" }}
      >
        {text}
      </CustomText>
    </View>
  );
};

export default function OrderScreen() {
  const [orderCancelModalVisible, setOrderCancelModalVisible] = useState(false);
  const { id } = useLocalSearchParams();
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();

  const {
    data: response = {},
    error,
    isLoading,
    mutate,
  } = useFetcher(`${apiURL}/orders/fetch/${id}`);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await mutate();
    } catch (error) {
      Alert.alert(t.error, t.networkError);
    }
    setRefreshing(false);
  };

  if (isLoading)
    return (
      <View className="bg-black pt-4 h-full">
        <LoadingLarge />
      </View>
    );
  if (error) return <></>;

  const {
    phoneNumber,
    address,
    comment,
    sum,
    createdAt,
    OrderItems,
    OrderTime,
    PaymentType,
    DeliveryType,
    OrderStatus,
    Region,
    City,
    Town,
  } = response?.order || [];

  const handleOrderCancel = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`${apiURL}/orders/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: Number(id),
        }),
      });

      if (response.ok) {
        Alert.alert(t.success, t.statusChangeSuccess);
        setOrderCancelModalVisible(false);
        await mutate();
      }
    } catch (error) {
      Alert.alert(t.error, t.networkError);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View className="bg-black h-full">
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
        <View className="justify-center items-center">
          <CustomText classes="font-bbold text-primary text-lg">
            {t.orders}
          </CustomText>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="bg-black px-2 h-full"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="border border-grey-600 rounded-xl">
          <Container
            containerclasses="rounded-t-xl"
            title={t.createdAt}
            text={createdAt}
          />
          <Container title={t.orderNumber} text={id} />
          {OrderTime ? (
            <Container
              title={t.orderTime}
              text={
                language === "tm"
                  ? `${OrderTime?.nameTm}/${OrderTime?.time}`
                  : `${OrderTime?.nameRu}/${OrderTime?.time}`
              }
            />
          ) : (
            <Container
              title={t.orderTime}
              text={language === "tm" ? t.outOfCity : t.outOfCity}
            />
          )}
          <Container
            title={t.orderRegion}
            text={language === "tm" ? Region?.nameTm : Region?.nameRu}
          />
          {City ? (
            <Container
              title={t.city}
              text={language === "tm" ? City?.nameTm : City?.nameRu}
            />
          ) : (
            <></>
          )}
          {Town ? (
            <Container
              title={t.town}
              text={
                language === "tm"
                  ? `${Town?.nameTm}-${Town?.deliveryPrice} TMT`
                  : `${Town?.nameRu}-${Town?.deliveryPrice} TMT`
              }
            />
          ) : (
            <></>
          )}
          <Container title={t.address} text={address ? address : t.no} />
          <Container title={t.phoneNumber} text={phoneNumber} />
          <Container title={t.comment} text={comment ? comment : t.no} />
          <View className="bg-black border-b border-grey-600 flex-row items-center justify-between pl-2 h-9 w-full">
            <CustomText classes="text-white">{t.paymentType} :</CustomText>
            <View className="bg-primary rounded-xl flex-row items-center justify-center px-4 h-7">
              <CustomText classes="text-white text-right">
                {language === "tm" ? PaymentType?.nameTm : PaymentType?.nameRu}
              </CustomText>
            </View>
          </View>
          <View className="bg-black border-b border-grey-600 flex-row items-center justify-between pl-2 h-9 w-full">
            <CustomText classes="text-white">{t.orderStatus} :</CustomText>
            <View
              className={`${
                statusClasses[OrderStatus?.id] || "bg-primary"
              }   rounded-xl flex-row items-center justify-center px-4 h-7`}
            >
              <CustomText classes="text-white text-right">
                {language === "tm" ? OrderStatus?.nameTm : OrderStatus?.nameRu}
              </CustomText>
            </View>
          </View>
          {DeliveryType ? (
            <Container
              title={t.deliveryType}
              text={
                language === "tm"
                  ? `${DeliveryType?.nameTm}/ ${DeliveryType?.price} M`
                  : `${DeliveryType?.nameRu}/ ${DeliveryType?.price} M`
              }
            />
          ) : (
            <></>
          )}
          <View className="bg-black border-b border-grey-600 flex-row items-center justify-between px-2 h-9 w-fulll">
            <CustomText classes="text-white">{t.productsSum} :</CustomText>
            <CustomText classes="text-base text-primary text-right font-bbold">
              {parseFloat(sum).toFixed(2)} M
            </CustomText>
          </View>
          <View className="bg-black border-b border-grey-600 flex-row items-center justify-between px-2 h-9 w-full">
            <CustomText classes="text-white">{t.deliveryPrice} :</CustomText>
            <CustomText classes="text-base text-primary text-right font-bbold">
              {DeliveryType ? (
                <>{parseFloat(DeliveryType?.price).toFixed(2) + " М"}</>
              ) : (
                <>{parseFloat(Town?.deliveryPrice).toFixed(2) + " М"}</>
              )}
            </CustomText>
          </View>
          <View className="bg-black border-0 rounded-b-xl border-grey-600 flex-row items-center justify-between p-2 h-9 w-full">
            <CustomText classes="text-white">{t.overallSum} :</CustomText>
            <CustomText classes="text-base text-primary text-right font-bbold">
              {DeliveryType ? (
                <>
                  {parseFloat(
                    Number(sum) + Number(DeliveryType?.price)
                  ).toFixed(2)}{" "}
                  M
                </>
              ) : (
                <>
                  {parseFloat(
                    Number(sum) + Number(Town?.deliveryPrice)
                  ).toFixed(2)}{" "}
                  M
                </>
              )}
            </CustomText>
          </View>
        </View>
        <View className="justify-center h-10">
          <CustomText classes="text-lg text-primary font-bbold">
            {t.products} :
          </CustomText>
        </View>
        <>
          {OrderItems?.map((item) => {
            const imageUrl = `${apiURL}/${item?.Product?.images[0]?.url}`;

            return (
              <View
                key={item.id}
                className="bg-black border border-grey-600 rounded-xl mb-2 px-2 min-h-[96px]"
              >
                <View className="flex-1 flex-row items-center">
                  <Image
                    source={imageUrl || icons.placeholder}
                    contentFit="cover"
                    className="border border-grey-600 rounded-xl mr-2 h-20 w-20"
                    transition={25}
                    placeholder={icons.placeholder}
                    placeholderContentFit="cover"
                  />
                  <View className="py-2 grow h-full">
                    <Pressable
                      className="flex-col justify-between active:opacity-70 h-full w-full"
                      onPress={() =>
                        router.navigate(`/product/${item?.Product?.barcode}`)
                      }
                    >
                      <CustomText
                        classes="text-base text-white max-w-[180px]"
                        numberOfLines={2}
                      >
                        {language === "tm"
                          ? item?.Product?.nameTm
                          : item?.Product?.nameRu}
                      </CustomText>
                      <CustomText classes="text-white">
                        {t.size} : {item?.Size?.value}
                      </CustomText>
                    </Pressable>
                  </View>
                  <View className="ml-auto mt-auto py-2">
                    <CustomText classes="text-end text-white font-bbold">
                      {item?.currentSellPrice} M
                    </CustomText>
                  </View>
                </View>
              </View>
            );
          })}
          {OrderStatus?.id === 1 || OrderStatus?.id === 2 ? (
            <Pressable
              onPress={() => setOrderCancelModalVisible(true)}
              className="bg-primary rounded-xl flex-row items-center justify-center active:bg-primary-700 mt-auto px-4 h-12 w-full"
            >
              <Image
                source={icons.cross}
                contentFit="contain"
                className="mr-2 h-5 w-5"
                tintColor="#ffffff"
              />
              <CustomText classes="font-bsemibold text-white">
                {t.cancel}
              </CustomText>
            </Pressable>
          ) : (
            <></>
          )}
        </>
        <Modal
          animationType="fade"
          transparent={true}
          visible={orderCancelModalVisible}
        >
          <View className="bg-black/30 flex-1 items-center justify-center">
            <View className="bg-dark border border-primary rounded-xl items-center space-y-2 pt-2 pb-4 px-4 w-72">
              <CustomText
                classes="text-lg text-white text-center"
                numberOfLines={2}
              >
                {t.cancelOrder}
              </CustomText>
              <CustomText
                classes="text-base text-white text-center"
                numberOfLines={2}
              >
                {t.cancelOrderWarning}
              </CustomText>
              <View className="rounded-xl flex-row justify-between items-center mt-4 h-10 w-full">
                <Pressable
                  onPress={() => {
                    setOrderCancelModalVisible(false);
                  }}
                  className="border border-grey-300 rounded-xl items-center justify-center h-full w-20"
                >
                  <CustomText classes="text-base text-white">{t.no}</CustomText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    handleOrderCancel();
                  }}
                  className="border border-grey-300 rounded-xl items-center justify-center h-full w-20"
                >
                  <CustomText classes="text-base text-white">
                    {t.yes}
                  </CustomText>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
        <View className="mb-2"></View>
      </ScrollView>
    </View>
  );
}
