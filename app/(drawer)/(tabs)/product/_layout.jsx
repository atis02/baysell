import { Stack } from "expo-router";

export default () => {
  return (
    <Stack>
      <Stack.Screen name="[barcode]" options={{ headerShown: false }} />
    </Stack>
  );
};
