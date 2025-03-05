import Toast from "react-native-root-toast";
import { styled } from "nativewind";

const StyledToast = styled(Toast);

const throwToast = (message = {}) => {
  Toast.show(message, {
    duration: 500,
    position: Toast.positions.BOTTOM,
    animation: true,
    hideOnPress: true,
    delay: 0,
    containerStyle: {
      backgroundColor: "#be2617",
      borderRadius: 8,
      padding: 10,
      marginBottom: 48,
    },
    textStyle: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "Rubik-Regular",
    },
  });
};

const CustomToast = ({ message, options }) => {
  return <StyledToast {...options}>{message}</StyledToast>;
};

export { throwToast, CustomToast };
