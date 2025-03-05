import ProductContainer from "../../../components/containers/ProductContainer";
import { CustomText } from "../../../utils/CustomText";
import { useCustomerStore } from "../../../utils/customerStore";
import { useLanguageStore } from "../../../utils/languageStore";
import { View, ScrollView, Dimensions } from "react-native";

export default function WishListScreen() {
  const { wishlist } = useCustomerStore();
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();

  const screenWidth = Dimensions.get("screen").width;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="bg-black px-2 h-full"
    >
      <View className="flex-row items-center h-10">
        <View className="justify-center items-start">
          <CustomText classes="font-bbold text-primary text-lg">
            {t.wishlist}
          </CustomText>
        </View>
      </View>
      <>
        {wishlist?.length > 0 ? (
          <View>
            <View className="flex-row flex-wrap items-center">
              {wishlist?.map((product) => {
                return (
                  <View
                    key={product.barcode}
                    className={`mb-2 px-1 ${
                      screenWidth < 500 ? "w-1/3" : "w-1/4"
                    }`}
                  >
                    <ProductContainer productData={product} />
                  </View>
                );
              })}
            </View>
            <View className="mb-2"></View>
          </View>
        ) : (
          <CustomText classes="text-base text-white" numberOfLines={2}>
            {t.addToWishlist}
          </CustomText>
        )}
      </>
    </ScrollView>
  );
}
