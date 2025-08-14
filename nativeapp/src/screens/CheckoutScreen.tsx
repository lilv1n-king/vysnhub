import React, { useState } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Plus, Minus, ShoppingCart, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../components/ui/Card';
import { useCart } from '../../lib/contexts/CartContext';
import { useAuth } from '../../lib/contexts/AuthContext';
import { apiService } from '../../lib/services/apiService';
import i18n from '../../lib/i18n/i18n';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
  },
  cartItem: {
    marginBottom: 16,
  },
  cartItemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cartItemContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 56, // Platz für das X-Button
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemNumber: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quantityText: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summary: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  checkoutButton: {
    marginTop: 24,
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  priceNotesContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  priceNote: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const auth = useAuth();
  const [isOrdering, setIsOrdering] = useState(false);
  
  // Get user discount from profile
  const userDiscount = auth?.user?.profile?.discount_percentage || 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: number) => {
    Alert.alert(
      t('cart.removeItem'),
      t('cart.removeItemConfirmation'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.remove'), style: 'destructive', onPress: () => removeFromCart(productId) }
      ]
    );
  };

  const handleCheckout = () => {
    if (!auth?.user || items.length === 0) return;

    // Erstelle Artikel-Liste für Bestätigung
    const itemsList = items.map(item => {
      return `• ${item.product.vysnName} (${item.quantity}x)`;
    }).join('\n');

    Alert.alert(
      t('cart.confirmOrder'),
      `${t('cart.confirmOrderMessage')}\n\n${t('cart.total')}: ${formatPrice(total)}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('cart.placeOrder'),
          onPress: () => performCheckout()
        }
      ]
    );
  };

  const performCheckout = async () => {
    if (!auth?.user) return;
    
    setIsOrdering(true);
    try {
      // Create order data from cart items
      const orderData = {
        customerInfo: {
          name: auth.user.user_metadata?.full_name || auth.user.email?.split('@')[0] || 'Kunde',
          email: auth.user.email || '',
          company: auth.user.user_metadata?.company || undefined,
          discountPercentage: userDiscount
        },
        cartItems: items.map(item => ({
          productId: item.product.id,
          productName: item.product.vysnName,
          itemNumber: item.product.itemNumberVysn,
          quantity: item.quantity,
          unitPrice: item.product.grossPrice || 0,
          totalPrice: (item.product.grossPrice || 0) * item.quantity
        })),
        orderSummary: {
          subtotal: subtotal,
          discountPercentage: userDiscount,
          discountAmount: discountAmount,
          subtotalAfterDiscount: subtotalAfterDiscount,
          total: total
        },
        orderNotes: `Bestellung über VYSN Hub App - Warenkorb\nAnzahl Artikel: ${items.length}${userDiscount > 0 ? `\nKundenrabatt: ${userDiscount}%` : ''}`,
        totalAmount: total,
        language: i18n.language || 'de' // Aktuelle App-Sprache für E-Mail-Templates
      };

      console.log('📧 Sending cart order email...');
      const response = await apiService.post('/api/email/cart-order', orderData);

      if (response.success) {
        Alert.alert(
          t('cart.orderSuccess'),
          t('cart.orderSuccessMessage'),
          [{ 
            text: 'OK', 
            onPress: () => {
              clearCart();
              navigation.goBack();
            }
          }]
        );
        console.log('✅ Cart order email sent successfully');
      } else {
        throw new Error(response.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Error sending cart order:', error);
      Alert.alert(t('cart.orderError'), t('cart.orderErrorMessage'));
    } finally {
      setIsOrdering(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('cart.title')}</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.emptyState}>
            <ShoppingCart size={64} color="#d1d5db" />
            <Text style={styles.emptyStateText}>{t('cart.empty')}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const subtotal = getTotalPrice();
  const discountAmount = userDiscount > 0 ? subtotal * (userDiscount / 100) : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  // Keine Steuer- und Versandberechnung mehr - kommt per Rechnung
  const total = subtotalAfterDiscount;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('cart.title')} ({items.length})</Text>
      </View>
      
      <ScrollView style={styles.content}>

        {items.map((item, index) => (
          <View key={item.product.id} style={styles.cartItem}>
            <Card style={styles.cartItemCard}>
              <CardContent style={styles.cartItemContent}>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item.product.id)}
                >
                  <X size={18} color="#dc2626" />
                </TouchableOpacity>

                {item.product.product_picture_1 ? (
                  <Image
                    source={{ uri: item.product.product_picture_1 }}
                    style={styles.itemImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.itemImage} />
                )}

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.product.vysnName}
                  </Text>
                  
                  <Text style={styles.itemNumber}>
                    #{item.product.itemNumberVysn}
                  </Text>
                  
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.product.grossPrice || 0)}
                  </Text>

                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                    >
                      <Minus size={16} color="#6b7280" />
                    </TouchableOpacity>
                    
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                    >
                      <Plus size={16} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
        ))}

        <Card style={styles.summary}>
          <CardContent>
            <Text style={styles.summaryTitle}>{t('cart.orderSummary')}</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            
            {userDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Rabatt ({userDiscount}%)</Text>
                <Text style={styles.discountValue}>-{formatPrice(discountAmount)}</Text>
              </View>
            )}
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('cart.total')}</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
            
            {/* Preis-Hinweise */}
            <View style={styles.priceNotesContainer}>
              <Text style={styles.priceNote}>{t('cart.netNote')}</Text>
              <Text style={styles.priceNote}>{t('cart.finalPriceNote')}</Text>
            </View>
          </CardContent>
        </Card>

        <TouchableOpacity
          style={[styles.checkoutButton, isOrdering && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={isOrdering}
        >
          {isOrdering ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.checkoutButtonText}>{t('cart.placeOrder')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}