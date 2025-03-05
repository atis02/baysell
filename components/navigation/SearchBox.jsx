import icons from "../../utils/icons";
import { useLanguageStore } from "../../utils/languageStore";
import { useState } from "react";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import { View, TextInput, Alert, Pressable } from "react-native";

export default function SearchBox({ initialQuery }) {
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery || "");
  const { getTranslations } = useLanguageStore();
  const t = getTranslations();

  const handleSearch = () => {
    if (query === "") {
      return Alert.alert(
        "Gözleg sözi ýok",
        "Siz harydyň ýa-da brendiň adyny girizip bilersiňiz"
      );
    }

    if (pathname.startsWith("/search")) {
      router.setParams({ searchquery: query });
    } else {
      router.push(`/search/${query}`);
    }
    setQuery("");
  };

  return (
    <View className="border border-grey rounded-xl flex-row items-center space-x-8 focus:border-primary mt-2 px-2 h-12 w-full">
      <Pressable
        className="rounded-l-2xl items-center justify-center absolute left-0 h-full w-10"
        onPress={handleSearch}
      >
        <Image
          tintColor="#ffffff"
          source={icons.search}
          className="w-4 h-4"
          contentFit="contain"
        />
      </Pressable>
      <TextInput
        className="flex-1 text-white font-bregular"
        value={query}
        placeholder={t.search}
        placeholderTextColor="#f7f7f7"
        onChangeText={(e) => setQuery(e)}
        onSubmitEditing={handleSearch}
      />
    </View>
  );
}
