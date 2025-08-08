'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Filter, RotateCcw, ChevronDown } from 'lucide-react';

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
  onApplyFilters: (filters: ProductFilters) => void;
  filterOptions?: FilterOptions;
  currentFilters: ProductFilters;
  className?: string;
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
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <button
        type="button"
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-md text-sm ${
          value ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || placeholder}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
            onClick={() => handleSelect('')}
          >
            Alle
          </button>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                option === value ? 'bg-gray-100 font-medium' : ''
              }`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
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
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Preisbereich</label>
      <div className="flex flex-wrap gap-2">
        {priceSteps.map((step, index) => (
          <Button
            key={index}
            variant={isStepSelected(step) ? "default" : "outline"}
            size="sm"
            onClick={() => handleStepPress(step)}
            className="text-xs"
          >
            {step.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default function ProductFilterBar({ 
  onApplyFilters, 
  filterOptions, 
  currentFilters,
  className = ""
}: ProductFilterBarProps) {
  const [filters, setFilters] = useState<ProductFilters>(currentFilters);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

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
  };

  if (!filterOptions) {
    return null;
  }

  // Render active filters as badges
  const renderActiveFilters = () => {
    const activeFilterEntries = Object.entries(filters).filter(([key, value]) => 
      value !== undefined && value !== '' && value !== null
    );

    if (activeFilterEntries.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {activeFilterEntries.map(([key, value]) => {
          const filterLabels: Record<string, string> = {
            category1: 'Kategorie 1',
            category2: 'Kategorie 2',
            groupName: 'Gruppe',
            ingressProtection: 'IP-Schutz',
            material: 'Material',
            housingColor: 'Farbe',
            energyClass: 'Energieklasse',
            ledType: 'LED-Typ',
            minPrice: 'Min. Preis',
            maxPrice: 'Max. Preis',
          };

          const label = filterLabels[key] || key;
          
          return (
            <span key={key} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md">
              <span>{label}: {value}</span>
              <X 
                size={12} 
                className="cursor-pointer hover:bg-gray-200 rounded" 
                onClick={() => updateFilter(key as keyof ProductFilters, undefined)}
              />
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Toggle Button (Mobile) */}
      <div className="md:hidden">
        <Button 
          variant="outline" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
        >
          <Filter size={16} className="mr-2" />
          Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          <ChevronDown size={16} className={`ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Filter Content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} md:block`}>
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Kategorie 1 */}
            <Dropdown
              label="Hauptkategorie"
              value={filters.category1}
              options={filterOptions.categories.category1}
              onSelect={(value) => updateFilter('category1', value)}
              placeholder="Kategorie wählen"
            />

            {/* Kategorie 2 */}
            <Dropdown
              label="Unterkategorie"
              value={filters.category2}
              options={filterOptions.categories.category2}
              onSelect={(value) => updateFilter('category2', value)}
              placeholder="Kategorie wählen"
            />

            {/* Gruppe */}
            <Dropdown
              label="Gruppe"
              value={filters.groupName}
              options={filterOptions.categories.groups}
              onSelect={(value) => updateFilter('groupName', value)}
              placeholder="Gruppe wählen"
            />

            {/* IP-Schutzklasse */}
            <Dropdown
              label="IP-Schutzklasse"
              value={filters.ingressProtection}
              options={filterOptions.technical.ipClasses}
              onSelect={(value) => updateFilter('ingressProtection', value)}
              placeholder="IP-Klasse wählen"
            />

            {/* Material */}
            <Dropdown
              label="Material"
              value={filters.material}
              options={filterOptions.technical.materials}
              onSelect={(value) => updateFilter('material', value)}
              placeholder="Material wählen"
            />

            {/* Energieklasse */}
            <Dropdown
              label="Energieklasse"
              value={filters.energyClass}
              options={filterOptions.technical.energyClasses}
              onSelect={(value) => updateFilter('energyClass', value)}
              placeholder="Energieklasse wählen"
            />
          </div>

          {/* Preis-Bereich */}
          <div className="mt-6 pt-4 border-t">
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
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t flex flex-col md:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={clearAllFilters}
              disabled={activeFiltersCount === 0}
              className="md:w-auto"
            >
              <RotateCcw size={16} className="mr-2" />
              Zurücksetzen
            </Button>
            <Button 
              onClick={applyFilters}
              className="md:w-auto"
            >
              Filter anwenden {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </div>
        </Card>
      </div>

      {/* Active Filters Display */}
      {renderActiveFilters()}
    </div>
  );
}