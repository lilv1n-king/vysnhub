import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, ExternalLink, Download, Plus, Minus, ShoppingCart, RefreshCw } from 'lucide-react-native';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { VysnProduct } from '../../lib/types/product';
import { getProductByItemNumber } from '../../lib/utils/product-data';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    color: '#000000',
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  content: {
    padding: 16,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  productNumber: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  quantityContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  quantityInput: {
    width: 60,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  actionButton: {
    height: 50,
    marginBottom: 12,
    borderRadius: 8,
  },
  actionButtonSecondary: {
    height: 50,
    marginBottom: 16,
    borderRadius: 8,
  },
  specCard: {
    marginBottom: 16,
  },
  specCardHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  specLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  noImageText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});

export default function ProductDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const [product, setProduct] = useState<VysnProduct | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const foundProduct = await getProductByItemNumber(id);
        setProduct(foundProduct);
        if (!foundProduct) {
          setError('Produkt nicht gefunden');
        }
      } catch (err) {
        console.error('Error loading product from Supabase:', err);
        setError('Fehler beim Laden des Produkts');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadProduct();
    }
  }, [id]);

  // Helper functions
  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= 99) {
      setQuantity(value);
    }
  };

  const handleAddToProject = async () => {
    setIsAddingToCart(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    Alert.alert('Erfolg', `${quantity}x ${product?.vysnName} zum Projekt hinzugefügt!`);
    setIsAddingToCart(false);
  };

  const handleReorder = async () => {
    setIsReordering(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    Alert.alert('Erfolg', `${quantity}x ${product?.vysnName} nachbestellt!`);
    setIsReordering(false);
  };

  const handleDownloadManual = () => {
    if (product?.manuallink) {
      Linking.openURL(product.manuallink).catch(() => {
        Alert.alert('Fehler', 'Manual konnte nicht geöffnet werden');
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
        </View>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#6b7280' }}>Lade Produkt...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state or product not found
  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
        </View>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <Text style={{ color: '#6b7280', textAlign: 'center' }}>
            {error || 'Produkt nicht gefunden'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const productImages = [
    product.product_picture_1,
    product.product_picture_2,
    product.product_picture_3,
    product.product_picture_4,
    product.product_picture_5,
    product.product_picture_6,
    product.product_picture_7,
    product.product_picture_8,
  ].filter(Boolean);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
      </View>
      
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {productImages.length > 0 && productImages[currentImageIndex] ? (
            <Image
              source={{ uri: productImages[currentImageIndex] }}
              style={styles.productImage}
            />
          ) : (
            <Text style={styles.noImageText}>No image available</Text>
          )}
          
          {/* Image indicators */}
          {productImages.length > 1 && (
            <View style={{ 
              position: 'absolute', 
              bottom: 16, 
              left: 0, 
              right: 0, 
              flexDirection: 'row', 
              justifyContent: 'center' 
            }}>
              {productImages.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentImageIndex(index)}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    marginHorizontal: 4,
                    backgroundColor: index === currentImageIndex ? '#000000' : '#9ca3af'
                  }}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Product Info */}
          <Text style={styles.productTitle}>
            {product.vysnName}
          </Text>
          
          <Text style={styles.productNumber}>
            Item: #{product.itemNumberVysn}
          </Text>
          
          {product.grossPrice && (
            <Text style={styles.priceText}>
              {formatPrice(product.grossPrice)}
            </Text>
          )}

          {/* Quantity and Order Section */}
          <View style={styles.quantityContainer}>
            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>Menge:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus size={20} color={quantity <= 1 ? '#9ca3af' : '#000000'} />
                </TouchableOpacity>
                <Input
                  value={quantity.toString()}
                  onChangeText={(text) => handleQuantityChange(parseInt(text) || 1)}
                  style={styles.quantityInput}
                  keyboardType="numeric"
                />
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 99}
                >
                  <Plus size={20} color={quantity >= 99 ? '#9ca3af' : '#000000'} />
                </TouchableOpacity>
              </View>
            </View>

            {product.grossPrice && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Gesamt:</Text>
                <Text style={styles.totalPrice}>
                  {formatPrice(product.grossPrice * quantity)}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <Button 
            onPress={handleAddToProject}
            disabled={isAddingToCart}
            style={styles.actionButton}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              {isAddingToCart ? (
                <Text style={{ color: '#ffffff' }}>Wird hinzugefügt...</Text>
              ) : (
                <>
                  <ShoppingCart size={20} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>Zum Projekt hinzufügen</Text>
                </>
              )}
            </View>
          </Button>
          
          <Button 
            variant="outline"
            onPress={handleReorder}
            disabled={isReordering}
            style={styles.actionButtonSecondary}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              {isReordering ? (
                <Text style={{ color: '#374151' }}>Wird nachbestellt...</Text>
              ) : (
                <>
                  <RefreshCw size={20} color="#374151" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#374151', fontWeight: '600' }}>Nachbestellen</Text>
                </>
              )}
            </View>
          </Button>

          {/* Download Manual Button */}
          {product.manuallink && (
            <Button 
              variant="outline"
              onPress={handleDownloadManual}
              style={styles.actionButtonSecondary}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Download size={20} color="#374151" style={{ marginRight: 8 }} />
                <Text style={{ color: '#374151', fontWeight: '600' }}>Manual herunterladen</Text>
              </View>
            </Button>
          )}

          {/* Description */}
          <Card style={styles.specCard}>
            <CardContent>
              <Text style={styles.specCardHeader}>Beschreibung</Text>
              <Text style={{ fontSize: 14, color: '#374151', lineHeight: 20 }}>
                {product.longDescription || product.shortDescription || 'Keine Beschreibung verfügbar'}
              </Text>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card style={styles.specCard}>
            <CardContent>
              <Text style={styles.specCardHeader}>Technische Daten</Text>
              
              {product.wattage && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Leistung</Text>
                  <Text style={styles.specValue}>{product.wattage}W</Text>
                </View>
              )}
              
              {product.lumen && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Lichtstrom</Text>
                  <Text style={styles.specValue}>{product.lumen} lm</Text>
                </View>
              )}
              
              {product.cct && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Farbtemperatur</Text>
                  <Text style={styles.specValue}>{product.cct}K</Text>
                </View>
              )}
              
              {product.beamAngle && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Abstrahlwinkel</Text>
                  <Text style={styles.specValue}>{product.beamAngle}°</Text>
                </View>
              )}
              
              {product.cri && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>CRI</Text>
                  <Text style={styles.specValue}>{product.cri}</Text>
                </View>
              )}
              
              {product.ingressProtection && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>IP-Schutzklasse</Text>
                  <Text style={styles.specValue}>{product.ingressProtection}</Text>
                </View>
              )}
              
              {product.energyClass && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Energieklasse</Text>
                  <Text style={styles.specValue}>{product.energyClass}</Text>
                </View>
              )}
              
              {product.steering && (
                <View style={[styles.specRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.specLabel}>Steuerung</Text>
                  <Text style={styles.specValue}>{product.steering}</Text>
                </View>
              )}
            </CardContent>
          </Card>

          {/* Dimensions */}
          {(product.lengthMm || product.widthMm || product.heightMm || product.diameterMm) && (
            <Card style={styles.specCard}>
              <CardContent>
                <Text style={styles.specCardHeader}>Abmessungen</Text>
                
                {product.lengthMm && (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Länge</Text>
                    <Text style={styles.specValue}>{product.lengthMm} mm</Text>
                  </View>
                )}
                
                {product.widthMm && (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Breite</Text>
                    <Text style={styles.specValue}>{product.widthMm} mm</Text>
                  </View>
                )}
                
                {product.heightMm && (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Höhe</Text>
                    <Text style={styles.specValue}>{product.heightMm} mm</Text>
                  </View>
                )}
                
                {product.diameterMm && (
                  <View style={[styles.specRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.specLabel}>Durchmesser</Text>
                    <Text style={styles.specValue}>{product.diameterMm} mm</Text>
                  </View>
                )}
              </CardContent>
            </Card>
          )}

          {/* Energy Label Link */}
          {product.eprelLink && (
            <Button 
              variant="outline"
              onPress={() => Linking.openURL(product.eprelLink!)}
              style={[styles.actionButtonSecondary, { marginBottom: 32 }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <ExternalLink size={20} color="#374151" style={{ marginRight: 8 }} />
                <Text style={{ color: '#374151', fontWeight: '600' }}>Energielabel anzeigen</Text>
              </View>
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}