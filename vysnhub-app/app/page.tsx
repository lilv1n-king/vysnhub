import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  FolderOpen, 
  Phone, 
  Calendar,
  QrCode,
  Tag,
  MapPin,
  Clock,
  Users
} from 'lucide-react';
import Header from '@/components/header';
import { formatPrice } from '@/lib/utils';

export default function Home() {
  // Featured product offer
  const featuredProduct = {
    vysnName: "Tevo 360 Downlight",
    itemNumberVysn: "V104100T2W",
    shortDescription: "Tevo 360 Downlight, White, 2700K",
    grossPrice: 49.9,
    originalPrice: 59.9,
    discount: 17,
    product_picture_1: "https://vysninstructionmanuals.web.app/products/V104100T2W_1.jpg",
    wattage: 8,
    lumen: 800,
    cct: 2700
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-4">
            Professional Lighting Solutions
          </h1>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover VYSN&apos;s comprehensive catalog of high-quality LED lighting products 
            designed for electrical contractors and professionals.
          </p>
        </div>

        {/* Featured Offer */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-black flex items-center gap-2">
              <Tag className="h-5 w-5 md:h-6 md:w-6" />
              Special Offer
            </h2>
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              -{featuredProduct.discount}%
            </div>
          </div>
          
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
            <CardContent className="p-4 md:p-6">
              <div className="grid md:grid-cols-3 gap-4 md:gap-6 items-center">
                <div className="order-2 md:order-1 md:col-span-2">
                  <h3 className="text-lg md:text-xl font-bold text-black mb-2">
                    {featuredProduct.vysnName}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 mb-3">
                    {featuredProduct.shortDescription}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4 text-xs md:text-sm">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{featuredProduct.wattage}W</div>
                      <div className="text-gray-600">Power</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{featuredProduct.lumen} lm</div>
                      <div className="text-gray-600">Lumen</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{featuredProduct.cct}K</div>
                      <div className="text-gray-600">CCT</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl md:text-2xl font-bold text-red-600">
                        {formatPrice(featuredProduct.grossPrice)}
                      </span>
                      <span className="text-sm md:text-base text-gray-500 line-through">
                        {formatPrice(featuredProduct.originalPrice)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link href={`/products/${featuredProduct.itemNumberVysn}`} className="flex-1">
                      <Button className="w-full">View Details</Button>
                    </Link>
                    <Button variant="outline" className="flex-1">Add to Project</Button>
                  </div>
                </div>
                
                <div className="order-1 md:order-2">
                  <div className="aspect-square bg-white rounded-lg overflow-hidden relative border border-gray-200 max-w-xs mx-auto">
                    <Image 
                      src={featuredProduct.product_picture_1} 
                      alt={featuredProduct.vysnName}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Section */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-black mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 md:h-6 md:w-6" />
            Upcoming Events
          </h2>
          
          <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
            <CardContent className="p-4 md:p-6">
              <div className="grid md:grid-cols-2 gap-4 md:gap-6 items-center">
                <div className="order-2 md:order-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-black text-white px-3 py-1 rounded-full text-xs font-medium">
                      Networking Event
                    </div>
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-bold text-black mb-2">
                    Lichtplaner-Stammtisch Berlin
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 mb-4">
                    Treffen Sie andere Lichtplaner und Elektrotechniker zu einem entspannten Austausch 
                    über aktuelle Projekte, neue Technologien und Branchentrends.
                  </p>
                  
                  <div className="space-y-2 mb-4 text-sm md:text-base">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-4 w-4" />
                      <span>Donnerstag, 30. Januar 2025</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="h-4 w-4" />
                      <span>18:00 - 21:00 Uhr</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="h-4 w-4" />
                      <span>Café Lichtblick, Unter den Linden 15, Berlin</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="h-4 w-4" />
                      <span>Noch 12 Plätze verfügbar</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button className="flex-1 bg-black hover:bg-gray-800">Kostenlos Anmelden</Button>
                    <Button variant="outline" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">Mehr Infos</Button>
                  </div>
                </div>
                
                <div className="order-1 md:order-2">
                  <div className="aspect-video bg-white rounded-lg overflow-hidden relative border border-gray-200">
                    <Image 
                      src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop" 
                      alt="Business networking event"
                      fill
                      className="object-cover grayscale"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Link href="/products">
            <Card className="border-gray-200 hover:shadow-lg hover:bg-gray-50 transition-all cursor-pointer">
              <CardContent className="flex flex-col items-center p-4 md:p-6">
                <Search className="h-6 w-6 md:h-8 md:w-8 text-black mb-2 md:mb-3" />
                <h3 className="font-semibold text-black mb-1 md:mb-2 text-sm md:text-base text-center">Product Search</h3>
                <p className="text-xs md:text-sm text-gray-600 text-center hidden md:block">
                  Find the perfect lighting solution from our extensive catalog
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/scanner">
            <Card className="border-gray-200 hover:shadow-lg hover:bg-gray-50 transition-all cursor-pointer">
              <CardContent className="flex flex-col items-center p-4 md:p-6">
                <QrCode className="h-6 w-6 md:h-8 md:w-8 text-black mb-2 md:mb-3" />
                <h3 className="font-semibold text-black mb-1 md:mb-2 text-sm md:text-base text-center">QR Scanner</h3>
                <p className="text-xs md:text-sm text-gray-600 text-center hidden md:block">
                  Scan QR codes with your camera
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/projects">
            <Card className="border-gray-200 hover:shadow-lg hover:bg-gray-50 transition-all cursor-pointer">
              <CardContent className="flex flex-col items-center p-4 md:p-6">
                <FolderOpen className="h-6 w-6 md:h-8 md:w-8 text-black mb-2 md:mb-3" />
                <h3 className="font-semibold text-black mb-1 md:mb-2 text-sm md:text-base text-center">My Projects</h3>
                <p className="text-xs md:text-sm text-gray-600 text-center hidden md:block">
                  View and manage your lighting project history
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/contact">
            <Card className="border-gray-200 hover:shadow-lg hover:bg-gray-50 transition-all cursor-pointer">
              <CardContent className="flex flex-col items-center p-4 md:p-6">
                <Phone className="h-6 w-6 md:h-8 md:w-8 text-black mb-2 md:mb-3" />
                <h3 className="font-semibold text-black mb-1 md:mb-2 text-sm md:text-base text-center">Contact Support</h3>
                <p className="text-xs md:text-sm text-gray-600 text-center hidden md:block">
                  Get expert advice and technical support
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
