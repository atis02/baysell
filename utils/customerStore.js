import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useCustomerStore = create(
  persist(
    (set, get) => ({
      customer: {},
      updateCustomerData: (data) => set((state) => ({ customer: data })),
      wishlist: [],
      shoppingCart: [],
      addToWishlist: (item) => {
        const wishlist = get().wishlist;
        const existingItemIndex = wishlist.findIndex(
          (wishlistItem) => wishlistItem.barcode === item.barcode
        );
        if (existingItemIndex !== -1) {
          wishlist.splice(existingItemIndex, 1);
        }
        set({ wishlist: [...wishlist, item] });
      },
      removeFromWishlist: (barcode) =>
        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.barcode !== barcode),
        })),
      addToShoppingCart: (item) => {
        const shoppingCart = get().shoppingCart;
        const uniqueId = `${item.barcode}-${item.selectedSize.id}`;

        const existingItemIndex = shoppingCart.findIndex(
          (cartItem) => cartItem.uniqueId === uniqueId
        );

        if (existingItemIndex !== -1) {
          return;
        }

        const newCartItem = {
          uniqueId,
          quantity: 1,
          selectedSize: item.selectedSize,
          productId: item.id,
        };

        set({ shoppingCart: [...shoppingCart, newCartItem] });
      },
      updateShoppingCartQuantity: (itemUniqueId, quantity) => {
        const shoppingCart = get().shoppingCart;
        const updatedCart = shoppingCart
          .map((cartItem) =>
            cartItem.uniqueId === itemUniqueId
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem
          )
          .filter((cartItem) => cartItem.quantity > 0);
        set({ shoppingCart: updatedCart });
      },
      setShoppingCartQuantity: (itemUniqueId, quantity) => {
        const shoppingCart = get().shoppingCart;
        const updatedCart = shoppingCart
          .map((cartItem) =>
            cartItem.uniqueId === itemUniqueId
              ? { ...cartItem, quantity }
              : cartItem
          )
          .filter((cartItem) => cartItem.quantity > 0);
        set({ shoppingCart: updatedCart });
      },
      setShoppingCartQuantityByProductId: (productId, sizeId, quantity) => {
        const shoppingCart = get().shoppingCart;
        const updatedCart = shoppingCart
          .map((cartItem) =>
            cartItem.productId === productId &&
            cartItem.selectedSize.id === sizeId
              ? { ...cartItem, quantity }
              : cartItem
          )
          .filter((cartItem) => cartItem.quantity > 0);
        set({ shoppingCart: updatedCart });
      },
      removeFromShoppingCart: (itemUniqueId) =>
        set((state) => ({
          shoppingCart: state.shoppingCart.filter(
            (item) => item.uniqueId !== itemUniqueId
          ),
        })),
      clearWishlist: () => set({ wishlist: [] }),
      clearShoppingCart: () => set({ shoppingCart: [] }),
    }),
    {
      name: "local-customer-data",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
