import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import SettingsScreen from '../screens/SettingsScreen';
import CheckoutScreen from '../screens/CheckoutScreen';

export type RootStackParamList = {
  Main: undefined;
  Settings: undefined;
  Checkout: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <RootStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' }
      }}
    >
      <RootStack.Screen name="Main" component={TabNavigator} />
      <RootStack.Screen 
        name="Settings" 
        component={SettingsScreen}
      />
      <RootStack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
      />
    </RootStack.Navigator>
  );
}