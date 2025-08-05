import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProductsScreen from '../screens/ProductsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';

export type ProductsStackParamList = {
  ProductsList: undefined;
  ProductDetail: { id: string };
};

const ProductsStack = createStackNavigator<ProductsStackParamList>();

export default function ProductsStackNavigator() {
  return (
    <ProductsStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' }
      }}
    >
      <ProductsStack.Screen 
        name="ProductsList" 
        component={ProductsScreen} 
      />
      <ProductsStack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
      />
    </ProductsStack.Navigator>
  );
}