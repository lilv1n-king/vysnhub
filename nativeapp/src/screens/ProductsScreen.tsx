import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Alert, Modal, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ShoppingCart, X, Plus, Minus, Filter } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ProductsStackParamList } from '../navigation/ProductsStackNavigator';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import { VysnProduct } from '../../lib/types/product';
import { getProducts, searchProducts } from '../../lib/utils/product-data';
import { Project } from '../../lib/types/project';
import { useAuth } from '../../lib/contexts/AuthContext';
import { projectService } from '../../lib/services/projectService';
import ProductFilterBar, { ProductFilters, FilterOptions } from '../components/ProductFilterBar';
import { filterService } from '../../lib/services/filterService';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchInputContainer: {
    position: 'relative',
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: 48,
    paddingRight: 20,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 0,
    minHeight: 52,
    color: '#000000',
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
  // Filter-related styles
  filterButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    position: 'relative',
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
    shadowOpacity: 0.15,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clearFiltersButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
});

type ProductsScreenNavigationProp = StackNavigationProp<ProductsStackParamList, 'ProductsList'>;

export default function ProductsScreen() {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const auth = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<VysnProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<VysnProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<VysnProduct | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Filter-related state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<ProductFilters>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions | undefined>();
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isFilteredSearch, setIsFilteredSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load products and filter options in parallel
        const [productData, filterOpts] = await Promise.all([
          getProducts(),
          filterService.getFilterOptions().catch(() => undefined) // Don't fail if filter options can't be loaded
        ]);
        
        setProducts(productData);
        setFilteredProducts(productData.slice(0, 20)); // Show first 20 products initially
        setFilterOptions(filterOpts);
      } catch (error) {
        // Optional: Show error message to user
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Handle search query changes (API-based search)
  useEffect(() => {
    if (isFilteredSearch) return; // Don't interfere with filtered searches
    
    const performSearch = async () => {
      if (searchQuery.trim() === '') {
        setFilteredProducts(products.slice(0, 20));
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        console.log(`🔍 Performing API search for: "${searchQuery}"`);
        const searchResults = await searchProducts(searchQuery);
        setFilteredProducts(searchResults);
        console.log(`✅ Search returned ${searchResults.length} results`);
      } catch (error) {
        console.error('❌ Search error:', error);
        setFilteredProducts([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search to avoid too many API calls
    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, products, isFilteredSearch]);

  // Count active filters
  useEffect(() => {
    const count = Object.keys(currentFilters).filter(key => {
      const value = currentFilters[key as keyof ProductFilters];
      return value !== undefined && value !== '' && value !== null;
    }).length;
    setActiveFiltersCount(count);
  }, [currentFilters]);

  const handleProductPress = (product: VysnProduct) => {
    const itemNumber = product.itemNumberVysn || product.item_number_vysn;
    console.log(`🔍 NavigatingProductDetail with ID: ${itemNumber}`, product);
    
    if (!itemNumber) {
      Alert.alert('Fehler', 'Produktnummer nicht verfügbar');
      return;
    }
    
    navigation.navigate('ProductDetail', { id: itemNumber });
  };

  // Filter handling functions
  const handleApplyFilters = async (filters: ProductFilters) => {
    try {
      setLoading(true);
      setIsFilteredSearch(true);
      
      // Include search query in filters if present
      const filtersWithSearch = {
        ...filters,
        searchQuery: searchQuery.trim() || undefined
      };
      
      const result = await filterService.searchProductsWithFilters(filtersWithSearch);
      
      // Convert backend products to VysnProduct format
      const convertedProducts = result.products.map((product: any) => ({
        id: product.id,
        vysnName: product.vysn_name || '',
        itemNumberVysn: product.item_number_vysn || '',
        shortDescription: product.short_description || '',
        longDescription: product.long_description || '',
        grossPrice: product.gross_price,
        category1: product.category_1,
        category2: product.category_2,
        groupName: product.group_name,
        ingressProtection: product.ingress_protection,
        material: product.material,
        housingColor: product.housing_color,
        energyClass: product.energy_class,
        ledType: product.led_type,
        lumen: product.lumen,
        wattage: product.wattage,
        cct: product.cct,
        cri: product.cri,
        availability: product.availability,
        productPicture1: product.product_picture_1,
        productPicture2: product.product_picture_2,
        productPicture3: product.product_picture_3,
        productPicture4: product.product_picture_4,
        productPicture5: product.product_picture_5,
        productPicture6: product.product_picture_6,
        productPicture7: product.product_picture_7,
        productPicture8: product.product_picture_8,
        // Add other fields as needed
      }));
      
      setFilteredProducts(convertedProducts);
      setCurrentFilters(filters);
    } catch (error) {
      console.error('Error applying filters:', error);
      Alert.alert(t('common.error'), 'Fehler beim Anwenden der Filter');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setCurrentFilters({});
    setIsFilteredSearch(false);
    setFilteredProducts(products.slice(0, 20));
  };

  const handleShowFilterModal = () => {
    setShowFilterModal(true);
  };



  const loadUserProjects = async () => {
    if (!auth?.user) return;

    try {
      console.log('📂 Loading active user projects for modal...');
      const allProjects = await projectService.getUserProjects();
      // Nur aktive Projekte (nicht completed) anzeigen
      const activeProjects = allProjects.filter(project => project.status !== 'completed');
      console.log(`✅ Loaded ${activeProjects.length} active projects for selection (${allProjects.length} total)`);
      setUserProjects(activeProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      setUserProjects([]);
    }
  };

  const handleAddToProject = (product: VysnProduct) => {
    setSelectedProduct(product);
    setQuantity(1); // Reset quantity
    loadUserProjects();
    setShowProjectModal(true);
  };

  const handleAddToExistingProject = async (projectId: string) => {
    if (!selectedProduct || !auth?.user) return;

    try {
      console.log(`➕ Adding ${quantity}x ${selectedProduct.vysnName} to project ${projectId}`);
      
      // Get current project
      const project = await projectService.getProject(projectId);
      if (!project) {
        Alert.alert(t('common.error'), 'Project not found');
        return;
      }

      const existingNotes = project.project_notes || '';
      const productInfo = `${quantity}x ${selectedProduct.vysnName} (${selectedProduct.itemNumberVysn})`;
      const updatedNotes = existingNotes 
        ? `${existingNotes}\n• ${productInfo}`
        : `Products:\n• ${productInfo}`;

      // Update project via API service
      await projectService.updateProject(projectId, { 
        project_notes: updatedNotes
      });

      Alert.alert(t('common.success'), t('products.productAddedSuccess', { quantity, productName: selectedProduct.vysnName }));
      setShowProjectModal(false);
      setSelectedProduct(null);
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to project:', error);
      Alert.alert(t('common.error'), t('products.failedToAddProduct'));
    }
  };

  const handleCreateNewProject = async () => {
    if (!newProjectName.trim() || !selectedProduct || !auth?.user) {
      Alert.alert(t('common.error'), t('products.enterProjectName'));
      return;
    }

    try {
      console.log(`🏗️ Creating new project: ${newProjectName.trim()}`);
      
      const productInfo = `${quantity}x ${selectedProduct.vysnName} (${selectedProduct.itemNumberVysn})`;
      const projectData = {
        project_name: newProjectName.trim(),
        project_notes: `Products:\n• ${productInfo}`,
        status: 'planning' as const,
        priority: 'medium' as const
      };

      // Create project via API service
      const newProject = await projectService.createProject(projectData);

      Alert.alert(t('common.success'), t('products.projectCreatedSuccess'));
      setShowProjectModal(false);
      setSelectedProduct(null);
      setNewProjectName('');
      setQuantity(1);
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert(t('common.error'), t('products.failedToCreateProject'));
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
            {(item.productPicture1 || item.product_picture_1) ? (
              <Image
                source={{ uri: item.productPicture1 || item.product_picture_1 }}
                style={styles.productImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.productSpecGray}>{t('common.noImage')}</Text>
            )}
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.vysnName || item.vysn_name || 'Produktname nicht verfügbar'}
            </Text>
            
            <Text style={styles.productNumber}>
              {item.itemNumberVysn || item.item_number_vysn || 'Artikelnummer nicht verfügbar'}
            </Text>
            
            <Text style={styles.productDescription} numberOfLines={3}>
              {item.shortDescription || item.short_description || 'Beschreibung nicht verfügbar'}
            </Text>

            <View style={styles.productActions}>
              <TouchableOpacity
                style={styles.addToProjectButton}
                onPress={() => handleAddToProject(item)}
              >
                <ShoppingCart size={16} color="#ffffff" />
                <Text style={styles.addToProjectText}>{t('products.addToProject')}</Text>
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
          <Text style={styles.emptyStateText}>{t('products.loadingProducts')}</Text>
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
            size={24} 
            color="#000000" 
            style={styles.searchIcon}
          />
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('products.searchPlaceholder')}
            placeholderTextColor="#000000"
            style={styles.searchInput}
          />
        </View>
        
        {/* Filter Button */}
        <View style={styles.filterButtonContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, activeFiltersCount > 0 ? styles.filterButtonActive : null]}
            onPress={handleShowFilterModal}
          >
            <Filter size={24} color={activeFiltersCount > 0 ? "#ffffff" : "#000000"} />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {activeFiltersCount > 0 && (
            <TouchableOpacity style={styles.clearFiltersButton} onPress={handleClearFilters}>
              <X size={16} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isSearching ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#1f2937" />
          <Text style={styles.emptyStateText}>
            {t('products.searching')}...
          </Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Search size={64} color="#d1d5db" />
          <Text style={styles.emptyStateText}>
            {searchQuery ? t('products.noProductsFound') : t('products.noProductsAvailable')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item, index) => item.itemNumberVysn || item.id?.toString() || `product-${index}`}
          numColumns={1}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter Modal */}
      <ProductFilterBar
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        filterOptions={filterOptions}
        currentFilters={currentFilters}
      />

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
              <Text style={styles.modalTitle}>{t('products.addToProjectTitle')}</Text>
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
                    {t('common.quantity')}:
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
                    {project.project_description || t('products.noDescription')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.createProjectContainer}>
              <Text style={styles.createProjectTitle}>{t('products.createNewProject')}</Text>
              
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
                {t('products.createFullProject')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}