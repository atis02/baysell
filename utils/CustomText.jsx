import { Text } from "react-native";

export const CustomText = ({ children, classes, numberOfLines, onPress }) => {
  return (
    <Text
      onPress={onPress}
      numberOfLines={numberOfLines || 1}
      className={`font-bregular ${classes}`}
      ellipsizeMode="tail"
    >
      {children}
    </Text>
  );
};
