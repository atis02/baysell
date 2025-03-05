import icons from "../../utils/icons";
import { useCustomerStore } from "../../utils/customerStore";
import { Image } from "expo-image";
import { Pressable } from "react-native";

export const AddToWishlist = ({ product }) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useCustomerStore();

  const isItemInWishlist = wishlist.some(
    (item) => item?.barcode === product?.barcode
  );

  const handlePress = () => {
    if (isItemInWishlist) {
      removeFromWishlist(product?.barcode);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="rounded-xl items-center justify-center min-h-10 min-w-10"
    >
      {isItemInWishlist ? (
        <Image
          source={icons.heartFill}
          contentFit="contain"
          className="h-6 w-6"
          transition={100}
          tintColor="#be2617"
        />
      ) : (
        <Image
          source={icons.heart}
          contentFit="contain"
          className="h-6 w-6"
          transition={100}
          tintColor="#ffffff"
        />
      )}
    </Pressable>
  );
};
