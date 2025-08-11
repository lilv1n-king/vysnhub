import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
// import RegistrationScreen from '../screens/RegistrationScreen'; // Deaktiviert
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import ConsentScreen from '../screens/ConsentScreen';
import { useAuth } from '../../lib/contexts/AuthContext';

export type AuthStackParamList = {
  Login: undefined;
  // Registration: undefined; // Deaktiviert
  EmailVerification: { email: string; password?: string };
  Consent: undefined;
};

const AuthStack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  const auth = useAuth();
  
  // Determine initial route based on auth state
  const getInitialRouteName = (): keyof AuthStackParamList => {
    if (auth?.isAuthenticated && auth?.needsConsent()) {
      return 'Consent';
    }
    return 'Login';
  };

  return (
    <AuthStack.Navigator 
      initialRouteName={getInitialRouteName()}
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' }
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      {/* <AuthStack.Screen 
        name="Registration" 
        component={RegistrationScreen}
      /> */}
      <AuthStack.Screen 
        name="EmailVerification" 
        component={EmailVerificationScreen}
        options={{ 
          headerShown: false,
          gestureEnabled: false, // Verhindert zurück-wischen
        }}
      />
      <AuthStack.Screen 
        name="Consent" 
        component={ConsentScreen}
        options={{ 
          headerShown: false,
          gestureEnabled: false, // Verhindert zurück-wischen
        }}
      />
    </AuthStack.Navigator>
  );
}