import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { auth } from './config/firebase';

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const inAuthGroup = segments[0] === '(auth)';

      if (!user && !inAuthGroup) {
        router.replace('/login');
      } else if (user && inAuthGroup) {
        router.replace('/(tabs)');
      }
    });

    return () => unsubscribe();
  }, [segments]);

  return (
    <Stack>
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
