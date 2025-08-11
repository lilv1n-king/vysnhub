import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, FlatList } from 'react-native';
import { Filter, X, ChevronDown, RotateCcw } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';

// Filter-Interfaces
export interface ProductFilters {
  searchQuery?: string;
  category1?: string;
  category2?: string;
  groupName?: string;
  ingressProtection?: string;
  material?: string;
  housingColor?: string;
  energyClass?: string;
  ledType?: string;
  installation?: string;
  minPrice?: number;
  maxPrice?: number;
  minWattage?: number;
  maxWattage?: number;
  minLumen?: number;
  maxLumen?: number;
  minCct?: number;
  maxCct?: number;
  minCri?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface FilterOptions {
  categories: {
    category1: string[];
    category2: string[];
    groups: string[];
  };
  technical: {
    ipClasses: string[];
    materials: string[];
    colors: string[];
    energyClasses: string[];
    ledTypes: string[];
    installationTypes: string[];
  };
  ranges: {
    priceRange: { min: number; max: number };
    wattageRange: { min: number; max: number };
    lumenRange: { min: number; max: number };
    cctRange: { min: number; max: number };
  };
}

interface ProductFilterBarProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ProductFilters) => void;
  filterOptions?: FilterOptions;
  currentFilters: ProductFilters;
}

interface DropdownProps {
  label: string;
  value?: string;
  options: string[];
  onSelect: (value: string | undefined) => void;
  placeholder: string;
}

