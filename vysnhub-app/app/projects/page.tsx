import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Package, RefreshCw, ArrowRight } from 'lucide-react';
import Header from '@/components/header';

const dummyProjects = [
  {
    id: 1,
    name: 'Office Renovation - Building A',
    date: '2024-12-15',
    products: [
      'LED Panel 40W 4000K',
      'Track Light System',
      'Emergency Exit Signs'
    ],
    totalItems: 24,
    status: 'Completed'
  },
  {
    id: 2,
    name: 'Retail Store Lighting',
    date: '2024-11-28',
    products: [
      'LED Downlights 15W',
      'Linear LED Strips',
      'Pendant Lights'
    ],
    totalItems: 18,
    status: 'Completed'
  },
  {
    id: 3,
    name: 'Warehouse Installation',
    date: '2024-10-20',
    products: [
      'High Bay LED 150W',
      'Motion Sensors',
      'Industrial Fixtures'
    ],
    totalItems: 32,
    status: 'Completed'
  },
  {
    id: 4,
    name: 'Restaurant Ambience',
    date: '2024-09-14',
    products: [
      'Dimmable LED Spots',
      'Color Temperature Tunable',
      'Decorative Pendants'
    ],
    totalItems: 16,
    status: 'Completed'
  }
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">My Projects</h1>
          <p className="text-gray-600">
            View and manage your recent lighting installations and orders.
          </p>
        </div>

        <div className="grid gap-6">
          {dummyProjects.map((project) => (
            <Card key={project.id} className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-black mb-2">{project.name}</CardTitle>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      {new Date(project.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <Package className="mr-2 h-4 w-4" />
                      {project.totalItems} items
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {project.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-black mb-2">Products Used:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.products.map((product, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Link href={`/checkout/${project.id}`}>
                    <Button className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Reorder Project
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="outline" className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {dummyProjects.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-black mb-2">No Projects Yet</h3>
            <p className="text-gray-600 mb-4">
              Start your first lighting project by browsing our product catalog.
            </p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}