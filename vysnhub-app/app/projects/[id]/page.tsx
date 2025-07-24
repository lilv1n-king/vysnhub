'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Download, Calendar, MapPin, User, Package, Edit, Share, Plus, Minus, ShoppingCart } from 'lucide-react';
import Header from '@/components/header';
import { formatPrice } from '@/lib/utils';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  
  // State für Nachbestellungen
  const [reorderQuantities, setReorderQuantities] = useState<{[key: string]: number}>({});
  const [isReordering, setIsReordering] = useState<{[key: string]: boolean}>({});

  // Demo project data - fokussiert auf Räume und Leuchten
  const project = {
    id: projectId,
    name: "Hotel Mirabell - Lobby Beleuchtung",
    description: "Komplette LED-Beleuchtung für die renovierte Hotellobby mit modernen Downlights und Akzentbeleuchtung.",
    status: "Abgeschlossen",
    date: "2024-12-15",
    location: "Salzburg, Österreich",
    customer: "Hotel Mirabell GmbH",
    electrician: "Elektro Wagner",
    totalValue: 2847.50,
    rooms: [
      {
        name: "Lobby-Bereich",
        area: "120m²",
        lightCount: 20
      },
      {
        name: "Empfangsbereich", 
        area: "45m²",
        lightCount: 9
      }
    ],
    items: [
      {
        itemNumber: "V104100T2W",
        name: "Tevo 360 Downlight",
        description: "Tevo 360 Downlight, White, 2700K",
        quantity: 12,
        unitPrice: 49.90,
        totalPrice: 598.80,
        room: "Lobby-Bereich",
        inStock: true,
        availableQuantity: 156
      },
      {
        itemNumber: "V104100T4W",
        name: "Tevo 360 Downlight 4000K",
        description: "Tevo 360 Downlight, White, 4000K", 
        quantity: 8,
        unitPrice: 49.90,
        totalPrice: 399.20,
        room: "Empfangsbereich",
        inStock: true,
        availableQuantity: 89
      },
      {
        itemNumber: "V102001T1B",
        name: "Track Light System",
        description: "3-Phasen Schienensystem, schwarz",
        quantity: 3,
        unitPrice: 129.90,
        totalPrice: 389.70,
        room: "Lobby-Bereich",
        inStock: true,
        availableQuantity: 24
      },
      {
        itemNumber: "V101001T1B",
        name: "Bounto W",
        description: "Bounto wall lamp, dim to warm, 7W",
        quantity: 6,
        unitPrice: 199.00,
        totalPrice: 1194.00,
        room: "Empfangsbereich",
        inStock: false,
        availableQuantity: 0
      }
    ],
    notes: "Installation erfolgte in zwei Phasen. Erste Phase: Lobby-Bereich, Zweite Phase: Empfangsbereich. Kunde sehr zufrieden mit dem warmen Lichtkonzept."
  };

  const handleQuantityChange = (itemNumber: string, value: number) => {
    if (value < 1) return;
    setReorderQuantities(prev => ({
      ...prev,
      [itemNumber]: value
    }));
  };

  const handleReorder = async (item: any) => {
    const quantity = reorderQuantities[item.itemNumber] || 1;
    
    setIsReordering(prev => ({ ...prev, [item.itemNumber]: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert(`${quantity}x ${item.name} nachbestellt!`);
    
    setIsReordering(prev => ({ ...prev, [item.itemNumber]: false }));
    setReorderQuantities(prev => ({ ...prev, [item.itemNumber]: 1 }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Navigation */}
        <div className="mb-4 md:mb-6">
          <Link href="/projects" className="flex items-center text-gray-600 hover:text-black text-sm md:text-base">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zu Projekte
          </Link>
        </div>

        {/* Project Header */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">
                  {project.name}
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  {project.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <Share className="h-4 w-4 mr-2" />
                  Teilen
                </Button>
              </div>
            </div>

            {/* Räume/Bereiche */}
            <div className="mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-black mb-4">Beleuchtete Bereiche</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {project.rooms.map((room, index) => (
                  <Card key={index} className="border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-black mb-2">{room.name}</h3>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Fläche: {room.area}</span>
                        <span>{room.lightCount} Leuchten</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Project Info Sidebar */}
          <div className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Projekt-Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Abgeschlossen am</p>
                    <p className="font-medium">{new Date(project.date).toLocaleDateString('de-DE')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Standort</p>
                    <p className="font-medium">{project.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Kunde</p>
                    <p className="font-medium">{project.customer}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Elektriker</p>
                    <p className="font-medium">{project.electrician}</p>
                  </div>
                </div>

                <hr />
                
                <div>
                  <p className="text-sm text-gray-600">Gesamtwert</p>
                  <p className="text-xl md:text-2xl font-bold text-black">{formatPrice(project.totalValue)}</p>
                </div>
                
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {project.status}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Aktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full flex items-center gap-2 h-10 md:h-8">
                  <Download className="h-4 w-4" />
                  PDF Export
                </Button>
                <Button variant="outline" className="w-full flex items-center gap-2 h-10 md:h-8">
                  <Package className="h-4 w-4" />
                  Materialliste
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product List mit Nachbestell-Funktion */}
        <Card className="mb-6 md:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Package className="h-5 w-5" />
              Verwendete Produkte ({project.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.items.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  {/* Produkt Info */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                        <h4 className="font-semibold text-black">{item.name}</h4>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full w-fit">
                          {item.room}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                      <p className="text-xs text-gray-500">#{item.itemNumber}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 md:gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-gray-600">Projektmenge</p>
                        <p className="font-semibold">{item.quantity}x</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-gray-600">Einzelpreis</p>
                        <p className="font-semibold">{formatPrice(item.unitPrice)}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-gray-600">Gesamt</p>
                        <p className="font-semibold text-base">{formatPrice(item.totalPrice)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Nachbestell-Sektion */}
                  <div className="border-t pt-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">Nachbestellen:</span>
                          {item.inStock ? (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                              {item.availableQuantity} verfügbar
                            </span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                              Nicht verfügbar
                            </span>
                          )}
                        </div>
                        
                        {item.inStock && (
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleQuantityChange(item.itemNumber, (reorderQuantities[item.itemNumber] || 1) - 1)}
                              disabled={!reorderQuantities[item.itemNumber] || reorderQuantities[item.itemNumber] <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={reorderQuantities[item.itemNumber] || 1}
                              onChange={(e) => handleQuantityChange(item.itemNumber, parseInt(e.target.value) || 1)}
                              className="w-16 text-center h-8"
                              min="1"
                              max={item.availableQuantity}
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleQuantityChange(item.itemNumber, (reorderQuantities[item.itemNumber] || 1) + 1)}
                              disabled={reorderQuantities[item.itemNumber] >= item.availableQuantity}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/products/${item.itemNumber}`}>
                          <Button variant="outline" size="sm" className="h-10 md:h-8">
                            Details
                          </Button>
                        </Link>
                        <Button 
                          onClick={() => handleReorder(item)}
                          disabled={!item.inStock || isReordering[item.itemNumber]}
                          className="h-10 md:h-8 bg-black hover:bg-gray-800 disabled:opacity-50"
                          size="sm"
                        >
                          {isReordering[item.itemNumber] ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                          ) : (
                            <ShoppingCart className="h-3 w-3 mr-2" />
                          )}
                          {isReordering[item.itemNumber] ? 'Bestellt...' : 'Nachbestellen'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <hr className="my-6" />
            
            <div className="flex justify-between items-center">
              <span className="text-base md:text-lg font-semibold">Ursprüngliche Gesamtsumme:</span>
              <span className="text-xl md:text-2xl font-bold text-black">{formatPrice(project.totalValue)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Project Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Projektnotizen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
              {project.notes}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 