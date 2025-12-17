import React, {useEffect, useRef} from 'react';
import AppNavigation from './app/navigation/AppNavigation';
import ErrorBoundary from './app/components/ErrorBoundary';
import { startNotifications } from './app/recursos/Notificaciones';

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Mostrar notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Crear canal para Android
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Notificaciones',
    importance: Notifications.AndroidImportance.MAX,
    sound: true,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

// ✅ FALTA ESTO: pedir permiso
async function requestAndroidNotificationPermission() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
}

function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    requestAndroidNotificationPermission(); // 👈 AGREGADO
    startNotifications(notificationListener, responseListener);
  }, []);

  return (
    <ErrorBoundary>
      <AppNavigation />
    </ErrorBoundary>
  );
}

export default App;
