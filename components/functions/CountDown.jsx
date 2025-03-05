import { useState, useEffect } from "react";
import { CustomText } from "../../utils/CustomText";
import { ActivityIndicator } from "react-native";
import { LoadingSmall } from "../../utils/LoadingStates";

const CountdownTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date(endDate);
      const difference = end - now;

      if (difference > 0) {
        const totalHours = Math.floor(difference / (1000 * 60 * 60));
        const hours = totalHours % 24;
        const minutes = Math.floor((difference / (1000 * 60)) % 60);

        setTimeLeft(
          `${totalHours.toString().padStart(2, "0")}ч ${minutes
            .toString()
            .padStart(2, "0")}м`
        );
        setLoading(false);
      } else {
        setTimeLeft("Expired");
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <>
      {loading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <CustomText classes="text-white font-bbitalic">{timeLeft}</CustomText>
      )}
    </>
  );
};

export default CountdownTimer;
