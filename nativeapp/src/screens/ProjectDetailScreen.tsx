import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Switch, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { ProjectsStackParamList } from '../navigation/ProjectsStackNavigator';
import { ArrowLeft, Calendar, Package, Edit, Trash2, Save, X, MapPin, DollarSign, Target, Tag, Eye, EyeOff, Plus, Minus } from 'lucide-react-native';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import { useAuth } from '../../lib/contexts/AuthContext';
import { supabase } from '../../lib/utils/supabase';
import { Project } from '../../lib/types/project';
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
  },
  projectHeader: {
    marginBottom: 24,
  },
  projectTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  projectInfoText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
  },
  editForm: {
    gap: 16,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#000000',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },

  dateInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  budgetInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#6b7280',
    marginRight: 8,
  },
  budgetTextInput: {
    flex: 1,
    fontSize: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
  },
  removeTagButton: {
    padding: 2,
  },
  addTagInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  // Product styles
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  margeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  margeToggleActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  margeToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  margeToggleTextActive: {
    color: '#1d4ed8',
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 16,
  },
  productContent: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  productItemNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  productQuantity: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  quantityControlsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  quantityInput: {
    width: 50,
    height: 32,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  deleteButton: {
    padding: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
  },
  margeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
  costPriceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
  },
  salePriceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  noProductsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

type ProjectDetailScreenNavigationProp = StackNavigationProp<ProjectsStackParamList, 'ProjectDetail'>;
type ProjectDetailScreenRouteProp = RouteProp<ProjectsStackParamList, 'ProjectDetail'>;

