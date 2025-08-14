'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar, Package, Copy, ExternalLink, Download, FileText, FileSpreadsheet, Mail, ShoppingCart } from 'lucide-react';
import Header from '@/components/header';
import React, { useState } from 'react';

// Project data with real VYSN products
const getProjectById = (id: string) => {
  const projects = [
    {
      id: 1,
      name: 'Office Renovation - Building A',
      date: '2024-12-15',
      products: [
        { itemNumber: 'V104100T2W', quantity: 12 }, // Tevo 360 Downlight
        { itemNumber: 'V114022T3W', quantity: 8 },  // 1 Phase Track Spots Pro L
        { itemNumber: 'V109001B2B', quantity: 4 }   // Nydle T
      ],
      totalItems: 24,
      status: 'Completed',
      description: 'Complete LED lighting upgrade for the main office building including energy-efficient panels and safety lighting.'
    },
    {
      id: 2,
      name: 'Retail Store Lighting',
      date: '2024-11-28',
      products: [
        { itemNumber: 'V103300T2W', quantity: 10 }, // Tevo 1 LED
        { itemNumber: 'V126001T7N', quantity: 6 },  // N-tri Modul
        { itemNumber: 'V104110N0W', quantity: 15 }  // N-tri round
      ],
      totalItems: 31,
      status: 'Completed',
      description: 'Modern retail lighting solution with adjustable downlights and decorative pendant fixtures.'
    },
    {
      id: 3,
      name: 'Warehouse Installation',
      date: '2024-10-20',
      products: [
        { itemNumber: 'V114022T3W', quantity: 20 }, // 1 Phase Track Spots Pro L
        { itemNumber: 'V126001T7N', quantity: 10 }, // N-tri Modul
        { itemNumber: 'V104100T2W', quantity: 8 }   // Tevo 360 Downlight
      ],
      totalItems: 38,
      status: 'Completed',
      description: 'High-efficiency warehouse lighting with motion sensors for energy savings.'
    },
    {
      id: 4,
      name: 'Restaurant Ambience',
      date: '2024-09-14',
      products: [
        { itemNumber: 'V109001B2B', quantity: 8 },  // Nydle T
        { itemNumber: 'V103300T2W', quantity: 6 },  // Tevo 1 LED
        { itemNumber: 'V104110N0W', quantity: 12 }  // N-tri round
      ],
      totalItems: 26,
      status: 'Completed',
      description: 'Atmospheric restaurant lighting with dimmable and color-tunable options for different dining experiences.'
    }
  ];
  
  return projects.find(p => p.id === parseInt(id));
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [email, setEmail] = useState('');
  const [isExporting, setIsExporting] = useState<{[key: string]: boolean}>({});
  const [isOrdering, setIsOrdering] = useState(false);
  const [isSendingQuote, setIsSendingQuote] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  
  // Resolve params asynchronously
  React.useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);
  
  const project = resolvedParams ? getProjectById(resolvedParams.id) : null;
  

  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-36 pb-6 md:pb-8">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading project...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-36 pb-6 md:pb-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-black mb-4">Project Not Found</h1>
            <p className="text-gray-600 mb-6">The project you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/projects">
              <Button className="bg-black hover:bg-gray-800">Back to Projects</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Calculate totals from loaded projectProducts

  // Calculate total items based on current quantities
  const totalItems = project?.products.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  // For now, set totalValue to 0 (will need product data loading)
  const totalValue = 0;


  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    setIsExporting(prev => ({ ...prev, [format]: true }));
    
    // Simulate export/download process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create dummy file content with real product data
    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'csv') {
      content = [
        'Item Number,Product Name,Quantity,Unit Price (€),Total Price (€)',
        ...(project?.products || []).map(item => 
          `${item.itemNumber},"Unknown Product",${item.quantity},0.00,0.00`
        ),
        `,,,,${totalValue.toFixed(2)}`
      ].join('\n');
      filename = `${project?.name?.replace(/\s+/g, '_') || 'project'}_products.csv`;
      mimeType = 'text/csv';
    } else if (format === 'excel') {
      // In real app, this would generate actual Excel
      content = 'Excel file content would be here...';
      filename = `${project.name.replace(/\s+/g, '_')}_products.xlsx`;
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else {
      // PDF
      content = 'PDF content would be here...';
      filename = `${project.name.replace(/\s+/g, '_')}_products.pdf`;
      mimeType = 'application/pdf';
    }

    // Create and trigger download
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    setIsExporting(prev => ({ ...prev, [format]: false }));
  };

  const handleSendQuote = async () => {
    if (!email.trim()) {
      alert('Please enter an email address for the quote.');
      return;
    }

    setIsSendingQuote(true);
    
    // Simulate sending quote
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert(`Quote sent to ${email}! 📧`);
    
    setIsSendingQuote(false);
  };

  const handleOrder = async () => {
    setIsOrdering(true);
    
    // Simulate order process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    alert(`Order placed successfully! Total: €${totalValue.toFixed(2)} 🛒`);
    
    setIsOrdering(false);
  };

  const handleCopyProject = () => {
    alert('Project copied to clipboard! 📋');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-36 pb-6 md:pb-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/projects">
            <Button variant="outline" className="flex items-center gap-2 border-gray-300 hover:bg-gray-50">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </div>

        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-black">{project.name}</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {project.status}
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span className="text-base">
                {new Date(project.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <span className="text-base">{totalItems} items total</span>
            </div>
          </div>
        </div>

        {/* Export & Actions Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Downloads */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-black mb-4">Download Options</h3>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Button
                variant="outline"
                onClick={() => handleExport('excel')}
                disabled={isExporting.excel}
                className="flex flex-col items-center gap-2 h-16 border-gray-300 hover:bg-gray-100"
              >
                {isExporting.excel ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-5 w-5" />
                )}
                <span className="text-xs">Excel</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExport('pdf')}
                disabled={isExporting.pdf}
                className="flex flex-col items-center gap-2 h-16 border-gray-300 hover:bg-gray-100"
              >
                {isExporting.pdf ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
                <span className="text-xs">PDF</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                disabled={isExporting.csv}
                className="flex flex-col items-center gap-2 h-16 border-gray-300 hover:bg-gray-100"
              >
                {isExporting.csv ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                <span className="text-xs">CSV</span>
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              Files will be downloaded directly to your device
            </div>
          </div>

          {/* Send Quote */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-black mb-4">Send Quote</h3>
            
            {/* Email Input for Quote */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address for Quote
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@company.com"
                className="mb-3"
              />
            </div>

            <Button
              onClick={handleSendQuote}
              disabled={isSendingQuote || !email.trim()}
              className="w-full flex items-center gap-2 bg-black hover:bg-gray-800 text-white"
            >
              {isSendingQuote ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Send Quote
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <Button 
            variant="outline" 
            onClick={handleCopyProject}
            className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
          >
            <Copy className="h-4 w-4" />
            Copy Project
          </Button>
        </div>

        {/* Products Used */}
        <div>
          <h2 className="text-xl font-bold text-black mb-6">Products Used</h2>
          <div className="space-y-4">
            {(project?.products || []).map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-black text-base mb-1">Item {item.itemNumber}</h3>
                    <p className="text-gray-600 text-sm">Product details</p>
                    <p className="text-gray-500 text-sm">Item #{item.itemNumber}</p>
                  </div>
                  <div className="text-right ml-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Menge: {item.quantity}</span>
                    </div>
                    <div className="text-sm text-gray-600">€0.00 each</div>
                    <div className="text-base font-bold text-black">€0.00</div>
                    <Link href={`/products/${item.itemNumber}`}>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black p-1 h-auto mt-1">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Total Summary */}
            <div className="border-t-2 border-gray-300 pt-4 mt-6">
              <div className="flex justify-between items-center text-lg font-bold mb-4">
                <span>Project Total:</span>
                <span>€{totalValue.toFixed(2)}</span>
              </div>
              
              {/* Order Now Button */}
              <Button
                onClick={handleOrder}
                disabled={isOrdering}
                className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white h-12 text-base font-medium"
              >
                {isOrdering ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
                Order Now
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 