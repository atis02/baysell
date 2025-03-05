import icons from "../../utils/icons";
import { apiURL } from "../../utils/utils";
import { CustomText } from "../../utils/CustomText";
import { useLanguageStore } from "../../utils/languageStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { Modal, View, Pressable, Platform, Linking } from "react-native";
import Constants from "expo-constants";

export default function StartUpAdModal({
  languageIsVisible,
  setLanguageIsVisible,
  isAllowed,
  noInternet,
}) {
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [shuffledAds, setShuffledAds] = useState([]);
  const [countdown, setCountdown] = useState(3);
  const [modalVisible, setModalVisible] = useState(false);
  const [forceUpdateRequired, setForceUpdateRequired] = useState(false);
  const { getTranslations, changeLanguage, language, modalShown } =
    useLanguageStore();
  const t = getTranslations();

  const checkForUpdate = async () => {
    try {
      const currentVersion = Constants.expoConfig?.version || "1.0.0";
      const response = await fetch(`${apiURL}/info/get`);
      const data = await response.json();

      const serverVersion =
        Platform.OS === "ios"
          ? data.iosCurrentVersion
          : data.androidCurrentVersion;

      if (currentVersion && serverVersion) {
        const current = currentVersion.split(".").map(Number);
        const server = serverVersion.split(".").map(Number);

        let needsUpdate = false;
        for (let i = 0; i < Math.max(current.length, server.length); i++) {
          const currentPart = current[i] || 0;
          const serverPart = server[i] || 0;

          if (serverPart > currentPart) {
            needsUpdate = true;
            break;
          } else if (currentPart > serverPart) {
            break;
          }
        }

        if (needsUpdate) {
          setForceUpdateRequired(true);
          setModalVisible(false);
        }
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
  };

  useEffect(() => {
    checkForUpdate();
  }, []);

  useEffect(() => {
    if (!forceUpdateRequired) {
      const fetchAds = async () => {
        try {
          const response = await fetch(`${apiURL}/popup/active`);
          const result = await response.json();
          const ads = result?.popUps || [];
          const shuffled = [...ads].sort(() => 0.5 - Math.random());
          setShuffledAds(shuffled);
        } catch (error) {
          console.error(error);
        }
      };

      fetchAds();
    }
  }, [forceUpdateRequired]);

  useEffect(() => {
    if (!modalShown && !language) {
      setLanguageIsVisible(true);
    }
  }, [modalShown, language]);

  const handleLanguageSelection = (lang) => {
    changeLanguage(lang);
    setLanguageIsVisible(false);
  };

  useEffect(() => {
    if (language && modalShown) {
      setModalVisible(shuffledAds.length > 0);
    }
  }, [language, modalShown, shuffledAds]);

  useEffect(() => {
    if (modalVisible && shuffledAds.length > 0) {
      setCountdown(3);
      setIsButtonEnabled(false);

      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            setIsButtonEnabled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [modalVisible, shuffledAds]);

  const closeModal = () => {
    setModalVisible(false);
  };

  const adsToShow = shuffledAds.slice(0, 2);

  const handleUpdatePress = () => {
    let url;
    if (Platform.OS === "ios") {
      url = "https://apps.apple.com/tm/app/baystyle-market/id6736981626";
    } else if (Platform.OS === "android") {
      url =
        "https://play.google.com/store/apps/details?id=com.alemtilsimat.baysel";
    }

    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={
          languageIsVisible && !modalShown && !language && !forceUpdateRequired
        }
      >
        <View className="bg-black flex-1 items-center justify-center px-8">
          <Image
            source={icons.defaultLogo}
            contentFit="contain"
            className="h-52 w-52"
          />
          <CustomText classes="text-xl text-white font-bbold mb-4">
            Добро пожаловать в BaySel!
          </CustomText>
          <CustomText classes="text-base text-white font-bsemibold mb-2">
            Выберите язык
          </CustomText>
          <Pressable
            onPress={() => handleLanguageSelection("tm")}
            className="border border-gray-400 rounded-xl flex-row items-center mb-2 px-2 h-12 w-full"
          >
            <Image source={icons.turkmenistan} className="mr-4 h-10 w-10" />
            <CustomText classes="font-bsemibold text-base text-white">
              Türkmen
            </CustomText>
          </Pressable>
          <Pressable
            onPress={() => handleLanguageSelection("ru")}
            className="border border-gray-400 rounded-xl flex-row items-center px-2 h-12 w-full"
          >
            <Image source={icons.russia} className="mr-4 h-10 w-10" />
            <CustomText classes="font-bsemibold text-base text-white">
              Русский
            </CustomText>
          </Pressable>
        </View>
      </Modal>
      <Modal
        visible={
          modalVisible &&
          shuffledAds.length > 0 &&
          isAllowed &&
          noInternet === false &&
          !forceUpdateRequired
        }
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View className="bg-black/70 flex-1 justify-center items-center">
          <View className="rounded-xl pb-8 h-fit">
            {isButtonEnabled ? (
              <Pressable
                onPress={closeModal}
                className="border border-white rounded-xl items-center justify-center active:opacity-50 ml-auto mb-2 h-8 w-8"
              >
                <Image
                  source={icons.cross}
                  contentFit="contain"
                  className="h-6 w-6"
                  tintColor="#ffffff"
                />
              </Pressable>
            ) : (
              <View className="border border-white rounded-xl items-center justify-center ml-auto mb-2 h-8 w-8">
                <CustomText classes="text-white text-lg">
                  {countdown}
                </CustomText>
              </View>
            )}
            <Pressable
              onPress={() => {
                if (!adsToShow[0].url) {
                  return;
                } else if (adsToShow[0].categoryId === adsToShow[0]?.url) {
                  router.navigate(`/categories/${adsToShow[0].categoryId}`);
                } else if (adsToShow[0].subCategoryId === adsToShow[0]?.url) {
                  router.navigate(
                    `/categories/subcategories/${adsToShow[0].subCategoryId}`
                  );
                } else if (adsToShow[0].barcode === adsToShow[0]?.url) {
                  router.navigate(`/product/${adsToShow[0].barcode}`);
                }
                closeModal();
              }}
              className="rounded-xl relative h-[500px] w-[250px]"
            >
              {adsToShow[0] && (
                <Image
                  source={{
                    uri: `${apiURL}/${adsToShow[0]?.posterImage}`,
                  }}
                  contentFit="contain"
                  className="rounded-xl h-full w-full"
                  transition={100}
                />
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        visible={forceUpdateRequired && isAllowed}
        animationType="fade"
        transparent={true}
        statusBarTranslucent
      >
        <View className="bg-black flex-1 items-center justify-center">
          <View className="border border-grey-600 rounded-xl items-center space-y-2 pt-2 pb-4 px-4 w-72">
            <CustomText classes="text-lg text-white font-nbold mb-2">
              {t.updateAvailable}
            </CustomText>
            <CustomText classes="text-white text-center mb-2" numberOfLines={4}>
              {t.updateRequiredMessage}
            </CustomText>
            <Pressable
              onPress={handleUpdatePress}
              className="bg-primary rounded-xl flex-row items-center justify-center h-11 w-full"
            >
              <CustomText classes="font-nsemibold text-base text-white">
                {t.download}
              </CustomText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