export default function ProjectDetailScreen() {
  const route = useRoute<ProjectDetailScreenRouteProp>();
  const navigation = useNavigation<ProjectDetailScreenNavigationProp>();
  const auth = useAuth();
  const { id } = route.params;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [showMarge, setShowMarge] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [projectProducts, setProjectProducts] = useState<any[]>([]);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    location: '',
    status: 'planning' as Project['status'],

    start_date: '',
    target_completion_date: '',
    estimated_budget: '',
    notes: '',
    tags: [] as string[],
    customer_discount: 0 // Projektspezifischer Endkundenrabatt
  });
  const [newTag, setNewTag] = useState('');

  // Safety check
  if (!auth) {
    return (
      <View style={styles.container}>
        <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
        <View style={[styles.scrollContent, { justifyContent: 'center', alignItems: 'center' }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#6b7280" />
            <Text style={{ marginLeft: 8, fontSize: 16, color: '#6b7280' }}>Zurück zu Projekten</Text>
          </TouchableOpacity>
          <Text style={styles.errorText}>Authentication required</Text>
        </View>
      </View>
    );
  }

  const { user } = auth;

  const loadProject = useCallback(async () => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        Alert.alert('Error', 'Failed to load project');
        return;
      }

      setProject(data);
      setEditData({
        name: data.project_name || '',
        description: data.project_description || '',
        location: data.project_location || '',
        status: data.status || 'planning',

        start_date: data.start_date || '',
        target_completion_date: data.target_completion_date || '',
        estimated_budget: data.estimated_budget ? data.estimated_budget.toString() : '',
        notes: data.project_notes || '',
        tags: data.tags || [],
        customer_discount: data.customer_discount || 0
      });

      // Load user profile for discount
      const { data: profile } = await supabase
        .from('profiles')
        .select('discount_percentage')
        .eq('id', user.id)
        .single();
      
      setUserProfile(profile);

      // Parse and load project products
      await parseProjectProducts(data.project_notes || '');
    } catch (error) {
      Alert.alert('Error', 'Failed to load project');
    }
  }, [id, user]);

  const parseProjectProducts = async (notes: string) => {
    const productMap = new Map(); // Use Map to merge duplicates
    const lines = notes.split('\n');
    
    for (const line of lines) {
      // Match pattern: "5x LED Strip V104100T2W (V104100T2W)"
      const match = line.match(/•?\s*(\d+)x\s+(.+?)\s+\(([^)]+)\)/);
      if (match) {
        const [, quantity, name, itemNumber] = match;
        const trimmedItemNumber = itemNumber.trim();
        
        // If product already exists, add to quantity
        if (productMap.has(trimmedItemNumber)) {
          const existingProduct = productMap.get(trimmedItemNumber);
          existingProduct.quantity += parseInt(quantity);
        } else {
          try {
            const productData = await getProductByItemNumber(trimmedItemNumber);
            if (productData) {
              productMap.set(trimmedItemNumber, {
                quantity: parseInt(quantity),
                itemNumber: trimmedItemNumber,
                name: name.trim(),
                productData
              });
            }
          } catch (error) {
            console.log('Error loading product:', trimmedItemNumber, error);
          }
        }
      }
    }
    
    // Convert Map to Array
    const products = Array.from(productMap.values());
    setProjectProducts(products);
  };

  const updateProductQuantity = async (itemNumber: string, newQuantity: number) => {
    if (!project || !supabase) return;

    try {
      // Update local state (ensure no duplicates)
      const updatedProducts = projectProducts.map(product => 
        product.itemNumber === itemNumber 
          ? { ...product, quantity: newQuantity }
          : product
      );
      
      // Remove duplicates and merge quantities
      const mergedProducts = mergeProductDuplicates(updatedProducts);
      setProjectProducts(mergedProducts);

      // Update project_notes in database
      const updatedNotes = generateProjectNotes(mergedProducts);
      
      const { error } = await supabase
        .from('user_projects')
        .update({ 
          project_notes: updatedNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) {
        console.error('Error updating product quantity:', error);
        // Revert local changes on error
        await parseProjectProducts(project.project_notes || '');
      }
    } catch (error) {
      console.error('Error updating product quantity:', error);
    }
  };

  const removeProductFromProject = async (itemNumber: string) => {
    if (!project || !supabase) return;

    Alert.alert(
      'Produkt entfernen',
      'Möchtest du dieses Produkt aus dem Projekt entfernen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Entfernen',
          style: 'destructive',
          onPress: async () => {
            try {
              // Update local state
              const updatedProducts = projectProducts.filter(product => 
                product.itemNumber !== itemNumber
              );
              setProjectProducts(updatedProducts);

              // Update project_notes in database
              const updatedNotes = generateProjectNotes(updatedProducts);
              
              const { error } = await supabase
                .from('user_projects')
                .update({ 
                  project_notes: updatedNotes,
                  updated_at: new Date().toISOString()
                })
                .eq('id', project.id);

              if (error) {
                console.error('Error removing product:', error);
                // Revert local changes on error
                await parseProjectProducts(project.project_notes || '');
              }
            } catch (error) {
              console.error('Error removing product:', error);
            }
          }
        }
      ]
    );
  };

  const mergeProductDuplicates = (products: any[]) => {
    const productMap = new Map();
    
    products.forEach(product => {
      if (productMap.has(product.itemNumber)) {
        const existing = productMap.get(product.itemNumber);
        existing.quantity += product.quantity;
      } else {
        productMap.set(product.itemNumber, { ...product });
      }
    });
    
    return Array.from(productMap.values());
  };

  const generateProjectNotes = (products: any[]) => {
    if (products.length === 0) return '';
    
    // Ensure no duplicates before generating notes
    const mergedProducts = mergeProductDuplicates(products);
    
    const productLines = mergedProducts.map(product => 
      `• ${product.quantity}x ${product.name} (${product.itemNumber})`
    );
    
    return `Products:\n${productLines.join('\n')}`;
  };

  useEffect(() => {
    const initializeProject = async () => {
      setLoading(true);
      await loadProject();
      setLoading(false);
    };

    initializeProject();
  }, [loadProject]);

  const handleSave = async () => {
    if (!project || !supabase) return;

    try {
      const { error } = await supabase
        .from('user_projects')
        .update({
          project_name: editData.name,
          project_description: editData.description,
          project_location: editData.location,
          status: editData.status,

          start_date: editData.start_date || null,
          target_completion_date: editData.target_completion_date || null,
          estimated_budget: editData.estimated_budget ? parseFloat(editData.estimated_budget) : null,
          project_notes: editData.notes,
          tags: editData.tags,
          customer_discount: editData.customer_discount,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) {
        Alert.alert('Error', 'Failed to update project');
        return;
      }

      await loadProject();
    } catch (error) {
      Alert.alert('Error', 'Failed to update project');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editData.tags.includes(newTag.trim())) {
      setEditData(prev => ({ 
        ...prev, 
        tags: [...prev.tags, newTag.trim()] 
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };



  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!project || !supabase) return;

            try {
              const { error } = await supabase
                .from('user_projects')
                .delete()
                .eq('id', project.id);

              if (error) {
                Alert.alert('Error', 'Failed to delete project');
                return;
              }

              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete project');
            }
          }
        }
      ]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const calculateDiscount = (price: number, discountPercentage: number) => {
    return price * (discountPercentage / 100);
  };

  const calculateMarge = (salePrice: number, costPrice: number) => {
    if (costPrice === 0) return 0;
    return ((salePrice - costPrice) / salePrice) * 100;
  };

  const renderProductCard = (productItem: any) => {
    const { quantity, productData } = productItem;
    const userDiscountPercentage = userProfile?.discount_percentage || 30; // Standard 30%
    const customerDiscountPercentage = project?.customer_discount || 0;
    
    if (!productData) return null;

    const unitPrice = productData.grossPrice || 0; // VK/Endkundenpreis
    const totalVKPrice = unitPrice * quantity;
    
    // Benutzer-Einkaufspreis (VK - 30%)
    const userCostPrice = unitPrice * (1 - userDiscountPercentage / 100);
    const totalUserCost = userCostPrice * quantity;
    
    // Endkunden-Verkaufspreis (VK - projektspezifischer Rabatt)
    const customerPrice = unitPrice * (1 - customerDiscountPercentage / 100);
    const totalCustomerPrice = customerPrice * quantity;
    
    // Gewinn/Verlust
    const profit = totalCustomerPrice - totalUserCost;
    const profitPercentage = totalUserCost > 0 ? (profit / totalUserCost) * 100 : 0;

    return (
      <View key={productItem.itemNumber} style={styles.productCard}>
        <View style={styles.productImage}>
          {productData.product_picture_1 ? (
            <Image 
              source={{ uri: productData.product_picture_1 }} 
              style={{ width: '100%', height: '100%', borderRadius: 8 }}
              resizeMode="contain"
            />
          ) : (
            <View style={{ 
              width: '100%', 
              height: '100%', 
              backgroundColor: '#f3f4f6', 
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Package size={32} color="#9ca3af" />
            </View>
          )}
        </View>
        
        <View style={styles.productContent}>
          <Text style={styles.productName}>{productData.vysnName}</Text>
          <Text style={styles.productItemNumber}>#{productData.itemNumberVysn}</Text>
          
          {/* Quantity Controls */}
          <View style={styles.quantityControls}>
            <View style={styles.quantityControlsLeft}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateProductQuantity(productItem.itemNumber, Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus size={16} color={quantity <= 1 ? '#9ca3af' : '#000000'} />
              </TouchableOpacity>
              
              <TextInput
                style={styles.quantityInput}
                value={quantity.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 1;
                  if (value >= 1 && value <= 99) {
                    updateProductQuantity(productItem.itemNumber, value);
                  }
                }}
                keyboardType="numeric"
              />
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateProductQuantity(productItem.itemNumber, Math.min(99, quantity + 1))}
                disabled={quantity >= 99}
              >
                <Plus size={16} color={quantity >= 99 ? '#9ca3af' : '#000000'} />
              </TouchableOpacity>
              
              <Text style={styles.productQuantity}>Stück</Text>
            </View>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeProductFromProject(productItem.itemNumber)}
            >
              <Trash2 size={16} color="#dc2626" />
            </TouchableOpacity>
          </View>
          
          {showMarge ? (
            // Geschäftsdaten-Ansicht mit Kalkulation
            <>
              <View style={[styles.priceRow, { backgroundColor: '#f9fafb', padding: 8, borderRadius: 6, marginBottom: 8 }]}>
                <Text style={[styles.priceLabel, { fontWeight: '600' }]}>Kalkulation:</Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Listenpreis (VK):</Text>
                <Text style={styles.priceValue}>{formatPrice(unitPrice)}</Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Mein EK (-{userDiscountPercentage}%):</Text>
                <Text style={styles.costPriceValue}>{formatPrice(userCostPrice)}</Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Endkunden-VK ({customerDiscountPercentage > 0 ? `-${customerDiscountPercentage}%` : 'Listenpreis'}):</Text>
                <Text style={styles.salePriceValue}>{formatPrice(customerPrice)}</Text>
              </View>
              
              <View style={[styles.priceRow, { backgroundColor: '#f0f9ff', padding: 6, borderRadius: 4, marginTop: 8 }]}>
                <Text style={[styles.priceLabel, { fontWeight: '600' }]}>Gesamt ({quantity} Stück):</Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Ich zahle:</Text>
                <Text style={styles.costPriceValue}>{formatPrice(totalUserCost)}</Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Ich bekomme:</Text>
                <Text style={styles.salePriceValue}>{formatPrice(totalCustomerPrice)}</Text>
              </View>
              
              <View style={[styles.priceRow, { borderTopWidth: 2, borderTopColor: '#e5e7eb', paddingTop: 8, marginTop: 8 }]}>
                <Text style={[styles.priceLabel, { fontWeight: 'bold', fontSize: 16 }]}>Gewinn:</Text>
                <Text style={[
                  profit >= 0 ? styles.salePriceValue : styles.costPriceValue,
                  { fontWeight: 'bold', fontSize: 16 }
                ]}>
                  {formatPrice(profit)}
                </Text>
              </View>
            </>
          ) : (
            // Standard-Ansicht
            <>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Einzelpreis:</Text>
                <Text style={styles.priceValue}>{formatPrice(customerPrice)}</Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Zwischensumme:</Text>
                <Text style={styles.priceValue}>{formatPrice(totalCustomerPrice)}</Text>
              </View>
              
              {customerDiscountPercentage > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Rabatt ({customerDiscountPercentage}%):</Text>
                  <Text style={styles.discountValue}>-{formatPrice(totalVKPrice - totalCustomerPrice)}</Text>
                </View>
              )}
            </>
          )}
          
          {!showMarge && (
            <View style={[styles.priceRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb' }]}>
              <Text style={[styles.priceLabel, { fontWeight: '600' }]}>Gesamt:</Text>
              <Text style={styles.totalPrice}>{formatPrice(totalCustomerPrice)}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: '#dcfce7', text: '#16a34a' };
      case 'active':
        return { bg: '#dbeafe', text: '#2563eb' };
      case 'planning':
        return { bg: '#f3f4f6', text: '#6b7280' };
      case 'on_hold':
        return { bg: '#fef3c7', text: '#d97706' };
      case 'cancelled':
        return { bg: '#fee2e2', text: '#dc2626' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
        <View style={[styles.scrollContent, { justifyContent: 'center', alignItems: 'center' }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#6b7280" />
            <Text style={{ marginLeft: 8, fontSize: 16, color: '#6b7280' }}>Zurück zu Projekten</Text>
          </TouchableOpacity>
          <Text style={styles.loadingText}>Loading project...</Text>
        </View>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
        <View style={[styles.scrollContent, { justifyContent: 'center', alignItems: 'center' }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#6b7280" />
            <Text style={{ marginLeft: 8, fontSize: 16, color: '#6b7280' }}>Zurück zu Projekten</Text>
          </TouchableOpacity>
          <Text style={styles.errorText}>Project not found</Text>
        </View>
      </View>
    );
  }

  const statusColors = getStatusColor(project.status);

  return (
    <View style={styles.container}>
      <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Back Button und Action Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#6b7280" />
            <Text style={{ marginLeft: 8, fontSize: 16, color: '#6b7280' }}>Zurück zu Projekten</Text>
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
        <View>
            <View style={styles.projectHeader}>
              <Text style={styles.projectTitle}>{project.project_name}</Text>
              
              <View style={styles.projectInfo}>
                <Calendar size={20} color="#6b7280" />
                <Text style={styles.projectInfoText}>
                  Created {formatDate(project.created_at)}
                </Text>
              </View>
              

              
              {project.project_location && (
                <View style={styles.projectInfo}>
                  <MapPin size={20} color="#6b7280" />
                  <Text style={styles.projectInfoText}>
                    {project.project_location}
                  </Text>
                </View>
              )}
              
              {project.estimated_budget && (
                <View style={styles.projectInfo}>
                  <DollarSign size={20} color="#6b7280" />
                  <Text style={styles.projectInfoText}>
                    Budget: €{project.estimated_budget.toLocaleString()}
                  </Text>
                </View>
              )}
              
              {project.customer_discount > 0 && (
                <View style={styles.projectInfo}>
                  <DollarSign size={20} color="#059669" />
                  <Text style={[styles.projectInfoText, { color: '#059669' }]}>
                    Endkundenrabatt: {project.customer_discount}%
                  </Text>
                </View>
              )}
              
              {project.target_completion_date && (
                <View style={styles.projectInfo}>
                  <Target size={20} color="#6b7280" />
                  <Text style={styles.projectInfoText}>
                    Due {formatDate(project.target_completion_date)}
                  </Text>
                </View>
              )}
              
              <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                <Text style={[styles.statusText, { color: statusColors.text }]}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Text>
              </View>
            </View>

            {project.project_description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <View style={styles.card}>
                  <Text style={{ fontSize: 16, color: '#374151', lineHeight: 24 }}>
                    {project.project_description}
                  </Text>
                </View>
              </View>
            )}

            {project.tags && project.tags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.card}>
                  <View style={styles.tagContainer}>
                    {project.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Tag size={16} color="#6b7280" />
                        <Text style={[styles.tagText, { marginLeft: 6, marginRight: 0 }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Products Section */}
            <View style={styles.section}>
              <View style={styles.productsHeader}>
                <Text style={styles.sectionTitle}>Produkte</Text>
                {projectProducts.length > 0 && (
                  <TouchableOpacity 
                    style={[
                      styles.margeToggle,
                      showMarge && styles.margeToggleActive
                    ]}
                    onPress={() => setShowMarge(!showMarge)}
                  >
                    {showMarge ? (
                      <EyeOff size={16} color="#1d4ed8" />
                    ) : (
                      <Eye size={16} color="#6b7280" />
                    )}
                    <Text style={[
                      styles.margeToggleText,
                      showMarge && styles.margeToggleTextActive
                    ]}>
                      {showMarge ? 'Geschäftsdaten ausblenden' : 'Geschäftsdaten anzeigen'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {projectProducts.length > 0 ? (
                <>
                  {projectProducts.map(renderProductCard)}
                
                {/* Project Total */}
                <View style={[styles.card, { marginTop: 16, backgroundColor: '#f9fafb' }]}>
                  <View style={styles.priceRow}>
                    <Text style={[styles.sectionTitle, { marginBottom: 0, fontSize: 18 }]}>
                      Projekt-Gesamtsumme:
                    </Text>
                    <Text style={[styles.totalPrice, { fontSize: 18 }]}>
                      {formatPrice(projectProducts.reduce((total, item) => {
                        const unitPrice = item.productData?.grossPrice || 0;
                        const customerDiscountPercentage = project?.customer_discount || 0;
                        const customerPrice = unitPrice * (1 - customerDiscountPercentage / 100);
                        const totalCustomerPrice = customerPrice * item.quantity;
                        return total + totalCustomerPrice;
                      }, 0))}
                    </Text>
                  </View>
                  {project?.customer_discount > 0 && (
                    <Text style={{ fontSize: 14, color: '#059669', textAlign: 'right', marginTop: 4 }}>
                      Mit {project.customer_discount}% Endkundenrabatt
                    </Text>
                  )}
                  
                  {showMarge && (
                    <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#d1d5db' }}>
                      <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { fontWeight: '600', color: '#dc2626' }]}>
                          Meine Gesamtkosten:
                        </Text>
                        <Text style={[styles.costPriceValue, { fontSize: 16, fontWeight: 'bold' }]}>
                          {formatPrice(projectProducts.reduce((total, item) => {
                            const unitPrice = item.productData?.grossPrice || 0;
                            const userDiscountPercentage = userProfile?.discount_percentage || 30;
                            const userCostPrice = unitPrice * (1 - userDiscountPercentage / 100);
                            return total + (userCostPrice * item.quantity);
                          }, 0))}
                        </Text>
                      </View>
                      
                      <View style={[styles.priceRow, { borderTopWidth: 2, borderTopColor: '#059669', paddingTop: 8, marginTop: 8 }]}>
                        <Text style={[styles.priceLabel, { fontWeight: 'bold', fontSize: 16 }]}>
                          Mein Gesamtgewinn:
                        </Text>
                        <Text style={[styles.salePriceValue, { fontSize: 16, fontWeight: 'bold' }]}>
                          {formatPrice(projectProducts.reduce((total, item) => {
                            const unitPrice = item.productData?.grossPrice || 0;
                            const userDiscountPercentage = userProfile?.discount_percentage || 30;
                            const customerDiscountPercentage = project?.customer_discount || 0;
                            
                            const userCostPrice = unitPrice * (1 - userDiscountPercentage / 100);
                            const customerPrice = unitPrice * (1 - customerDiscountPercentage / 100);
                            
                            const totalUserCost = userCostPrice * item.quantity;
                            const totalCustomerPrice = customerPrice * item.quantity;
                            
                            return total + (totalCustomerPrice - totalUserCost);
                          }, 0))}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
                </>
              ) : (
                <View style={[styles.card, { paddingVertical: 32, alignItems: 'center' }]}>
                  <Package size={48} color="#d1d5db" />
                  <Text style={[styles.emptyStateTitle, { marginTop: 12, fontSize: 18 }]}>
                    Noch keine Produkte
                  </Text>
                  <Text style={styles.emptyStateText}>
                    Fügen Sie Produkte hinzu, um mit der Planung zu beginnen.
                  </Text>
                  <TouchableOpacity
                    style={[styles.addButton, { marginTop: 16 }]}
                    onPress={() => navigation.navigate('Products' as any)}
                  >
                    <Plus size={16} color="#ffffff" />
                    <Text style={styles.addButtonText}>Produkt hinzufügen</Text>
                  </TouchableOpacity>
                </View>
              )}
              
            </View>

            {project.project_notes && projectProducts.length === 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notizen</Text>
                <View style={styles.card}>
                  <Text style={{ fontSize: 16, color: '#374151', lineHeight: 24 }}>
                    {project.project_notes}
                  </Text>
                </View>
              </View>
            )}
          </View>
      </ScrollView>
    </View>
  );
}