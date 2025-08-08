import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Tag,
  MapPin,
  Clock,
  Users
} from 'lucide-react';
import Header from '@/components/header';

export default function Home() {

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-36 pb-4 md:pb-8">
        
        {/* Debug Box */}
        <div className="mb-8 p-4 bg-yellow-100 border-2 border-yellow-500 rounded-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">DEBUG BOX - ÄNDERUNG AKTIV!</h2>
          <p className="text-black">Diese Box zeigt, dass Änderungen funktionieren!</p>
          <p className="text-sm text-gray-700">Zeitstempel: {new Date().toLocaleString()}</p>
        </div>

        {/* New Catalog - Full Width */}
        <div className="mb-8 md:mb-12">
                      <Card className="border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-0">
              <div className="grid grid-cols-2 gap-3 md:gap-4 items-center min-h-28">
                                 <div className="p-4 md:p-6">
                   <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium mb-3">
                     <Tag className="h-4 w-4" />
                     New Release
                   </div>
                   
                   <h2 className="text-lg md:text-xl font-bold text-black mb-2">
                     VYSN Catalog 2025
                   </h2>
                   <p className="text-sm text-gray-600 mb-4">
                     Complete product overview
                   </p>
                   
                   <Button className="bg-black hover:bg-gray-800 text-white text-sm h-11 md:h-9 px-4 md:px-4">
                     Download
                   </Button>
                 </div>
                 
                 <div className="flex justify-center p-3 md:p-4">
                   <div className="w-32 h-40 md:w-48 md:h-60 bg-white rounded-lg border border-gray-200 overflow-hidden relative shadow-md">
                     <Image 
                       src="/VYSN_KAT.png"
                       alt="VYSN Catalog 2025"
                       fill
                       className="object-cover"
                       sizes="(max-width: 768px) 128px, 192px"
                     />
                   </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Product - Full Width */}
        <div className="mb-8 md:mb-12">
          <Link href="/products/V109001B2B">
                         <Card className="border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                               <CardContent className="p-0">
                 <div className="grid grid-cols-2 gap-3 md:gap-4 items-center min-h-28">
                   <div className="p-4 md:p-6">
                     <div className="inline-flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full text-sm font-medium mb-3">
                       <Tag className="h-4 w-4" />
                       New in Range
                     </div>
                     
                     <h2 className="text-lg md:text-xl font-bold text-black mb-2">
                       Nydle T - Touch Dimmable LED
                     </h2>
                     <p className="text-sm text-gray-600 mb-4">
                       Touch-dimming, 5.4W, 2700K
                     </p>
                     
                     <Button className="bg-black hover:bg-gray-800 text-white text-sm h-11 md:h-9 px-4 md:px-4">
                       View Details
                     </Button>
                   </div>
                   
                   <div className="flex justify-center p-3 md:p-4">
                     <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-lg border border-gray-200 overflow-hidden relative">
                       <Image 
                         src="https://vysninstructionmanuals.web.app/products/V109001B2B_1.jpg"
                         alt="Nydle T"
                         fill
                         className="object-contain p-2"
                         sizes="(max-width: 768px) 128px, 192px"
                       />
                     </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          </Link>
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
                    Lighting Professional Meetup Berlin
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 mb-4">
                    Meet other lighting professionals and electrical engineers for a relaxed exchange 
                    about current projects, new technologies and industry trends.
                  </p>
                  
                  <div className="space-y-2 mb-4 text-sm md:text-base">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-4 w-4" />
                      <span>Thursday, January 30, 2025</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="h-4 w-4" />
                      <span>6:00 PM - 9:00 PM</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="h-4 w-4" />
                      <span>Café Lichtblick, Unter den Linden 15, Berlin</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="h-4 w-4" />
                      <span>12 spots still available</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button className="flex-1 bg-black hover:bg-gray-800">Register for Free</Button>
                    <Button variant="outline" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">More Info</Button>
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


      </main>
    </div>
  );
}
