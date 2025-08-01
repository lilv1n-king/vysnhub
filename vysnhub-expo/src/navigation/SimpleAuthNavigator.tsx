import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SimpleLoginScreen from '../screens/SimpleLoginScreen';
import SimpleRegisterScreen from '../screens/SimpleRegisterScreen';

const AuthStack = createStackNavigator();

export default function SimpleAuthNavigator() {
  return (
    <AuthStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' }
      }}
    >
      <AuthStack.Screen name="SimpleLogin" component={SimpleLoginScreen} />
      <AuthStack.Screen name="SimpleRegister" component={SimpleRegisterScreen} />
    </AuthStack.Navigator>
  );
}