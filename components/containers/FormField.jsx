import icons from "../../utils/icons";
import { CustomText } from "../../utils/CustomText";
import { useState } from "react";
import { View, TextInput, Pressable, Image } from "react-native";

const FormField = ({
  icon,
  value,
  handleChangeText,
  isPasswordField,
  isPhoneNumberField,
  placeholder,
  placeholderTextColor,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="rounded-xl flex flex-row items-center focus:border-primary px-2 h-12 w-full">
      <View className="items-center justify-center h-10 w-10">
        {icon ? (
          <Image
            source={icon}
            className="mr-2 w-5 h-5"
            resizeMode="contain"
            tintColor="#ffffff"
          />
        ) : (
          <></>
        )}
      </View>
      <View className="border-b border-grey-400 flex flex-row items-center focus:border-primary px-2 h-12 grow">
        {isPhoneNumberField === true ? (
          <CustomText classes="text-white text-base mr-2">+993</CustomText>
        ) : (
          <></>
        )}
        <TextInput
          className="flex-1 font-bregular text-white text-base"
          value={value}
          onChangeText={handleChangeText}
          secureTextEntry={isPasswordField === true && !showPassword}
          placeholder={placeholder}
          placeholderTextColor="#a9a9a9"
        />
        {isPasswordField === true && (
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={!showPassword ? icons.eye : icons.eyeCrossed}
              className="w-5 h-5"
              resizeMode="contain"
              tintColor="#ffffff"
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default FormField;
