import icons from "../../../utils/icons";
import NavBar from "../../../components/navigation/NavBar";
import { CustomText } from "../../../utils/CustomText";
import { useCustomerStore } from "../../../utils/customerStore";
import { useLanguageStore } from "../../../utils/languageStore";
import { Tabs, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useExitAppConfirmation from "../../../components/navigation/ExitHandler";

const TabIcon = ({ name, icon, focused, quantity }) => {
  return (
    <View
      className={
        focused
          ? "bg-[#ff0000] rounded-full items-center justify-center relative h-14 w-14"
          : "items-center justify-center relative"
      }
    >
      {quantity ? (
        <View
          className={`bg-primary rounded-full items-center justify-center absolute h-5 w-5 ${
            focused ? "top-0 right-2" : "-top-4 -right-1"
          }`}
        >
          <CustomText classes="text-white text-xs">{quantity}</CustomText>
        </View>
      ) : (
        <></>
      )}
      <Image
        source={icon}
        resizeMode="contain"
        className={focused ? "h-5 w-5" : "h-4 w-4"}
        tintColor="#ffffff"
      />
      {focused ? null : (
        <CustomText classes="text-white text-[10px]">{name}</CustomText>
      )}
    </View>
  );
};

export default function MainTabLayout() {
  const { shoppingCart } = useCustomerStore();
  useExitAppConfirmation();

  let totalSum = 0;
  shoppingCart.forEach((product) => {
    const quantity = parseFloat(product.quantity) || 0;
    const sellPrice = parseFloat(product.sellPrice) || 0;
    totalSum += quantity * sellPrice;
  });

  const { getTranslations } = useLanguageStore();
  const t = getTranslations();

  return (
    <SafeAreaView className="bg-black flex-1">
      <NavBar />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#212125",
            borderTopWidth: Platform.OS === "ios" ? 1 : 0,
            borderTopColor: Platform.OS === "ios" ? "#212125" : "",
            height: 64,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: Platform.OS === "ios" ? 28 : 0,
          },
        }}
        initialRouteName="/"
        backBehavior="history"
      >
        <Tabs.Screen
          name="index"
          href="index"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={t.homePage}
                focused={focused}
                color={color}
                icon={icons.home}
              />
            ),
          }}
          listeners={{
            tabPress: () => {
              router.navigate("/");
            },
          }}
        />
        <Tabs.Screen
          name="categories"
          href="categories"
          options={{
            title: "Categories",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={t.categories}
                focused={focused}
                color={color}
                icon={icons.categories}
              />
            ),
          }}
          listeners={{
            tabPress: () => {
              router.navigate("/categories");
            },
          }}
        />
        <Tabs.Screen
          name="cart"
          href="cart"
          options={{
            title: "Cart",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={t.shoppingcart}
                focused={focused}
                color={color}
                icon={icons.cart}
                quantity={shoppingCart?.length > 0 ? shoppingCart.length : "0"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="wishlist"
          href="wishlist"
          options={{
            title: "Wishlist",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={t.wishlist}
                focused={focused}
                color={color}
                icon={icons.heartBtn}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          href="orders"
          options={{
            title: "Orders",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={t.orders}
                focused={focused}
                color={color}
                icon={icons.listcheck}
              />
            ),
          }}
          listeners={{
            tabPress: () => {
              router.navigate("/orders");
            },
          }}
        />
        <Tabs.Screen
          name="about"
          options={{
            headerShown: false,
            href: null,
          }}
        />
        <Tabs.Screen
          name="usage"
          options={{
            headerShown: false,
            href: null,
          }}
        />
        <Tabs.Screen
          name="products"
          options={{
            headerShown: false,
            href: null,
          }}
        />
        <Tabs.Screen
          name="newproducts"
          options={{
            headerShown: false,
            href: null,
          }}
        />
        <Tabs.Screen
          name="sale"
          options={{
            headerShown: false,
            href: null,
          }}
        />
        <Tabs.Screen
          name="search/[searchquery]"
          options={{
            headerShown: false,
            href: null,
          }}
        />
        <Tabs.Screen
          name="product"
          options={{
            headerShown: false,
            href: null,
          }}
        />
      </Tabs>
      <StatusBar
        backgroundColor="#070417"
        style="light"
        translucent={Platform.OS === "ios" ? true : false}
      />
    </SafeAreaView>
  );
}
