import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Header from '../components/Header';
import { VysnProduct } from '../../lib/types/product';
import { getProducts } from '../../lib/utils/product-data';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchInputContainer: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 40,
  },
  productList: {
    padding: 8,
  },
  productItem: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  productCard: {
    height: 140,
    backgroundColor: '#ffffff',
  },
  productContent: {
    padding: 16,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImageContainer: {
    width: 80,
    height: 80,
    marginRight: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    color: '#000000',
    lineHeight: 18,
  },
  productNumber: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 8,
    flex: 1,
  },
  productSpecs: {
    marginTop: 'auto',
  },
  productSpec: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
  productSpecGray: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default function ProductsScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<VysnProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<VysnProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productData = await getProducts();
        setProducts(productData);
        setFilteredProducts(productData.slice(0, 20)); // Show first 20 products initially
      } catch (error) {
        console.error('Error loading products from Supabase:', error);
        // Optional: Show error message to user
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products.slice(0, 20));
    } else {
      const filtered = products.filter(product =>
        product.vysnName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.itemNumberVysn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered.slice(0, 50));
    }
  }, [searchQuery, products]);

  const handleProductPress = (product: VysnProduct) => {
    console.log('Product pressed:', product.itemNumberVysn);
    // TODO: Erstmal ohne Navigation - Product Details kommen später
    Alert.alert(
      'Product Selected',
      `Product: ${product.vysnName}\nItem: ${product.itemNumberVysn}`,
      [{ text: 'OK' }]
    );
  };

  const handleSettingsPress = () => {
    console.log('Settings button pressed - Auth coming soon!');
  };

  const renderProduct = ({ item }: { item: VysnProduct }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => handleProductPress(item)}
    >
      <Card style={styles.productCard}>
        <CardContent style={styles.productContent}>
          <View style={styles.productImageContainer}>
            {item.product_picture_1 ? (
              <Image
                source={{ uri: item.product_picture_1 }}
                style={styles.productImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.productSpecGray}>No image</Text>
            )}
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.vysnName}
            </Text>
            
            <Text style={styles.productNumber}>
              {item.itemNumberVysn}
            </Text>
            
            <Text style={styles.productDescription} numberOfLines={2}>
              {item.shortDescription}
            </Text>
            
            <View style={styles.productSpecs}>
              {item.wattage && (
                <Text style={styles.productSpec}>
                  {item.wattage}W
                </Text>
              )}
              {item.cct && (
                <Text style={styles.productSpecGray}>
                  {" • " + item.cct}K
                </Text>
              )}
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header onSettingsPress={handleSettingsPress} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Loading products...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onSettingsPress={handleSettingsPress} />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search 
            size={20} 
            color="#9CA3AF" 
            style={styles.searchIcon}
          />
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products..."
            style={styles.searchInput}
          />
        </View>
      </View>

      {filteredProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Search size={64} color="#d1d5db" />
          <Text style={styles.emptyStateText}>
            {searchQuery ? 'No products found matching your search.' : 'No products available.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.itemNumberVysn}
          numColumns={1}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}