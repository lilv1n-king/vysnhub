import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, CheckCircle, Package } from 'lucide-react';
import Header from '@/components/header';

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const projectId = resolvedParams.id;
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/projects" className="flex items-center text-gray-600 hover:text-black">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </div>

        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-black mb-4">
            Project #{projectId} Ready for Reorder
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            This is a demo checkout page. In a real implementation, this would show 
            the project details, product list, quantities, and pricing.
          </p>

          <Card className="max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-center">
                <Package className="h-5 w-5" />
                Demo Project Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-gray-600">
                <p>24 LED Panels 40W 4000K</p>
                <p>8 Emergency Exit Signs</p>
                <p>4 Motion Sensors</p>
                <hr className="my-4" />
                <p className="font-semibold text-black">
                  Total: €1,247.50 (excl. VAT)
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Proceed to Checkout
            </Button>
            <Link href="/contact">
              <Button variant="outline">
                Request Quote Instead
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            This is a demonstration page. Real checkout functionality 
            would integrate with your ordering system.
          </p>
        </div>
      </main>
    </div>
  );
}