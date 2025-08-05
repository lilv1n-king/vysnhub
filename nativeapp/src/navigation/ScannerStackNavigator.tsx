import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ScannerScreen from '../screens/ScannerScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';

export type ScannerStackParamList = {
  ScannerMain: undefined;
  ProductDetail: { id: string };
};

const ScannerStack = createStackNavigator<ScannerStackParamList>();

export default function ScannerStackNavigator() {
  return (
    <ScannerStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' }
      }}
    >
      <ScannerStack.Screen 
        name="ScannerMain" 
        component={ScannerScreen} 
      />
      <ScannerStack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
      />
    </ScannerStack.Navigator>
  );
}