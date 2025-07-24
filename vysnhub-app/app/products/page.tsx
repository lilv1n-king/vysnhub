'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Eye } from 'lucide-react';
import Header from '@/components/header';
import { getAllProducts } from '@/lib/utils/product-data';
import { formatPrice } from '@/lib/utils';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const products = getAllProducts();
  
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

  const categories = useMemo(() => {
    const cats = [...new Set(products.flatMap(p => [p.category1, p.category2]).filter(Boolean))];
    return cats.sort();
  }, [products]);


  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Product Catalog</h1>
          <p className="text-gray-600 mt-2">
            {filteredProducts.length} products found
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products, item numbers, descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                
                <h3 className="font-semibold text-black mb-2 line-clamp-2">
                  {product.vysnName || 'Unnamed Product'}
                </h3>
                
                <p className="text-sm text-gray-600 mb-2">
                  #{product.itemNumberVysn}
                </p>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {product.longDescription || product.shortDescription || 'No description available'}
                </p>
                
                {product.grossPrice && (
                  <p className="font-semibold text-black mb-4">
                    {formatPrice(product.grossPrice)}
                  </p>
                )}
                
                <Link href={`/products/${product.itemNumberVysn}`}>
                  <Button className="w-full" variant="outline">
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