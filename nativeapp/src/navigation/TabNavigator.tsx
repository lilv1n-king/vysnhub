import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Home, Search, QrCode, Bot, FolderOpen } from 'lucide-react-native';

// Import aller echten Screens
import HomeScreen from '../screens/HomeScreen';
import ProductsStackNavigator from './ProductsStackNavigator';
import ScannerStackNavigator from './ScannerStackNavigator';
import AIChatScreen from '../screens/AIChatScreen';
import ProjectsStackNavigator from './ProjectsStackNavigator';



const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { t } = useTranslation();
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
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: t('home.title') }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsStackNavigator} 
        options={{ tabBarLabel: t('products.title') }}
      />
      <Tab.Screen 
        name="Scanner" 
        component={ScannerStackNavigator} 
        options={{ tabBarLabel: t('scanner.title') }}
      />
      <Tab.Screen 
        name="AI Chat" 
        component={AIChatScreen} 
        options={{ tabBarLabel: t('chat.title') }}
      />
      <Tab.Screen 
        name="Projects" 
        component={ProjectsStackNavigator} 
        options={{ tabBarLabel: t('projects.title') }}
      />
    </Tab.Navigator>
  );
}