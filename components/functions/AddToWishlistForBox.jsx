import icons from "../../utils/icons";
import { useCustomerStore } from "../../utils/customerStore";
import { Image } from "expo-image";
import { Pressable } from "react-native";

export const AddToWishlistForBox = ({ product }) => {
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
      className="bg-white border border-grey-200 rounded-xl items-center justify-center absolute top-[2px] right-[2px] h-8 w-8"
    >
      {isItemInWishlist ? (
        <Image
          source={icons.heartFill}
          contentFit="contain"
          className="h-5 w-5"
          transition={50}
          tintColor="#be2617"
        />
      ) : (
        <Image
          source={icons.heart}
          contentFit="contain"
          className="h-5 w-5"
          transition={50}
          tintColor="#be2617"
        />
      )}
    </Pressable>
  );
};
