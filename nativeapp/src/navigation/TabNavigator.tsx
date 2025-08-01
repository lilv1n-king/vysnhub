import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Home, Search, QrCode, Bot, FolderOpen } from 'lucide-react-native';

// Import aller echten Screens
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import AIChatScreen from '../screens/AIChatScreen';
import ProjectsStackNavigator from './ProjectsStackNavigator';

// Einfacher Test-Scanner Screen
function TestScannerScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Scanner</Text>
      <Text style={{ fontSize: 16, marginTop: 10, textAlign: 'center' }}>
        QR/Barcode Scanner{'\n'}Coming Soon!
      </Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;

          if (route.name === 'Home') {
            IconComponent = Home;
          } else if (route.name === 'Products') {
            IconComponent = Search;
          } else if (route.name === 'Scanner') {
            IconComponent = QrCode;
          } else if (route.name === 'AI Chat') {
            IconComponent = Bot;
          } else if (route.name === 'Projects') {
            IconComponent = FolderOpen;
          }

          return IconComponent ? <IconComponent size={size} color={color} /> : null;
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Scanner" component={TestScannerScreen} />
      <Tab.Screen name="AI Chat" component={AIChatScreen} />
      <Tab.Screen name="Projects" component={ProjectsStackNavigator} />
    </Tab.Navigator>
  );
}