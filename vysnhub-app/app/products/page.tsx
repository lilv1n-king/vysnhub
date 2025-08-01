'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Eye } from 'lucide-react';
import Header from '@/components/header';
import { getAllProducts, getCategories } from '@/lib/utils/product-data';
import { formatPrice } from '@/lib/utils';
import { VysnProduct } from '@/lib/types/product';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState<VysnProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load products and categories from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getAllProducts(),
          getCategories()
        ]);
        
        setProducts(productsData);
        const allCategories = [...new Set([...categoriesData.category1, ...categoriesData.category2])];
        setCategories(allCategories.sort());
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Fehler beim Laden der Produkte. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchQuery === '' || 
        product.vysnName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.itemNumberVysn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.longDescription || product.shortDescription)?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || 
        product.category1 === selectedCategory || product.category2 === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);


  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-36 pb-6 md:pb-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Lade Produkte...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-36 pb-6 md:pb-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Erneut versuchen
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-36 pb-6 md:pb-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-black">Product Catalog</h1>
          <p className="text-gray-600 mt-2">
            {filteredProducts.length} products found
          </p>
        </div>

        {/* Mobile-optimierte Suche und Filter */}
        <div className="space-y-4 mb-6 md:mb-8">
          {/* Suchfeld */}
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search products, item numbers, descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 md:h-10 text-base md:text-sm border-2 border-gray-300 focus:border-black"
            />
          </div>
          
          {/* Kategorie-Filter - Mobile scrollbar */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Categories:</p>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('')}
                className="flex-shrink-0 h-12 px-6 text-base md:h-8 md:px-4 md:text-sm font-medium"
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className="flex-shrink-0 h-12 px-6 text-base md:h-8 md:px-4 md:text-sm font-medium whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.itemNumberVysn} className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-square mb-4 bg-white rounded-md overflow-hidden relative border border-gray-200">
                  {product.product_picture_1 ? (
                    <Image 
                      src={product.product_picture_1} 
                      alt={product.vysnName || 'Product image'}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Eye className="h-12 w-12" />
                    </div>
                  )}
                </div>
                
                <h3 className="font-semibold text-black mb-2 line-clamp-2 text-sm md:text-base">
                  {product.vysnName || 'Unnamed Product'}
                </h3>
                
                <p className="text-xs md:text-sm text-gray-600 mb-2">
                  #{product.itemNumberVysn}
                </p>
                
                <p className="text-xs md:text-sm text-gray-600 mb-4 line-clamp-2">
                  {product.longDescription || product.shortDescription || 'No description available'}
                </p>
                
                {product.grossPrice && (
                  <p className="font-semibold text-black mb-4 text-sm md:text-base">
                    {formatPrice(product.grossPrice)}
                  </p>
                )}
                
                <Link href={`/products/${product.itemNumberVysn}`}>
                  <Button className="w-full h-12 md:h-10 text-base md:text-sm font-medium" variant="outline">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
}