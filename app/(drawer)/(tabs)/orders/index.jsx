import { apiURL } from "../../../../utils/utils";
import { CustomText } from "../../../../utils/CustomText";
import { LoadingLarge } from "../../../../utils/LoadingStates";
import { useFetcher } from "../../../../utils/utils";
import { useCustomerStore } from "../../../../utils/customerStore";
import { useLanguageStore } from "../../../../utils/languageStore";
import { router, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { View, ScrollView, RefreshControl, Pressable } from "react-native";

const statusClasses = {
  1: "bg-grey-500",
  2: "bg-blue-600",
  3: "bg-yellow-500",
  4: "bg-green-600",
  5: "bg-primary",
};

const Container = ({
  text,
  onPress,
  orderNo,
  orderDateText,
  orderDateValue,
  paymentText,
  paymentValue,
  orderStatusText,
  orderStatus,
  orderStatusId,
  orderTimeText,
  orderTimeValue,
  orderSum,
  containerClasses,
  sum,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className={`bg-black border border-grey-600 rounded-xl active:opacity-80 mb-2 h-fit ${containerClasses}`}
    >
      <View className="bg-primary border-b border-grey-600 rounded-t-xl flex-row items-center justify-between px-2 h-9 w-full">
        <CustomText classes="text-base text-white">{text}</CustomText>
        <CustomText classes="text-base text-white">{orderNo}</CustomText>
      </View>
      <View className="flex-row items-center p-2">
        <View className="w-1/2">
          <CustomText classes="text-white">{orderDateText}</CustomText>
          <CustomText classes="text-white">{orderDateValue}</CustomText>
        </View>
        <View className="w-1/2">
          <CustomText classes="text-white">{orderStatusText}</CustomText>
          <CustomText
            classes={`${
              statusClasses[orderStatusId] || "bg-primary"
            }  rounded-xl text-white px-1`}
          >
            {orderStatus}
          </CustomText>
        </View>
      </View>
      <View className="flex-row items-center p-2">
        <View className="w-1/2">
          <CustomText classes="text-white">{paymentText}</CustomText>
          <CustomText classes="text-white">{paymentValue}</CustomText>
        </View>
        <View className="w-1/2">
          <CustomText classes="text-white">{orderTimeText}</CustomText>
          <CustomText classes="text-white">{orderTimeValue}</CustomText>
        </View>
      </View>
      <View className="border-t border-grey-600 flex-row items-center justify-between px-2 h-9 w-full">
        <CustomText classes="text-base text-primary font-bsemibold">
          {sum}
        </CustomText>
        <CustomText classes="text-base text-primary font-bsemibold">
          {" "}
          {orderSum} TMT
        </CustomText>
      </View>
    </Pressable>
  );
};

export default function OrdersScreen() {
  const { language, getTranslations } = useLanguageStore();
  const { customer } = useCustomerStore();
  const t = getTranslations();

  const {
    data: response = [],
    error,
    isLoading,
    mutate,
  } = useFetcher(`${apiURL}/user/fetch/customer/${customer?.customerId}`);

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      mutate();
    }, [mutate])
  );

  const onRefresh = () => {
    setRefreshing(true);
    mutate()
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  };

  if (isLoading)
    return (
      <View className="bg-black pt-4 h-full">
        <LoadingLarge />
      </View>
    );
  if (error) return <></>;

  return (
    <ScrollView
      className="bg-black px-2"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="flex-row items-center h-10">
        <View className="justify-center items-start">
          <CustomText classes="font-bbold text-primary text-lg">
            {t.orders}
          </CustomText>
        </View>
      </View>
      <>
        {response?.Orders?.length > 0 ? (
          <View>
            {response?.Orders?.map((item) => {
              return (
                <Container
                  text={t.orderNumber}
                  key={item?.id}
                  onPress={() => router.navigate(`/orders/view/${item.id}`)}
                  orderNo={item?.id}
                  orderDateText={t.orderCreatedAt}
                  orderDateValue={new Date(item?.createdAt).toLocaleDateString(
                    "en-GB",
                    {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }
                  )}
                  orderStatusId={item?.OrderStatus?.id}
                  orderStatusText={t.orderStatus}
                  orderStatus={
                    language === "tm"
                      ? item?.OrderStatus?.nameTm
                      : item?.OrderStatus?.nameRu
                  }
                  paymentText={t.paymentType}
                  paymentValue={
                    language === "tm"
                      ? item?.PaymentType?.nameTm
                      : item?.PaymentType?.nameRu
                  }
                  orderTimeText={t.deliveryTime}
                  orderTimeValue={
                    item?.OrderTime ? (
                      <>
                        {language === "tm"
                          ? item?.OrderTime?.nameTm +
                            " / " +
                            item?.OrderTime?.time
                          : item?.OrderTime?.nameRu +
                            " / " +
                            item?.OrderTime?.time}
                      </>
                    ) : (
                      <>{t.outOfCity}</>
                    )
                  }
                  sum={t.sum}
                  orderSum={
                    item?.Town
                      ? (
                          parseFloat(item?.sum) +
                          parseInt(item?.Town.deliveryPrice)
                        ).toFixed(2)
                      : (
                          parseFloat(item?.sum) +
                          parseInt(item?.DeliveryType?.price)
                        ).toFixed(2)
                  }
                />
              );
            })}
          </View>
        ) : (
          <CustomText
            classes="font-nsemibold text-base text-white"
            numberOfLines={2}
          >
            {t.noOrders}
          </CustomText>
        )}
      </>
    </ScrollView>
  );
}
