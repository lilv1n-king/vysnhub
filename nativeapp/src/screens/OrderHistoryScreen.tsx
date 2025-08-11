import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  ArrowLeft, 
  Calendar, 
  Package, 
  Euro,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  ShoppingBag
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/contexts/AuthContext';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/Card';
import { orderService, Order, OrderItem } from '../../lib/services/orderService';

const OrderHistoryScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, accessToken } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);



  useEffect(() => {
    if (user && accessToken) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [user, accessToken, loadOrders]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user || !accessToken) {
        setLoading(false);
        return;
      }

      const response = await orderService.getUserOrders(accessToken);
      setOrders(response.orders);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('Authentication failed'))) {
        Alert.alert(
          t('orders.error'), 
          t('orders.authError'),
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
      } else {
        Alert.alert(t('orders.error'), t('orders.loadError'));
      }
    } finally {
      setLoading(false);
    }
  }, [user, accessToken, t]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: Order['order_status']) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'shipped': return '#3b82f6';
      case 'processing': return '#f59e0b';
      case 'confirmed': return '#8b5cf6';
      case 'pending': return '#6b7280';
      case 'cancelled': return '#ef4444';
      case 'refunded': return '#f97316';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: Order['order_status']) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={16} color="#10b981" />;
      case 'shipped': return <Truck size={16} color="#3b82f6" />;
      case 'processing': return <Package size={16} color="#f59e0b" />;
      case 'confirmed': return <CheckCircle size={16} color="#8b5cf6" />;
      case 'pending': return <Clock size={16} color="#6b7280" />;
      case 'cancelled': return <X size={16} color="#ef4444" />;
      case 'refunded': return <ArrowLeft size={16} color="#f97316" />;
      default: return <Clock size={16} color="#6b7280" />;
    }
  };

  const getStatusText = (status: Order['order_status']) => {
    switch (status) {
      case 'delivered': return t('orders.status.delivered');
      case 'shipped': return t('orders.status.shipped');
      case 'processing': return t('orders.status.processing');
      case 'confirmed': return t('orders.status.confirmed');
      case 'pending': return t('orders.status.pending');
      case 'cancelled': return t('orders.status.cancelled');
      case 'refunded': return t('orders.status.refunded');
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handleOrderPress = (order: Order) => {
    // TODO: Navigate to OrderDetailScreen
    Alert.alert(
      t('orders.orderDetails'),
      `${t('orders.orderNumber')}: ${order.order_number}\n${t('orders.total')}: ${formatPrice(order.total_amount)}`,
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header 
          title={t('orders.title')} 
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>{t('orders.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={t('orders.title')} 
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <ShoppingBag size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>{t('orders.noOrders')}</Text>
            <Text style={styles.emptyStateText}>{t('orders.noOrdersDescription')}</Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => handleOrderPress(order)}
                activeOpacity={0.7}
              >
                <Card style={styles.card}>
                  <CardContent style={styles.cardContent}>
                    <View style={styles.orderHeader}>
                      <View style={styles.orderInfo}>
                        <Text style={styles.orderNumber}>{order.order_number}</Text>
                        <View style={styles.orderDate}>
                          <Calendar size={14} color="#6b7280" />
                          <Text style={styles.dateText}>{formatDate(order.order_date)}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.orderStatus}>
                        <View style={styles.statusBadge}>
                          {getStatusIcon(order.order_status)}
                          <Text style={[styles.statusText, { color: getStatusColor(order.order_status) }]}>
                            {getStatusText(order.order_status)}
                          </Text>
                        </View>
                        <ChevronRight size={20} color="#6b7280" />
                      </View>
                    </View>

                    <View style={styles.orderSummary}>
                      <View style={styles.summaryItem}>
                        <Package size={16} color="#6b7280" />
                        <Text style={styles.summaryText}>
                          {t('orders.order')} {order.order_type}
                        </Text>
                      </View>
                      
                      <View style={styles.summaryItem}>
                        <Euro size={16} color="#6b7280" />
                        <Text style={styles.totalPrice}>{formatPrice(order.total_amount)}</Text>
                      </View>
                    </View>

                    {/* Order Notes Preview */}
                    {order.customer_notes && (
                      <View style={styles.itemsPreview}>
                        <Text style={styles.itemPreview} numberOfLines={2}>
                          {order.customer_notes}
                        </Text>
                      </View>
                    )}
                  </CardContent>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  ordersList: {
    paddingBottom: 32,
  },
  orderCard: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  orderDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: {
    fontSize: 14,
    color: '#6b7280',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  itemsPreview: {
    gap: 4,
  },
  itemPreview: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  moreItems: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});

export default OrderHistoryScreen;
