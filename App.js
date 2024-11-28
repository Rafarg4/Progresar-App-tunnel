import React, {useEffect, useRef} from 'react';
import AppNavigation from './app/navigation/AppNavigation'
import ErrorBoundary from './app/components/ErrorBoundary';
import { startNotifications } from './app/recursos/Notificaciones';

function App(){
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(()=>{
    startNotifications(notificationListener, responseListener)
  }, [])
  return (
    <ErrorBoundary>
      <AppNavigation />
    </ErrorBoundary>
  )
}

export default App