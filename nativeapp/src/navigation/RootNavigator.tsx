import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import SettingsScreen from '../screens/SettingsScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
// import OrderHistoryScreen from '../screens/OrderHistoryScreen'; // Deaktiviert


export type RootStackParamList = {
  Main: undefined;
  Settings: undefined;
  Checkout: undefined;
  // OrderHistory: undefined; // Deaktiviert
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
      {/* <RootStack.Screen 
        name="OrderHistory" 
        component={OrderHistoryScreen}
      /> */}
    </RootStack.Navigator>
  );
}