import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Image, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './lib/contexts/AuthContext';
import { CartProvider } from './lib/contexts/CartContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import RootNavigator from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import './lib/i18n/i18n';

// Loading component with rotating VYSN logo
function LoadingScreen() {
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();
    
    return () => rotateAnimation.stop();
  }, [rotateValue]);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#ffffff' 
    }}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Image 
          source={require('./assets/logo.png')} 
          style={{ 
            width: 120, 
            height: 120 
          }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

// Main app content with auth state handling
function AppContent() {
  const auth = useAuth();
  
  // Safety check - this should never happen but prevents crashes
  if (!auth) {
    console.error('Auth context not available');
    return <LoadingScreen />;
  }

  const { isAuthenticated, loading, initialized } = auth;

  // Show loading screen while initializing
  if (!initialized || loading) {
    return <LoadingScreen />;
  }

  // Show appropriate navigator based on auth state
  return isAuthenticated ? <RootNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <AppContent />
            <StatusBar style="dark" backgroundColor="#ffffff" />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}