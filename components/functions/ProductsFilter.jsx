import icons from "../../utils/icons";
import { CustomText } from "../../utils/CustomText";
import { useLanguageStore } from "../../utils/languageStore";
import { useState, useEffect } from "react";
import { Image } from "expo-image";
import { Modal, View, Pressable } from "react-native";

const sortByOptins = [
  {
    id: 1,
    nameTm: "Arzandan gymmada",
    nameRu: "Сначала низкие цены",
    value: "asc",
    icon: icons.down,
  },
  {
    id: 2,
    nameTm: "Gymmatdan arzana",
    nameRu: "Сначала дорогие цены",
    value: "desc",
    icon: icons.up,
  },
];

export default function ProductsFilter({ onSortChange, sortValue }) {
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [selectedSortValue, setSelectedSortValue] = useState(sortValue);
  const { language, getTranslations } = useLanguageStore();
  const t = getTranslations();

  useEffect(() => {
    setSelectedSortValue(sortValue);
  }, [sortValue]);

  const handleSortSelection = (id, value) => {
    setSelectedSortValue(id);
    onSortChange(value);
    setSortModalVisible(false);
  };

  return (
    <View className="w-full">
      <Pressable
        onPress={() => {
          setSortModalVisible(true);
        }}
        className="bg-primary rounded-xl flex-row justify-center items-center active:bg-primary-700 px-4 h-10"
      >
        <Image
          source={icons.filter}
          contentFit="contain"
          className="mr-2 h-4 w-4"
          tintColor="#ffffff"
        />
        <CustomText classes="text-white">{t.sortBy}</CustomText>
      </Pressable>
      <Modal
        transparent={true}
        visible={sortModalVisible}
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View className="flex-1 bg-dark/30 justify-center items-center">
          <View className="bg-dark border border-grey-400 rounded-xl items-center space-y-2 pt-2 pb-4 px-4 h-auto w-[300px]">
            <View className="flex-row justify-between items-center w-full">
              <CustomText classes="text-base text-white">
                {t.sorting}
              </CustomText>
              <Pressable
                onPress={() => setSortModalVisible(false)}
                className="border border-gray-300 rounded-xl items-center justify-center active:opacity-50 ml-auto h-9 w-9"
              >
                <Image
                  source={icons.cross}
                  contentFit="contain"
                  className="h-5 w-5"
                  tintColor="#ffffff"
                />
              </Pressable>
            </View>
            <View className="rounded-xl items-center space-y-2 w-full">
              {sortByOptins?.map((item) => (
                <View className="w-full" key={item.id}>
                  <Pressable
                    onPress={() => handleSortSelection(item.id, item.value)}
                    className={`border rounded-xl flex flex-row justify-center items-center active:opacity-80 h-12 w-full ${
                      selectedSortValue === item.id
                        ? "border-primary bg-primary"
                        : "border-grey-200 bg-dark"
                    }`}
                  >
                    <Image
                      source={item.icon}
                      contentFit="contain"
                      className="mr-2 h-4 w-4"
                      tintColor="#ffffff"
                    />
                    <CustomText classes="text-white">
                      {language === "tm" ? item.nameTm : item.nameRu}
                    </CustomText>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
