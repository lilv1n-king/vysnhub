import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Linking, Alert, Modal, ActivityIndicator, TextInput, FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, Download, Plus, Minus, ShoppingCart, RefreshCw, MessageCircle, Send, Eye, X } from 'lucide-react-native';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Header from '../components/Header';
import { VysnProduct } from '../../lib/types/product';
import { Project } from '../../lib/types/project';
import { getProductByItemNumber } from '../../lib/utils/product-data';
import { useAuth } from '../../lib/contexts/AuthContext';
import { supabase } from '../../lib/utils/supabase';

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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6b7280',
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
    borderColor: '#e5e7eb',
    borderWidth: 1,
    marginBottom: 16,
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
  const navigation = useNavigation();
  const auth = useAuth();
  const { id } = route.params as { id: string };
  
  // Product state
  const [product, setProduct] = useState<VysnProduct | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Quantity and order state
  const [quantity, setQuantity] = useState(1);
  const [isAddingToProject, setIsAddingToProject] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  
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
          setError('Produkt nicht gefunden');
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Fehler beim Laden des Produkts');
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
    if (!inventoryData.inStock) return { text: "Nicht verfügbar", color: "#dc2626", bgColor: "#fef2f2" };
    if (inventoryData.stockQuantity <= inventoryData.lowStockThreshold) {
      return { text: "Wenig Lager", color: "#d97706", bgColor: "#fffbeb" };
    }
    return { text: "Verfügbar", color: "#059669", bgColor: "#f0fdf4" };
  };

  const getMaxQuantity = () => {
    return Math.min(inventoryData.stockQuantity, 99);
  };

  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    const maxQty = getMaxQuantity();
    if (value > maxQty) {
      Alert.alert('Warnung', `Nur ${maxQty} Stück verfügbar`);
      return;
    }
    setQuantity(value);
  };

  const loadProjects = async () => {
    if (!auth?.user || !supabase) return;
    
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading projects:', error);
        Alert.alert('Fehler', `Projekte konnten nicht geladen werden: ${error.message}`);
        setProjects([]);
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      Alert.alert('Fehler', 'Projekte konnten nicht geladen werden');
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleAddToProject = async () => {
    if (!inventoryData.inStock) {
      Alert.alert('Nicht verfügbar', 'Produkt ist derzeit nicht verfügbar');
      return;
    }
    if (quantity > inventoryData.stockQuantity) {
      Alert.alert('Nicht genug Lager', `Nur ${inventoryData.stockQuantity} Stück verfügbar`);
      return;
    }
    
    await loadProjects();
    setShowProjectModal(true);
  };

  const addToProject = async (projectId: string) => {
    if (!product || !auth?.user || !supabase) return;
    
    setIsAddingToProject(true);
    try {
      // Hole das aktuelle Projekt
      const { data: project, error: fetchError } = await supabase
        .from('user_projects')
        .select('project_notes')
        .eq('id', projectId)
        .single();

      if (fetchError) {
        Alert.alert('Fehler', `Projekt konnte nicht gefunden werden: ${fetchError.message}`);
        return;
      }

      // Füge Produkt zu den Projekt-Notizen hinzu
      const existingNotes = project?.project_notes || '';
      const productInfo = `${quantity}x ${product.vysnName} (${product.itemNumberVysn})`;
      const updatedNotes = existingNotes 
        ? `${existingNotes}\n• ${productInfo}`
        : `Products:\n• ${productInfo}`;

      const { error } = await supabase
        .from('user_projects')
        .update({ 
          project_notes: updatedNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        Alert.alert('Fehler', `Produkt konnte nicht hinzugefügt werden: ${error.message}`);
        return;
      }

      Alert.alert('Erfolg', `${quantity}x ${product.vysnName} zum Projekt hinzugefügt!`);
      setShowProjectModal(false);
    } catch (error) {
      console.error('Error adding to project:', error);
      Alert.alert('Fehler', 'Produkt konnte nicht zum Projekt hinzugefügt werden');
    } finally {
      setIsAddingToProject(false);
    }
  };

  const createNewProject = async () => {
    if (!newProjectName.trim() || !product || !auth?.user || !supabase) return;
    
    setIsCreatingProject(true);
    try {
      const productInfo = `${quantity}x ${product.vysnName} (${product.itemNumberVysn})`;
      const projectData = {
        user_id: auth.user.id,
        project_name: newProjectName.trim(),

        project_notes: `Products:\n• ${productInfo}`,
        status: 'planning' as const,
        priority: 'medium' as const
      };

      const { data, error } = await supabase
        .from('user_projects')
        .insert([projectData])
        .select()
        .single();

      if (error) {
        Alert.alert('Fehler', `Projekt konnte nicht erstellt werden: ${error.message}`);
        return;
      }

      Alert.alert('Erfolg', 'Projekt erstellt und Produkt hinzugefügt!');
      setShowProjectModal(false);
      setNewProjectName('');
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Fehler', 'Projekt konnte nicht erstellt werden');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleReorder = async () => {
    if (!inventoryData.inStock) {
      Alert.alert('Nicht verfügbar', 'Produkt ist derzeit nicht verfügbar');
      return;
    }
    
    setIsReordering(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    Alert.alert('Erfolg', `${quantity}x ${product?.vysnName} nachbestellt!`);
    setIsReordering(false);
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
        content: `Hier ist Information über ${product.vysnName}. Leider kann ich noch keine echten Antworten geben, aber das Feature wird bald verfügbar sein!` 
      }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Frage.' 
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
          <Text style={styles.loadingText}>Lade Produkt...</Text>
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
            <ArrowLeft size={20} color="#6b7280" />
            <Text style={styles.backText}>Zurück zu Produkten</Text>
          </TouchableOpacity>
          
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>
              {error || 'Produkt nicht gefunden'}
            </Text>
            <Button variant="outline" onPress={() => navigation.goBack()}>
              Zurück zu den Produkten
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
          <ArrowLeft size={20} color="#6b7280" />
          <Text style={styles.backText}>Zurück zu Produkten</Text>
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
                <Text style={styles.noImageText}>Kein Bild verfügbar</Text>
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
                <Text style={styles.downloadButtonText}>Manual herunterladen</Text>
              </View>
            </Button>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>
            {product.vysnName || 'Unnamed Product'}
          </Text>
          
          <Text style={styles.productNumber}>
            Item: #{product.itemNumberVysn}
          </Text>
          
          {product.grossPrice && (
            <Text style={styles.priceText}>
              {formatPrice(product.grossPrice)}
            </Text>
          )}

          {/* Stock Status */}
          <View style={[styles.stockStatus, { backgroundColor: stockStatus.bgColor }]}>
            <View style={[styles.stockStatusDot, { backgroundColor: stockStatus.color }]} />
            <Text style={[styles.stockStatusText, { color: stockStatus.color }]}>
              {stockStatus.text}
            </Text>
          </View>

          {inventoryData.inStock && (
            <View style={styles.stockInfo}>
              <View style={styles.stockInfoRow}>
                <Text style={styles.stockInfoLabel}>Lager:</Text>
                <Text style={styles.stockInfoValue}>{inventoryData.stockQuantity} Stück verfügbar</Text>
              </View>
              <View style={styles.stockInfoRow}>
                <Text style={styles.stockInfoLabel}>Lieferung:</Text>
                <Text style={styles.stockInfoValue}>{inventoryData.estimatedDelivery}</Text>
              </View>
              <View style={styles.stockInfoRow}>
                <Text style={styles.stockInfoLabel}>Lager:</Text>
                <Text style={styles.stockInfoValue}>{inventoryData.warehouse}</Text>
              </View>
            </View>
          )}
          
          <Text style={styles.description}>
            {product.longDescription || product.shortDescription || 'Keine Beschreibung verfügbar'}
          </Text>
        </View>

        {/* Quantity and Order Section */}
        <View style={styles.quantitySection}>
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
                ⚠️ Nur {inventoryData.stockQuantity} Stück verfügbar
              </Text>
            </View>
          )}

          {/* Low Stock Warning */}
          {inventoryData.inStock && inventoryData.stockQuantity <= inventoryData.lowStockThreshold && (
            <View style={styles.lowStockWarning}>
              <Text style={styles.lowStockWarningText}>
                🔥 Nur noch {inventoryData.stockQuantity} Stück auf Lager
              </Text>
            </View>
          )}

          {/* Available Quantity Info */}
          {inventoryData.inStock && (
            <Text style={styles.maxQuantityText}>
              Maximal {getMaxQuantity()} Stück bestellbar
            </Text>
          )}

          {/* Total Price */}
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
                ? 'Nicht verfügbar' 
                : isAddingToProject 
                ? 'Wird hinzugefügt...' 
                : 'Zum Projekt hinzufügen'}
            </Text>
          </View>
        </Button>
        
        <Button 
          variant="outline"
          onPress={handleReorder}
          disabled={isReordering || !inventoryData.inStock || quantity > inventoryData.stockQuantity}
          style={styles.actionButtonSecondary}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {isReordering ? (
              <ActivityIndicator size="small" color="#374151" style={{ marginRight: 8 }} />
            ) : (
              <RefreshCw size={20} color="#374151" style={{ marginRight: 8 }} />
            )}
            <Text style={{ color: '#374151', fontWeight: '600', fontSize: 16 }}>
              {!inventoryData.inStock 
                ? 'Nicht verfügbar' 
                : isReordering 
                ? 'Wird nachbestellt...' 
                : 'Nachbestellen'}
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
                {showChat ? 'Chat schließen' : 'Produktfragen stellen'}
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
                      Produkt-Assistent
                    </Text>
                  </View>
                </View>
                
                <ScrollView style={styles.chatHistory} showsVerticalScrollIndicator={false}>
                  {chatHistory.length === 0 && (
                    <Text style={{ color: '#6b7280', fontSize: 14 }}>
                      Fragen Sie mich alles über dieses Produkt...
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
                        <Text style={styles.chatTextAssistant}>Denke nach...</Text>
                      </View>
                    </View>
                  )}
                </ScrollView>
                
                <View style={styles.chatInputContainer}>
                  <Input
                    placeholder="Fragen zu Spezifikationen, Kompatibilität, Installation..."
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

        {/* Technical Specifications */}
        <Card style={styles.specCard}>
          <CardContent>
            <Text style={styles.specCardHeader}>Technische Daten</Text>
            
            {product.wattage && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Leistung:</Text>
                <Text style={styles.specValue}>{product.wattage}W</Text>
              </View>
            )}
            {product.lumen && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Lichtstrom:</Text>
                <Text style={styles.specValue}>{product.lumen} lm</Text>
              </View>
            )}
            {product.cct && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Farbtemperatur:</Text>
                <Text style={styles.specValue}>{product.cct}K</Text>
              </View>
            )}
            {product.beamAngle && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Abstrahlwinkel:</Text>
                <Text style={styles.specValue}>{product.beamAngle}°</Text>
              </View>
            )}
            {product.ingressProtection && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>IP-Schutzklasse:</Text>
                <Text style={styles.specValue}>{product.ingressProtection}</Text>
              </View>
            )}
            {product.energyClass && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Energieklasse:</Text>
                <Text style={styles.specValue}>{product.energyClass}</Text>
              </View>
            )}
            {product.steering && (
              <View style={[styles.specRow, styles.specRowLast]}>
                <Text style={styles.specLabel}>Steuerung:</Text>
                <Text style={styles.specValue}>{product.steering}</Text>
              </View>
            )}
          </CardContent>
        </Card>
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
              <Text style={styles.modalTitle}>Projekt auswählen</Text>
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
                <Text style={styles.loadingText}>Lade Projekte...</Text>
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
                  <Text style={styles.createProjectTitle}>Neues Projekt erstellen</Text>
                  
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
                    Vollständiges Projekt erstellen
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