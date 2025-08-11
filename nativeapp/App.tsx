import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './lib/contexts/AuthContext';
import { CartProvider } from './lib/contexts/CartContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import RootNavigator from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import './lib/i18n/i18n';

// Loading component with static VYSN logo
function LoadingScreen() {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#ffffff' 
    }}>
      <Image 
        source={require('./assets/logo.png')} 
        style={{ 
          width: 120, 
          height: 120 
        }}
        resizeMode="contain"
      />
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

  const { isAuthenticated, loading, initialized, needsConsent, user } = auth;

  // Show loading screen while initializing
  if (!initialized || loading) {
    return <LoadingScreen />;
  }

  // Show appropriate navigator based on auth state and consent status
  const userNeedsConsent = needsConsent();
  
  console.log('🏠 AppContent - isAuthenticated:', isAuthenticated, 'needsConsent:', userNeedsConsent);
  console.log('🏠 AppContent - user profile analytics_consent:', user?.profile?.analytics_consent);
  
  if (!isAuthenticated || userNeedsConsent) {
    console.log('🔐 Showing AuthNavigator');
    return <AuthNavigator />;
  }

  // Fully authenticated and consent given - show main app
  console.log('🏡 Showing RootNavigator (main app)');
  return <RootNavigator />;
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