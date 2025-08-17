import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CartProvider } from "./Components/CartContent";
import { SignupProvider } from "../context/SignupContext";

export default function RootLayout() {
  return (
    <SignupProvider>
      <CartProvider>
        <SafeAreaProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="screen/LoginScreen" options={{ headerShown: false }} />
            <Stack.Screen name="screen/SigninScreen" options={{ headerShown: false }} />
            <Stack.Screen name="screen/SigninScreen1" options={{ headerShown: false }} />
            <Stack.Screen name="screen/SigninScreen2" options={{ headerShown: false }} />
            <Stack.Screen name="tabs/BottomTab" options={{ headerShown: false }} />
            <Stack.Screen name="Components/MainDrawer" options={{ headerShown: false }} />
            <Stack.Screen name="user/HomeScreen" options={{ headerShown: false }} />
            <Stack.Screen name="user/ShoppingCart" options={{ headerShown: false }} />
            <Stack.Screen name="user/PaymentScreen" options={{ headerShown: false }} />
            <Stack.Screen name="user/Receipt" options={{ headerShown: false }} />

          </Stack>
        </SafeAreaProvider>
      </CartProvider>
    </SignupProvider>
  );
}
