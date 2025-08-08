import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Linking, Alert, Modal, ActivityIndicator, TextInput, FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { ArrowLeft, Download, Plus, Minus, ShoppingCart, RefreshCw, MessageCircle, Send, Eye, X } from 'lucide-react-native';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Header from '../components/Header';
import { VysnProduct } from '../../lib/types/product';
import { Project } from '../../lib/types/project';
import { getProductByItemNumber } from '../../lib/utils/product-data';
import { useAuth } from '../../lib/contexts/AuthContext';
import { useCart } from '../../lib/contexts/CartContext';
import { projectService } from '../../lib/services/projectService';
import { useTranslation } from 'react-i18next';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Image section
  imageSection: {
    marginBottom: 32,
  },
  mainImageContainer: {
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    padding: 16,
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 8,
  },
  thumbnailContainer: {
    marginBottom: 16,
  },
  thumbnailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  thumbnailActive: {
    borderColor: '#000000',
  },
  thumbnailInactive: {
    borderColor: '#e5e7eb',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    padding: 4,
  },
  thumbnailSelectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    backgroundColor: '#000000',
    borderRadius: 6,
  },
  downloadButton: {
    height: 64,
    backgroundColor: '#000000',
    marginBottom: 24,
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Product info
  productInfo: {
    marginBottom: 32,
  },
  productTitle: {
    fontSize: 28,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 24,
  },
  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  stockStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  stockStatusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  stockInfo: {
    marginBottom: 24,
  },
  stockInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stockInfoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  stockInfoValue: {
    fontSize: 14,
    color: '#000000',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  // Quantity section
  quantitySection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  quantityInput: {
    width: 80,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    height: 48,
  },
  stockWarning: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  stockWarningText: {
    color: '#dc2626',
    fontSize: 14,
  },
  lowStockWarning: {
    backgroundColor: '#fffbeb',
    borderColor: '#fed7aa',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  lowStockWarningText: {
    color: '#d97706',
    fontSize: 14,
  },
  maxQuantityText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  discountPriceInline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#047857',
    backgroundColor: '#f0f9f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },

  // Action buttons
  actionButton: {
    height: 56,
    marginBottom: 12,
    borderRadius: 8,
  },
  actionButtonSecondary: {
    height: 56,
    marginBottom: 16,
    borderRadius: 8,
  },
  // Chat section
  chatSection: {
    marginBottom: 24,
  },
  chatToggleButton: {
    height: 56,
    marginBottom: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  chatCard: {
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  chatHeader: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatTitleText: {
    marginLeft: 8,
  },
  chatHistory: {
    maxHeight: 240,
    marginBottom: 16,
  },
  chatMessage: {
    marginBottom: 12,
  },
  chatMessageUser: {
    alignItems: 'flex-end',
  },
  chatMessageAssistant: {
    alignItems: 'flex-start',
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
  },
  chatBubbleUser: {
    backgroundColor: '#000000',
  },
  chatBubbleAssistant: {
    backgroundColor: '#f3f4f6',
  },
  chatText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chatTextUser: {
    color: '#ffffff',
  },
  chatTextAssistant: {
    color: '#000000',
  },
  chatInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    height: 48,
  },
  chatSendButton: {
    width: 48,
    height: 48,
  },
  // Spec cards
  specCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderColor: '#f1f5f9',
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  specCardHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  specRowLast: {
    borderBottomWidth: 0,
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
  // Project modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    padding: 8,
  },
  projectItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  createProjectContainer: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginTop: 16,
  },
  createProjectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  createProjectInput: {
    marginBottom: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default function ProductDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const auth = useAuth();
  const { t } = useTranslation();
  const { id } = route.params as { id: string };
  
  // Product state
  const [product, setProduct] = useState<VysnProduct | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Quantity and order state
  const [quantity, setQuantity] = useState(1);
  const [isAddingToProject, setIsAddingToProject] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  
  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Project selection state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Mock inventory data (like in web app)
  const inventoryData = {
    inStock: true,
    stockQuantity: 156,
    lowStockThreshold: 10,
    estimatedDelivery: "2-3 business days",
    nextRestock: "2025-02-15",
    warehouse: "Berlin Warehouse"
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const foundProduct = await getProductByItemNumber(id);
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setError(t('products.productNotFound'));
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError(t('auth.errorLoadingProduct'));
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadProduct();
    }
  }, [id]);

  // Reset selected image when product changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const getStockStatus = () => {
    if (!inventoryData.inStock) return { text: t('products.notAvailable'), color: "#dc2626", bgColor: "#fef2f2" };
    if (inventoryData.stockQuantity <= inventoryData.lowStockThreshold) {
      return { text: t('products.lowStock'), color: "#d97706", bgColor: "#fffbeb" };
    }
    return null; // Kein Status bei ausreichendem Lager
  };

  const getMaxQuantity = () => {
    return Math.min(inventoryData.stockQuantity, 99);
  };

  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    const maxQty = getMaxQuantity();
    if (value > maxQty) {
      Alert.alert(t('products.warning'), t('products.onlyXPiecesAvailable', { count: maxQty }));
      return;
    }
    setQuantity(value);
  };

  const loadProjects = async () => {
    if (!auth?.user) return;
    
    setLoadingProjects(true);
    try {
      console.log('📂 Loading active projects for ProductDetailScreen...');
      const allProjects = await projectService.getUserProjects();
      // Nur aktive Projekte (nicht completed) anzeigen
      const activeProjects = allProjects.filter(project => project.status !== 'completed');
      console.log(`✅ Loaded ${activeProjects.length} active projects for ProductDetailScreen (${allProjects.length} total)`);
      setProjects(activeProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      Alert.alert(t('projects.error'), t('projects.errorLoadingProjects'));
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleAddToProject = async () => {
    if (!inventoryData.inStock) {
      Alert.alert(t('products.notAvailable'), t('products.notAvailable'));
      return;
    }
    if (quantity > inventoryData.stockQuantity) {
      Alert.alert(t('products.notEnoughStock'), t('products.onlyXPiecesAvailable', { count: inventoryData.stockQuantity }));
      return;
    }
    
    await loadProjects();
    setShowProjectModal(true);
  };

  const addToProject = async (projectId: string) => {
    if (!product || !auth?.user) return;
    
    setIsAddingToProject(true);
    try {
      console.log(`➕ Adding ${quantity}x ${product.vysnName} to project ${projectId}`);
      
      // Get current project
      const project = await projectService.getProject(projectId);
      if (!project) {
        Alert.alert(t('projects.error'), t('auth.projectCouldNotBeFound'));
        return;
      }

      // Add product to project notes
      const existingNotes = project.project_notes || '';
      const productInfo = `${quantity}x ${product.vysnName} (${product.itemNumberVysn})`;
      const updatedNotes = existingNotes 
        ? `${existingNotes}\n• ${productInfo}`
        : `Products:\n• ${productInfo}`;

      // Update project via API service
      await projectService.updateProject(projectId, { 
        project_notes: updatedNotes
      });

      Alert.alert(t('auth.success'), `${quantity}x ${product.vysnName} ${t('auth.projectAddedSuccess')}`);
      setShowProjectModal(false);
    } catch (error) {
      console.error('Error adding to project:', error);
      Alert.alert(t('projects.error'), t('auth.couldNotAddToProject'));
    } finally {
      setIsAddingToProject(false);
    }
  };

  const createNewProject = async () => {
    if (!newProjectName.trim() || !product || !auth?.user) return;
    
    setIsCreatingProject(true);
    try {
      console.log(`🏗️ Creating new project: ${newProjectName.trim()}`);
      
      const productInfo = `${quantity}x ${product.vysnName} (${product.itemNumberVysn})`;
      const projectData = {
        project_name: newProjectName.trim(),
        project_notes: `Products:\n• ${productInfo}`,
        status: 'planning' as const,
        priority: 'medium' as const
      };

      // Create project via API service
      const newProject = await projectService.createProject(projectData);

      Alert.alert(t('auth.success'), t('auth.projectCreatedAndAdded'));
      setShowProjectModal(false);
      setNewProjectName('');
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert(t('projects.error'), t('auth.couldNotCreateProject'));
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!inventoryData.inStock) {
      Alert.alert(t('products.notAvailable'), t('products.notAvailable'));
      return;
    }
    
    setIsAddingToCart(true);
    try {
      addToCart(product, quantity);
      Alert.alert(
        t('cart.addedToCart'), 
        `${quantity}x ${product.vysnName} ${t('cart.addedToCartMessage')}`,
        [
          { text: t('common.ok'), style: 'default' },
          { 
            text: t('cart.viewCart'), 
            style: 'default',
            onPress: () => navigation.navigate('Checkout')
          }
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert(t('cart.error'), t('cart.addError'));
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !product) return;
    
    setIsChatLoading(true);
    const userQuestion = question;
    setQuestion('');
    setChatHistory(prev => [...prev, { role: 'user', content: userQuestion }]);
    
    try {
      // Simulate AI response (you can integrate with your chat API here)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: t('products.productInfoResponse', { productName: product.vysnName }) 
      }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: t('products.sorryError') 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>{t('auth.loadingProduct')}</Text>
        </View>
      </View>
    );
  }

  // Error state or product not found
  if (error || !product) {
    return (
      <View style={styles.container}>
        <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>
              {error || t('products.productNotFound')}
            </Text>
            <Button variant="outline" onPress={() => navigation.goBack()}>
{t('products.backToProducts')}
            </Button>
          </View>
        </View>
      </View>
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

  const stockStatus = getStockStatus();

  return (
    <View style={styles.container}>
      <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
      
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#ffffff" />
        </TouchableOpacity>

        {/* Image Section */}
        <View style={styles.imageSection}>
          <View style={styles.mainImageContainer}>
            {productImages.length > 0 && productImages[selectedImageIndex] ? (
              <Image
                source={{ uri: productImages[selectedImageIndex] }}
                style={styles.productImage}
              />
            ) : (
              <View style={styles.noImageContainer}>
                <Eye size={96} color="#d1d5db" />
                <Text style={styles.noImageText}>{t('products.noImageAvailable')}</Text>
              </View>
            )}
          </View>
          
          {productImages.length > 1 && (
            <View style={styles.thumbnailContainer}>
              <View style={styles.thumbnailGrid}>
                {productImages.slice(0, 8).map((image, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.thumbnail,
                      selectedImageIndex === index ? styles.thumbnailActive : styles.thumbnailInactive
                    ]}
                    onPress={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      source={{ uri: image }}
                      style={styles.thumbnailImage}
                    />
                    {selectedImageIndex === index && (
                      <View style={styles.thumbnailSelectedIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Download Manual Button */}
          {product.manuallink && (
            <Button 
              onPress={() => Linking.openURL(product.manuallink!)}
              style={styles.downloadButton}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Download size={24} color="#ffffff" style={{ marginRight: 12 }} />
                <Text style={styles.downloadButtonText}>{t('products.downloadManual')}</Text>
              </View>
            </Button>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>
            {product.vysnName || t('products.unnamedProduct')}
          </Text>
          
          <Text style={styles.productNumber}>
            {t('products.item')}: #{product.itemNumberVysn}
          </Text>
          
          {product.grossPrice && (
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>
                {formatPrice(product.grossPrice)}
              </Text>
              {auth?.user?.profile?.discount_percentage && auth.user.profile.discount_percentage > 0 && (
                <Text style={styles.discountPriceInline}>
                  {formatPrice(product.grossPrice * (1 - auth.user.profile.discount_percentage / 100))} (-{auth.user.profile.discount_percentage}%)
                </Text>
              )}
            </View>
          )}

          {/* Stock Status */}
          {stockStatus && (
            <View style={[styles.stockStatus, { backgroundColor: stockStatus.bgColor }]}>
              <View style={[styles.stockStatusDot, { backgroundColor: stockStatus.color }]} />
              <Text style={[styles.stockStatusText, { color: stockStatus.color }]}>
                {stockStatus.text}
              </Text>
            </View>
          )}

          {inventoryData.inStock && (
            <View style={styles.stockInfo}>
              <View style={styles.stockInfoRow}>
                <Text style={styles.stockInfoLabel}>{t('products.stock')}:</Text>
                <Text style={styles.stockInfoValue}>{inventoryData.stockQuantity} {t('products.piecesAvailable')}</Text>
              </View>
              <View style={styles.stockInfoRow}>
                <Text style={styles.stockInfoLabel}>{t('products.delivery')}:</Text>
                <Text style={styles.stockInfoValue}>{inventoryData.estimatedDelivery}</Text>
              </View>
              <View style={styles.stockInfoRow}>
                <Text style={styles.stockInfoLabel}>{t('products.warehouse')}:</Text>
                <Text style={styles.stockInfoValue}>{inventoryData.warehouse}</Text>
              </View>
            </View>
          )}
          
          <Text style={styles.description}>
            {product.longDescription || product.shortDescription || 'No description available'}
          </Text>
        </View>

        {/* Quantity and Order Section */}
        <View style={styles.quantitySection}>
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>{t('products.quantity')}:</Text>
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
                min={1}
                max={getMaxQuantity()}
              />
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= getMaxQuantity()}
              >
                <Plus size={20} color={quantity >= getMaxQuantity() ? '#9ca3af' : '#000000'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stock Warning */}
          {inventoryData.inStock && quantity > inventoryData.stockQuantity && (
            <View style={styles.stockWarning}>
              <Text style={styles.stockWarningText}>
                ⚠️ {t('products.onlyXPiecesAvailable', { count: inventoryData.stockQuantity })}
              </Text>
            </View>
          )}

          {/* Low Stock Warning */}
          {inventoryData.inStock && inventoryData.stockQuantity <= inventoryData.lowStockThreshold && (
            <View style={styles.lowStockWarning}>
              <Text style={styles.lowStockWarningText}>
                🔥 {t('products.onlyXPiecesLeft', { count: inventoryData.stockQuantity })}
              </Text>
            </View>
          )}

          {/* Available Quantity Info */}
          {inventoryData.inStock && (
            <Text style={styles.maxQuantityText}>
              {t('products.maximumPiecesOrderable', { count: getMaxQuantity() })}
            </Text>
          )}

          {/* Total Price */}
          {product.grossPrice && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('products.total')}:</Text>
              <Text style={styles.totalPrice}>
                {auth?.user?.profile?.discount_percentage && auth.user.profile.discount_percentage > 0 
                  ? formatPrice(product.grossPrice * quantity * (1 - auth.user.profile.discount_percentage / 100))
                  : formatPrice(product.grossPrice * quantity)
                }
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <Button 
          onPress={handleAddToProject}
          disabled={isAddingToProject || !inventoryData.inStock || quantity > inventoryData.stockQuantity}
          style={styles.actionButton}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {isAddingToProject ? (
              <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
            ) : (
              <ShoppingCart size={20} color="#ffffff" style={{ marginRight: 8 }} />
            )}
            <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 16 }}>
              {!inventoryData.inStock 
                ? t('products.notAvailable') 
                : isAddingToProject 
                ? t('products.adding') 
                : t('products.addToProject')}
            </Text>
          </View>
        </Button>
        
        <Button 
          variant="outline"
          onPress={handleAddToCart}
          disabled={isAddingToCart || !inventoryData.inStock || quantity > inventoryData.stockQuantity}
          style={styles.actionButtonSecondary}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {isAddingToCart ? (
              <ActivityIndicator size="small" color="#374151" style={{ marginRight: 8 }} />
            ) : (
              <ShoppingCart size={20} color="#374151" style={{ marginRight: 8 }} />
            )}
            <Text style={{ color: '#374151', fontWeight: '600', fontSize: 16 }}>
              {!inventoryData.inStock 
                ? t('products.notAvailable') 
                : isAddingToCart 
                ? t('cart.adding') 
                : t('cart.addToCart')}
            </Text>
          </View>
        </Button>

        {/* Chat Section */}
        <View style={styles.chatSection}>
          <Button
            variant="outline"
            onPress={() => setShowChat(!showChat)}
            style={styles.chatToggleButton}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={20} color="#374151" style={{ marginRight: 8 }} />
              <Text style={{ color: '#374151', fontWeight: '600', fontSize: 16 }}>
                {showChat ? t('products.closechat') : t('products.askProductQuestions')}
              </Text>
            </View>
          </Button>
          
          {showChat && (
            <Card style={styles.chatCard}>
              <CardContent>
                <View style={styles.chatHeader}>
                  <View style={styles.chatTitle}>
                    <MessageCircle size={20} color="#000000" />
                    <Text style={[styles.chatTitleText, { fontSize: 18, fontWeight: 'bold' }]}>
                      {t('products.productAssistant')}
                    </Text>
                  </View>
                </View>
                
                <ScrollView style={styles.chatHistory} showsVerticalScrollIndicator={false}>
                  {chatHistory.length === 0 && (
                    <Text style={{ color: '#6b7280', fontSize: 14 }}>
                      {t('products.askAnything')}
                    </Text>
                  )}
                  {chatHistory.map((message, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.chatMessage,
                        message.role === 'user' ? styles.chatMessageUser : styles.chatMessageAssistant
                      ]}
                    >
                      <View style={[
                        styles.chatBubble,
                        message.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleAssistant
                      ]}>
                        <Text style={[
                          styles.chatText,
                          message.role === 'user' ? styles.chatTextUser : styles.chatTextAssistant
                        ]}>
                          {message.content}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {isChatLoading && (
                    <View style={styles.chatMessageAssistant}>
                      <View style={styles.chatBubbleAssistant}>
                        <Text style={styles.chatTextAssistant}>{t('products.thinking')}</Text>
                      </View>
                    </View>
                  )}
                </ScrollView>
                
                <View style={styles.chatInputContainer}>
                  <Input
                    placeholder={t('products.questionsPlaceholder')}
                    value={question}
                    onChangeText={setQuestion}
                    onSubmitEditing={handleAskQuestion}
                    style={styles.chatInput}
                    disabled={isChatLoading}
                  />
                  <Button 
                    onPress={handleAskQuestion} 
                    disabled={!question.trim() || isChatLoading}
                    style={styles.chatSendButton}
                  >
                    <Send size={16} color="#ffffff" />
                  </Button>
                </View>
              </CardContent>
            </Card>
          )}
        </View>

{/* Dimensions */}
        {(product.diameterMm || product.lengthMm || product.widthMm || product.heightMm || product.weightKg || product.installationDiameter || product.cableLengthMm) && (
          <Card style={styles.specCard}>
            <CardContent>
              <Text style={styles.specCardHeader}>{t('products.dimensions')}</Text>
              
              {product.diameterMm && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.diameter')}:</Text>
                  <Text style={styles.specValue}>{product.diameterMm} mm</Text>
                </View>
              )}
              {product.lengthMm && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.length')}:</Text>
                  <Text style={styles.specValue}>{product.lengthMm} mm</Text>
                </View>
              )}
              {product.widthMm && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.width')}:</Text>
                  <Text style={styles.specValue}>{product.widthMm} mm</Text>
                </View>
              )}
              {product.heightMm && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.height')}:</Text>
                  <Text style={styles.specValue}>{product.heightMm} mm</Text>
                </View>
              )}
              {product.weightKg && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.weight')}:</Text>
                  <Text style={styles.specValue}>{product.weightKg} kg</Text>
                </View>
              )}
              {product.installationDiameter && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.installationDiameter')}:</Text>
                  <Text style={styles.specValue}>{product.installationDiameter} mm</Text>
                </View>
              )}
              {product.cableLengthMm && (
                <View style={[styles.specRow, styles.specRowLast]}>
                  <Text style={styles.specLabel}>{t('products.cableLength')}:</Text>
                  <Text style={styles.specValue}>{product.cableLengthMm} mm</Text>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Light Details */}
        {(product.lumen || product.cct || product.cri || product.beamAngle || product.beamAngleRange || product.lightDirection || product.lightsource || product.ledType || product.driverInfo || product.lumenPerWatt || product.luminosityDecrease || product.ledChipLifetime || product.ugr) && (
          <Card style={styles.specCard}>
            <CardContent>
              <Text style={styles.specCardHeader}>{t('products.lightDetails')}</Text>
              
              {product.lumen && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.luminousFlux')}:</Text>
                  <Text style={styles.specValue}>{product.lumen} lm</Text>
                </View>
              )}
              {product.cct && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.colorTemperature')}:</Text>
                  <Text style={styles.specValue}>{product.cct}K</Text>
                </View>
              )}
              {product.cri && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.cri')}:</Text>
                  <Text style={styles.specValue}>{product.cri}</Text>
                </View>
              )}
              {product.beamAngle && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.beamAngle')}:</Text>
                  <Text style={styles.specValue}>{product.beamAngle}°</Text>
                </View>
              )}
              {product.beamAngleRange && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.beamAngleRange')}:</Text>
                  <Text style={styles.specValue}>{product.beamAngleRange}</Text>
                </View>
              )}
              {product.lightDirection && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.lightDirection')}:</Text>
                  <Text style={styles.specValue}>{product.lightDirection}</Text>
                </View>
              )}
              {product.lightsource && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.lightSource')}:</Text>
                  <Text style={styles.specValue}>{product.lightsource}</Text>
                </View>
              )}
              {product.ledType && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.ledType')}:</Text>
                  <Text style={styles.specValue}>{product.ledType}</Text>
                </View>
              )}
              {product.driverInfo && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.driverInfo')}:</Text>
                  <Text style={styles.specValue}>{product.driverInfo}</Text>
                </View>
              )}
              {product.lumenPerWatt && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.lumenPerWatt')}:</Text>
                  <Text style={styles.specValue}>{product.lumenPerWatt} lm/W</Text>
                </View>
              )}
              {product.luminosityDecrease && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.luminosityDecrease')}:</Text>
                  <Text style={styles.specValue}>{product.luminosityDecrease}</Text>
                </View>
              )}
              {product.ledChipLifetime && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.ledChipLifetime')}:</Text>
                  <Text style={styles.specValue}>{product.ledChipLifetime}</Text>
                </View>
              )}
              {product.ugr && (
                <View style={[styles.specRow, styles.specRowLast]}>
                  <Text style={styles.specLabel}>{t('products.ugr')}:</Text>
                  <Text style={styles.specValue}>{product.ugr}</Text>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Electrical Data */}
        {(product.wattage || product.energyClass || product.operatingMode || product.cctSwitchValue || product.powerSwitchValue || product.sdcm || product.steering) && (
          <Card style={styles.specCard}>
            <CardContent>
              <Text style={styles.specCardHeader}>{t('products.electrical')}</Text>
              
              {product.wattage && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.power')}:</Text>
                  <Text style={styles.specValue}>{product.wattage}W</Text>
                </View>
              )}
              {product.energyClass && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.energyClass')}:</Text>
                  <Text style={styles.specValue}>{product.energyClass}</Text>
                </View>
              )}
              {product.operatingMode && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.operatingMode')}:</Text>
                  <Text style={styles.specValue}>{product.operatingMode}</Text>
                </View>
              )}
              {product.cctSwitchValue && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.cctSwitchValue')}:</Text>
                  <Text style={styles.specValue}>{product.cctSwitchValue}</Text>
                </View>
              )}
              {product.powerSwitchValue && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.powerSwitchValue')}:</Text>
                  <Text style={styles.specValue}>{product.powerSwitchValue}</Text>
                </View>
              )}
              {product.sdcm && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.sdcm')}:</Text>
                  <Text style={styles.specValue}>{product.sdcm}</Text>
                </View>
              )}
              {product.steering && (
                <View style={[styles.specRow, styles.specRowLast]}>
                  <Text style={styles.specLabel}>{t('products.control')}:</Text>
                  <Text style={styles.specValue}>{product.steering}</Text>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Installation & Safety */}
        {(product.installation || product.baseSocket || product.numberOfSockets || product.replaceableLightSource || product.coverable || product.ingressProtection || product.protectionClass || product.impactResistance) && (
          <Card style={styles.specCard}>
            <CardContent>
              <Text style={styles.specCardHeader}>{t('products.installation')} & {t('products.safety')}</Text>
              
              {product.installation && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.installationType')}:</Text>
                  <Text style={styles.specValue}>{product.installation}</Text>
                </View>
              )}
              {product.baseSocket && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.baseSocket')}:</Text>
                  <Text style={styles.specValue}>{product.baseSocket}</Text>
                </View>
              )}
              {product.numberOfSockets && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.numberOfSockets')}:</Text>
                  <Text style={styles.specValue}>{product.numberOfSockets}</Text>
                </View>
              )}
              {product.replaceableLightSource !== undefined && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.replaceableLightSource')}:</Text>
                  <Text style={styles.specValue}>{product.replaceableLightSource ? 'Ja' : 'Nein'}</Text>
                </View>
              )}
              {product.coverable !== undefined && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.coverable')}:</Text>
                  <Text style={styles.specValue}>{product.coverable ? 'Ja' : 'Nein'}</Text>
                </View>
              )}
              {product.ingressProtection && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.ipProtection')}:</Text>
                  <Text style={styles.specValue}>{product.ingressProtection}</Text>
                </View>
              )}
              {product.protectionClass && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.protectionClass')}:</Text>
                  <Text style={styles.specValue}>{product.protectionClass}</Text>
                </View>
              )}
              {product.impactResistance && (
                <View style={[styles.specRow, styles.specRowLast]}>
                  <Text style={styles.specLabel}>{t('products.impactResistance')}:</Text>
                  <Text style={styles.specValue}>{product.impactResistance}</Text>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        {(product.material || product.housingColor || product.category1 || product.category2 || product.groupName || product.countryOfOrigin || product.hsCode || product.barcodeNumber || product.packagingUnits) && (
          <Card style={styles.specCard}>
            <CardContent>
              <Text style={styles.specCardHeader}>{t('products.additional')}</Text>
              
              {product.material && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.material')}:</Text>
                  <Text style={styles.specValue}>{product.material}</Text>
                </View>
              )}
              {product.housingColor && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.housingColor')}:</Text>
                  <Text style={styles.specValue}>{product.housingColor}</Text>
                </View>
              )}
              {product.category1 && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.category')} 1:</Text>
                  <Text style={styles.specValue}>{product.category1}</Text>
                </View>
              )}
              {product.category2 && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.category')} 2:</Text>
                  <Text style={styles.specValue}>{product.category2}</Text>
                </View>
              )}
              {product.groupName && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.groupName')}:</Text>
                  <Text style={styles.specValue}>{product.groupName}</Text>
                </View>
              )}
              {product.countryOfOrigin && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.countryOfOrigin')}:</Text>
                  <Text style={styles.specValue}>{product.countryOfOrigin}</Text>
                </View>
              )}
              {product.hsCode && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.hsCode')}:</Text>
                  <Text style={styles.specValue}>{product.hsCode}</Text>
                </View>
              )}
              {product.barcodeNumber && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.barcodeNumber')}:</Text>
                  <Text style={styles.specValue}>{product.barcodeNumber}</Text>
                </View>
              )}
              {product.packagingUnits && (
                <View style={[styles.specRow, styles.specRowLast]}>
                  <Text style={styles.specLabel}>{t('products.packagingUnits')}:</Text>
                  <Text style={styles.specValue}>{product.packagingUnits}</Text>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Packaging Information */}
        {(product.packagingWeightKg || product.grossWeightKg || product.packagingWidthMm || product.packagingLengthMm || product.packagingHeightMm) && (
          <Card style={styles.specCard}>
            <CardContent>
              <Text style={styles.specCardHeader}>{t('products.packaging')}</Text>
              
              {product.packagingWeightKg && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.packagingWeight')}:</Text>
                  <Text style={styles.specValue}>{product.packagingWeightKg} kg</Text>
                </View>
              )}
              {product.grossWeightKg && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>{t('products.grossWeight')}:</Text>
                  <Text style={styles.specValue}>{product.grossWeightKg} kg</Text>
                </View>
              )}
              {(product.packagingWidthMm || product.packagingLengthMm || product.packagingHeightMm) && (
                <View style={[styles.specRow, styles.specRowLast]}>
                  <Text style={styles.specLabel}>{t('products.packagingDimensions')}:</Text>
                  <Text style={styles.specValue}>
                    {product.packagingWidthMm && `${product.packagingWidthMm}`}
                    {product.packagingWidthMm && product.packagingLengthMm && ' × '}
                    {product.packagingLengthMm && `${product.packagingLengthMm}`}
                    {(product.packagingWidthMm || product.packagingLengthMm) && product.packagingHeightMm && ' × '}
                    {product.packagingHeightMm && `${product.packagingHeightMm}`}
                    {(product.packagingWidthMm || product.packagingLengthMm || product.packagingHeightMm) && ' mm'}
                  </Text>
                </View>
              )}
            </CardContent>
          </Card>
        )}
      </ScrollView>

      {/* Project Selection Modal */}
      <Modal
        visible={showProjectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('products.selectProject')}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowProjectModal(false)}
              >
                <X size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            {loadingProjects ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000000" />
                <Text style={styles.loadingText}>{t('products.loadingProjects')}</Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={projects}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.projectItem}
                      onPress={() => addToProject(item.id)}
                    >
                      <Text style={styles.projectName}>{item.project_name}</Text>
                      {item.project_description && (
                        <Text style={styles.projectDescription}>
                          {item.project_description}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                  style={{ maxHeight: 300 }}
                />

                {/* Create New Project */}
                <View style={styles.createProjectContainer}>
                  <Text style={styles.createProjectTitle}>{t('products.createNewProject')}</Text>
                  
                  <Button
                    onPress={() => {
                      setShowProjectModal(false);
                      navigation.navigate('Projects', {
                        screen: 'CreateProject',
                        params: {
                          productInfo: {
                            itemNumber: product?.itemNumberVysn || '',
                            name: product?.vysnName || '',
                            quantity: quantity
                          }
                        }
                      });
                    }}
                  >
                    {t('products.createCompleteProject')}
                  </Button>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}