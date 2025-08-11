import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';

export type AuthStackParamList = {
  Login: undefined;
  Registration: undefined;
  EmailVerification: { email: string; password?: string };
};

const AuthStack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <AuthStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' }
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen 
        name="Registration" 
        component={RegistrationScreen}
      />
      <AuthStack.Screen 
        name="EmailVerification" 
        component={EmailVerificationScreen}
        options={{ 
          headerShown: false,
          gestureEnabled: false, // Verhindert zurück-wischen
        }}
      />
    </AuthStack.Navigator>
  );
}