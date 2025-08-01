'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Download, MessageCircle, Send, Eye, Plus, Minus, ShoppingCart, RefreshCw } from 'lucide-react';
import Header from '@/components/header';
import { getProductByItemNumber } from '@/lib/utils/product-data';
import { formatPrice } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load product from Supabase
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProductByItemNumber(productId);
        if (productData) {
          setProduct(productData);
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

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  // Reset selected image when product changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [productId]);

  // Shopify inventory data (placeholder - will come from Shopify API later)
  // TODO: Replace with actual Shopify API call
  // const inventoryData = await getShopifyInventory(product.itemNumberVysn);
  const inventoryData = {
    inStock: true,
    stockQuantity: 156,
    lowStockThreshold: 10,
    estimatedDelivery: "2-3 business days",
    nextRestock: "2025-02-15",
    warehouse: "Berlin Warehouse"
  };

  // Helper functions for stock status
  const getStockStatus = () => {
    if (!inventoryData.inStock) return { text: "Out of Stock", color: "text-red-600", bgColor: "bg-red-50" };
    if (inventoryData.stockQuantity <= inventoryData.lowStockThreshold) {
      return { text: "Low Stock", color: "text-orange-600", bgColor: "bg-orange-50" };
    }
    return { text: "In Stock", color: "text-green-600", bgColor: "bg-green-50" };
  };

  const getMaxQuantity = () => {
    return Math.min(inventoryData.stockQuantity, 99); // Max 99 or stock quantity
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4 md:pb-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Lade Produkt...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state or product not found
  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4 md:pb-8">
          <div className="mb-4 md:mb-6">
            <Link href="/products" className="flex items-center text-gray-600 hover:text-black text-sm md:text-base">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </div>
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-black mb-4">
              {error || 'Produkt nicht gefunden'}
            </h1>
            <Link href="/products">
              <Button variant="outline">Zurück zu den Produkten</Button>
            </Link>
          </div>
        </main>
      </div>
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
    product.product_picture_8
  ].filter(Boolean);

  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    const maxQty = getMaxQuantity();
    if (value > maxQty) {
      alert(`Only ${maxQty} items available`);
      return;
    }
    setQuantity(value);
  };

  const handleAddToProject = async () => {
    if (!inventoryData.inStock) {
      alert('Product is currently out of stock');
      return;
    }
    if (quantity > inventoryData.stockQuantity) {
      alert(`Only ${inventoryData.stockQuantity} items available`);
      return;
    }
    
    setIsAddingToCart(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`${quantity}x ${product.vysnName} added to project!`);
    setIsAddingToCart(false);
  };

  const handleReorder = async () => {
    if (!inventoryData.inStock) {
      alert('Product is currently out of stock');
      return;
    }
    
    setIsReordering(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`${quantity}x ${product.vysnName} reordered!`);
    setIsReordering(false);
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    const userQuestion = question;
    setQuestion('');
    setChatHistory(prev => [...prev, { role: 'user', content: userQuestion }]);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userQuestion,
          product: product,
        }),
      });
      
      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer || 'Sorry, I could not process your question.' }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error processing your question.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4 md:pb-8">
        <div className="mb-4 md:mb-6">
          <Link href="/products" className="flex items-center text-gray-600 hover:text-black text-sm md:text-base">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </div>

        <div className="space-y-6 md:space-y-8">
          {/* Produktbilder - Mobile First */}
          <div className="w-full">
            <div className="aspect-square mb-4 bg-white rounded-lg overflow-hidden relative border border-gray-200 max-w-md mx-auto">
              {productImages.length > 0 && productImages[selectedImageIndex] ? (
                <Image 
                  src={productImages[selectedImageIndex]} 
                  alt={product.vysnName || 'Product image'}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Eye className="h-24 w-24" />
                </div>
              )}
            </div>
            
            {productImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto mb-4">
                {productImages.slice(0, 8).map((image, index) => 
                  image ? (
                    <div 
                      key={index} 
                      className={`aspect-square bg-white rounded-md overflow-hidden relative cursor-pointer transition-all border-2 ${
                        selectedImageIndex === index 
                          ? 'border-black shadow-lg' 
                          : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <Image 
                        src={image} 
                        alt={`${product.vysnName} ${index + 1}`}
                        fill
                        className="object-contain p-1"
                        sizes="25vw"
                      />
                      {/* Selected indicator */}
                      {selectedImageIndex === index && (
                        <div className="absolute top-1 right-1 w-3 h-3 bg-black rounded-full"></div>
                      )}
                    </div>
                  ) : null
                )}
              </div>
            )}

            {/* Download Manual Button - Large and Black under image */}
            {product.manuallink && (
              <div className="max-w-md mx-auto">
                <a href={product.manuallink} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full h-16 text-lg font-bold bg-black hover:bg-gray-800 text-white">
                    <Download className="h-6 w-6 mr-3" />
                    Download Manual
                  </Button>
                </a>
              </div>
            )}
          </div>

          {/* Produktinfo */}
          <div className="space-y-4 md:space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black mb-2 md:mb-4">
                {product.vysnName || 'Unnamed Product'}
              </h1>
              
              <p className="text-base md:text-lg text-gray-600 mb-2 md:mb-4">
                Item: #{product.itemNumberVysn}
              </p>
              
              {product.grossPrice && (
                <p className="text-xl md:text-2xl font-bold text-black mb-4 md:mb-6">
                  {formatPrice(product.grossPrice)}
                </p>
              )}

              {/* Stock Status - Shopify Integration */}
              <div className="mb-4 md:mb-6 space-y-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStockStatus().bgColor} ${getStockStatus().color}`}>
                  <div className={`w-2 h-2 rounded-full ${getStockStatus().color === 'text-green-600' ? 'bg-green-600' : getStockStatus().color === 'text-orange-600' ? 'bg-orange-600' : 'bg-red-600'}`}></div>
                  {getStockStatus().text}
                </div>
                
                {inventoryData.inStock && (
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Stock:</span>
                      <span>{inventoryData.stockQuantity} items available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Delivery:</span>
                      <span>{inventoryData.estimatedDelivery}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Warehouse:</span>
                      <span>{inventoryData.warehouse}</span>
                    </div>
                  </div>
                )}

                {!inventoryData.inStock && inventoryData.nextRestock && (
                  <div className="text-sm text-gray-600">
                                            <span className="font-medium">Next Delivery:</span> {new Date(inventoryData.nextRestock).toLocaleDateString('en-US')}
                  </div>
                )}
              </div>
              
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                {product.longDescription || product.shortDescription || 'No description available'}
              </p>
            </div>

            {/* Quantity and Order Section - Mobile Optimized */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-base md:text-lg font-medium text-black">Quantity:</label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-12 w-12 p-0 md:h-8 md:w-8"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-20 text-center h-12 md:h-8"
                    min="1"
                    max={getMaxQuantity()}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-12 w-12 p-0 md:h-8 md:w-8"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= getMaxQuantity()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stock Warning */}
              {inventoryData.inStock && quantity > inventoryData.stockQuantity && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">
                    ⚠️ Only {inventoryData.stockQuantity} items available
                  </p>
                </div>
              )}

              {/* Low Stock Warning */}
              {inventoryData.inStock && inventoryData.stockQuantity <= inventoryData.lowStockThreshold && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-orange-600 text-sm">
                    🔥 Only {inventoryData.stockQuantity} items left in stock
                  </p>
                </div>
              )}

              {/* Available Quantity Info */}
              {inventoryData.inStock && (
                <div className="text-xs text-gray-500">
                  Maximum {getMaxQuantity()} items can be ordered
                </div>
              )}

              {/* Total Price */}
              {product.grossPrice && (
                <div className="flex items-center justify-between text-lg md:text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {formatPrice(product.grossPrice * quantity)}
                  </span>
                </div>
              )}

              {/* Action Buttons - Mobile Optimized */}
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleAddToProject}
                  disabled={isAddingToCart || !inventoryData.inStock || quantity > inventoryData.stockQuantity}
                  className="h-14 md:h-10 text-base md:text-sm font-medium disabled:opacity-50"
                >
                  {isAddingToCart ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <ShoppingCart className="h-4 w-4 mr-2" />
                  )}
                  {!inventoryData.inStock 
                    ? 'Out of Stock' 
                    : isAddingToCart 
                    ? 'Adding...' 
                    : 'Add to Project'}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleReorder}
                  disabled={isReordering || !inventoryData.inStock || quantity > inventoryData.stockQuantity}
                  className="h-14 md:h-10 text-base md:text-sm font-medium disabled:opacity-50"
                >
                  {isReordering ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {!inventoryData.inStock 
                    ? 'Out of Stock' 
                    : isReordering 
                    ? 'Reordering...' 
                    : 'Reorder'}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile-optimized Chatbot Section */}
          <div className="w-full">
            <Button 
              onClick={() => setShowChat(!showChat)}
              className="w-full h-14 mb-4 text-base font-medium flex items-center justify-center gap-2 md:hidden"
              variant="outline"
            >
              <MessageCircle className="h-5 w-5" />
              {showChat ? 'Close Chat' : 'Ask Product Questions'}
            </Button>
            
            <Card className={`${showChat ? 'block' : 'hidden'} md:block`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <MessageCircle className="h-5 w-5" />
                  Product Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                  {chatHistory.length === 0 && (
                    <p className="text-gray-600 text-sm">
                      Ask me anything about this product...
                    </p>
                  )}
                  {chatHistory.map((message, index) => (
                    <div key={index} className={`${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block max-w-[80%] p-3 rounded-lg text-sm ${
                        message.role === 'user' 
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-black'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="text-left">
                      <div className="inline-block bg-gray-100 text-black p-3 rounded-lg text-sm">
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about specifications, compatibility, installation..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                    disabled={isLoading}
                    className="h-12 md:h-8 text-base md:text-sm"
                  />
                  <Button 
                    onClick={handleAskQuestion} 
                    disabled={!question.trim() || isLoading}
                    size="icon"
                    className="h-12 w-12 md:h-8 md:w-8"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.wattage && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Power:</span>
                  <span className="font-medium">{product.wattage}W</span>
                </div>
              )}
              {product.lumen && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Lumen:</span>
                  <span className="font-medium">{product.lumen} lm</span>
                </div>
              )}
              {product.cct && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">CCT:</span>
                  <span className="font-medium">{product.cct}K</span>
                </div>
              )}
              {product.beamAngle && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Beam Angle:</span>
                  <span className="font-medium">{product.beamAngle}°</span>
                </div>
              )}
              {product.ingressProtection && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">IP Rating:</span>
                  <span className="font-medium">{product.ingressProtection}</span>
                </div>
              )}
              {product.energyClass && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Energy Class:</span>
                  <span className="font-medium">{product.energyClass}</span>
                </div>
              )}
              {product.steering && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Control:</span>
                  <span className="font-medium">{product.steering}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}