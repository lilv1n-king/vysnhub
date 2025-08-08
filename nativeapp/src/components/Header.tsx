import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, ShoppingCart } from 'lucide-react-native';
import LanguageToggle from './LanguageToggle';
import { useCart } from '../../lib/contexts/CartContext';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 48,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -16,
  },
  logo: {
    width: 190,
    height: 56,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 6,
  },
  cartButton: {
    padding: 8,
    borderRadius: 6,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

interface HeaderProps {
  onSettingsPress: () => void;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function Header({ onSettingsPress }: HeaderProps) {
  const navigation = useNavigation<NavigationProp>();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  const handleCartPress = () => {
    navigation.navigate('Checkout');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.headerActions}>
          <LanguageToggle />
          
          <TouchableOpacity
            onPress={handleCartPress}
            style={styles.cartButton}
          >
            <ShoppingCart size={24} color="#000" />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {totalItems > 99 ? '99+' : totalItems}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onSettingsPress}
            style={styles.settingsButton}
          >
            <Settings size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}