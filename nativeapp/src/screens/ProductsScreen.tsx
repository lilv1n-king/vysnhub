import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Alert, Modal, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ShoppingCart, X, Plus, Minus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ProductsStackParamList } from '../navigation/ProductsStackNavigator';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import { VysnProduct } from '../../lib/types/product';
import { getProducts } from '../../lib/utils/product-data';
import { Project } from '../../lib/types/project';
import { useAuth } from '../../lib/contexts/AuthContext';
import { supabase } from '../../lib/utils/supabase';

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
  // Project modal styles
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
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  addToProjectButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addToProjectText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});

type ProductsScreenNavigationProp = StackNavigationProp<ProductsStackParamList, 'ProductsList'>;

export default function ProductsScreen() {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const auth = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<VysnProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<VysnProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<VysnProduct | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productData = await getProducts();
        setProducts(productData);
        setFilteredProducts(productData.slice(0, 20)); // Show first 20 products initially
      } catch (error) {
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
    navigation.navigate('ProductDetail', { id: product.itemNumberVysn });
  };



  const loadUserProjects = async () => {
    if (!auth?.user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading projects:', error);
        return;
      }

      setUserProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleAddToProject = (product: VysnProduct) => {
    setSelectedProduct(product);
    setQuantity(1); // Reset quantity
    loadUserProjects();
    setShowProjectModal(true);
  };

  const handleAddToExistingProject = async (projectId: string) => {
    if (!selectedProduct || !auth?.user || !supabase) return;

    try {
      // Hier könntest du später eine project_products Tabelle verwenden
      // Für jetzt fügen wir das Produkt zu den project_notes hinzu
      const { data: project, error: fetchError } = await supabase
        .from('user_projects')
        .select('project_notes')
        .eq('id', projectId)
        .single();

      if (fetchError) {
        Alert.alert('Error', `Failed to fetch project: ${fetchError.message}`);
        return;
      }

      const existingNotes = project?.project_notes || '';
      const productInfo = `${quantity}x ${selectedProduct.vysnName} (${selectedProduct.itemNumberVysn})`;
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
        Alert.alert('Error', `Failed to add product to project: ${error.message}`);
        return;
      }

      Alert.alert('Success', `${quantity}x ${selectedProduct.vysnName} added to project successfully!`);
      setShowProjectModal(false);
      setSelectedProduct(null);
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to project:', error);
      Alert.alert('Error', 'Failed to add product to project');
    }
  };

  const handleCreateNewProject = async () => {
    if (!newProjectName.trim() || !selectedProduct || !auth?.user || !supabase) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    try {
      const productInfo = `${quantity}x ${selectedProduct.vysnName} (${selectedProduct.itemNumberVysn})`;
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
        Alert.alert('Error', `Failed to create project: ${error.message}`);
        return;
      }

      Alert.alert('Success', 'Project created and product added successfully!');
      setShowProjectModal(false);
      setSelectedProduct(null);
      setNewProjectName('');
      setQuantity(1);
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Error', 'Failed to create project');
    }
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

            <View style={styles.productActions}>
              <TouchableOpacity
                style={styles.addToProjectButton}
                onPress={() => handleAddToProject(item)}
              >
                <ShoppingCart size={16} color="#ffffff" />
                <Text style={styles.addToProjectText}>Add to Project</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Loading products...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
              <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
      
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
              <Text style={styles.modalTitle}>Add to Project</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowProjectModal(false)}
              >
                <X size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            {selectedProduct && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#000000' }}>
                  {selectedProduct.vysnName}
                </Text>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>
                  {selectedProduct.itemNumberVysn}
                </Text>
                
                {/* Quantity Selection */}
                <View style={{ marginTop: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                    Quantity:
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity 
                      style={{
                        width: 40,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#d1d5db',
                        borderRadius: 8,
                        backgroundColor: '#ffffff'
                      }}
                      onPress={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus size={20} color={quantity <= 1 ? '#9ca3af' : '#000000'} />
                    </TouchableOpacity>
                    
                    <TextInput
                      style={{
                        width: 60,
                        height: 40,
                        textAlign: 'center',
                        fontSize: 16,
                        fontWeight: '600',
                        borderWidth: 1,
                        borderColor: '#d1d5db',
                        borderRadius: 8,
                        backgroundColor: '#ffffff'
                      }}
                      value={quantity.toString()}
                      onChangeText={(text) => {
                        const value = parseInt(text) || 1;
                        if (value >= 1 && value <= 99) {
                          setQuantity(value);
                        }
                      }}
                      keyboardType="numeric"
                    />
                    
                    <TouchableOpacity 
                      style={{
                        width: 40,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#d1d5db',
                        borderRadius: 8,
                        backgroundColor: '#ffffff'
                      }}
                      onPress={() => setQuantity(Math.min(99, quantity + 1))}
                      disabled={quantity >= 99}
                    >
                      <Plus size={20} color={quantity >= 99 ? '#9ca3af' : '#000000'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            <ScrollView style={{ maxHeight: 300 }}>
              {userProjects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.projectItem}
                  onPress={() => handleAddToExistingProject(project.id)}
                >
                  <Text style={styles.projectName}>{project.project_name}</Text>
                  <Text style={styles.projectDescription}>
                    {project.project_description || 'No description'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.createProjectContainer}>
              <Text style={styles.createProjectTitle}>Create New Project</Text>
              
              <Button onPress={() => {
                setShowProjectModal(false);
                navigation.navigate('Projects', {
                  screen: 'CreateProject',
                  params: {
                    productInfo: {
                      itemNumber: selectedProduct?.itemNumberVysn || '',
                      name: selectedProduct?.vysnName || '',
                      quantity: quantity
                    }
                  }
                });
              }}>
                Vollständiges Projekt erstellen
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}