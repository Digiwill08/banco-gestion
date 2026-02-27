import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { useBankAuth } from "@/lib/bank-auth-context";

export default function IndexScreen() {
  const { isAuthenticated, loading } = useBankAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login" as any);
      }
    }
  }, [loading, isAuthenticated]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1A3A5C" }}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
}