const Dropdown: React.FC<DropdownProps> = ({ label, value, options, onSelect, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === value) {
      onSelect(undefined); // Deselect if same value
    } else {
      onSelect(selectedValue);
    }
    setIsOpen(false);
  };

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownButton, value ? styles.dropdownButtonActive : null]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[styles.dropdownButtonText, value ? styles.dropdownButtonTextActive : null]}>
          {value || placeholder}
        </Text>
        <ChevronDown size={20} color={value ? '#ffffff' : '#6b7280'} />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item === value ? styles.optionItemSelected : null
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[
                    styles.optionText,
                    item === value ? styles.optionTextSelected : null
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

interface PriceRangeProps {
  min: number;
  max: number;
  currentMin?: number;
  currentMax?: number;
  onRangeChange: (min: number | undefined, max: number | undefined) => void;
}

const PriceRange: React.FC<PriceRangeProps> = ({ min, max, currentMin, currentMax, onRangeChange }) => {
  const { t } = useTranslation();
  
  // Preise in sinnvolle Bereiche aufteilen
  const priceSteps = [
    { label: 'Bis €50', max: 50 },
    { label: '€50-€100', min: 50, max: 100 },
    { label: '€100-€250', min: 100, max: 250 },
    { label: '€250-€500', min: 250, max: 500 },
    { label: 'Über €500', min: 500 }
  ];

  const isStepSelected = (step: any) => {
    if (step.min === undefined && step.max) {
      return currentMin === undefined && currentMax === step.max;
    } else if (step.min && step.max) {
      return currentMin === step.min && currentMax === step.max;
    } else if (step.min && step.max === undefined) {
      return currentMin === step.min && currentMax === undefined;
    }
    return false;
  };

  const handleStepPress = (step: any) => {
    if (isStepSelected(step)) {
      onRangeChange(undefined, undefined);
    } else {
      onRangeChange(step.min, step.max);
    }
  };

  return (
    <View style={styles.priceRangeContainer}>
      <Text style={styles.dropdownLabel}>{t('products.filter.priceRange')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.priceStepsContainer}>
        {priceSteps.map((step, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.priceStep,
              isStepSelected(step) ? styles.priceStepActive : null
            ]}
            onPress={() => handleStepPress(step)}
          >
            <Text style={[
              styles.priceStepText,
              isStepSelected(step) ? styles.priceStepTextActive : null
            ]}>
              {step.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default function ProductFilterBar({ 
  visible, 
  onClose, 
  onApplyFilters, 
  filterOptions, 
  currentFilters 
}: ProductFilterBarProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ProductFilters>(currentFilters);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Early return if filterOptions not loaded yet
  if (!filterOptions || !filterOptions.categories) {
    return null;
  }

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  useEffect(() => {
    const count = Object.keys(filters).filter(key => {
      const value = filters[key as keyof ProductFilters];
      return value !== undefined && value !== '' && value !== null;
    }).length;
    setActiveFiltersCount(count);
  }, [filters]);

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  if (!filterOptions) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('products.filter.title')}</Text>
          <View style={styles.headerActions}>
            {activeFiltersCount > 0 && (
              <TouchableOpacity style={styles.resetButton} onPress={clearAllFilters}>
                <RotateCcw size={20} color="#6b7280" />
                <Text style={styles.resetButtonText}>{t('products.filter.reset')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Kategorien */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('products.filter.categories')}</Text>
            
            <Dropdown
              label={t('products.filter.category1')}
              value={filters.category1}
              options={filterOptions.categories.category1}
              onSelect={(value) => updateFilter('category1', value)}
              placeholder={t('products.filter.selectCategory1')}
            />

            <Dropdown
              label={t('products.filter.category2')}
              value={filters.category2}
              options={filterOptions.categories.category2}
              onSelect={(value) => updateFilter('category2', value)}
              placeholder={t('products.filter.selectCategory2')}
            />

            <Dropdown
              label={t('products.filter.groupName')}
              value={filters.groupName}
              options={filterOptions.categories.groups}
              onSelect={(value) => updateFilter('groupName', value)}
              placeholder={t('products.filter.selectGroup')}
            />
          </View>

          {/* Technische Eigenschaften */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('products.filter.technical')}</Text>
            
            <Dropdown
              label={t('products.filter.ipProtection')}
              value={filters.ingressProtection}
              options={filterOptions.technical.ipClasses}
              onSelect={(value) => updateFilter('ingressProtection', value)}
              placeholder={t('products.filter.selectIP')}
            />

            <Dropdown
              label={t('products.filter.material')}
              value={filters.material}
              options={filterOptions.technical.materials}
              onSelect={(value) => updateFilter('material', value)}
              placeholder={t('products.filter.selectMaterial')}
            />

            <Dropdown
              label={t('products.filter.color')}
              value={filters.housingColor}
              options={filterOptions.technical.colors}
              onSelect={(value) => updateFilter('housingColor', value)}
              placeholder={t('products.filter.selectColor')}
            />

            <Dropdown
              label={t('products.filter.energyClass')}
              value={filters.energyClass}
              options={filterOptions.technical.energyClasses}
              onSelect={(value) => updateFilter('energyClass', value)}
              placeholder={t('products.filter.selectEnergyClass')}
            />

            <Dropdown
              label={t('products.filter.ledType')}
              value={filters.ledType}
              options={filterOptions.technical.ledTypes}
              onSelect={(value) => updateFilter('ledType', value)}
              placeholder={t('products.filter.selectLedType')}
            />
          </View>

          {/* Preis-Bereich */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('products.filter.price')}</Text>
            <PriceRange
              min={filterOptions.ranges.priceRange.min}
              max={filterOptions.ranges.priceRange.max}
              currentMin={filters.minPrice}
              currentMax={filters.maxPrice}
              onRangeChange={(min, max) => {
                updateFilter('minPrice', min);
                updateFilter('maxPrice', max);
              }}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            onPress={applyFilters}
            style={styles.applyButton}
          >
            <Text style={styles.applyButtonText}>
              {`${t('products.filter.apply')} ${activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}`}
            </Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  dropdownButtonActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  dropdownButtonTextActive: {
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionItemSelected: {
    backgroundColor: '#f3f4f6',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
  },
  optionTextSelected: {
    fontWeight: '500',
    color: '#111827',
  },
  priceRangeContainer: {
    marginBottom: 16,
  },
  priceStepsContainer: {
    flexDirection: 'row',
  },
  priceStep: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  priceStepActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  priceStepText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  priceStepTextActive: {
    color: '#ffffff',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  applyButton: {
    backgroundColor: '#111827',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});