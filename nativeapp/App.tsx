import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './lib/contexts/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import RootNavigator from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Loading component
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#000000' }}>VYSN</Text>
      <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8 }}>Loading...</Text>
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
        <NavigationContainer>
          <AppContent />
          <StatusBar style="dark" backgroundColor="#ffffff" />
        </NavigationContainer>
      </AuthProvider>
    </ErrorBoundary>
  );
}