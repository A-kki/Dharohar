import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';
import { SplashLoader } from '../src/components/SplashLoader';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.parchment }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="dark" backgroundColor={colors.parchment} />
      {!splashDone && <SplashLoader onDone={() => setSplashDone(true)} />}
    </View>
  );
}
