import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Package, Copy, ArrowRight } from 'lucide-react';
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-36 pb-6 md:pb-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-4">My Projects</h1>
          <p className="text-gray-600">
            View and manage your recent lighting installations.
          </p>
        </div>

        <div className="space-y-6">
          {dummyProjects.map((project) => (
            <Card key={project.id} className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-black mb-3">{project.name}</CardTitle>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="mr-2 h-5 w-5" />
                      <span className="text-base">
                        {new Date(project.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Package className="mr-2 h-5 w-5" />
                      <span className="text-base">{project.totalItems} items</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {project.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 text-base font-medium flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Project
                  </Button>
                  <Link href={`/projects/${project.id}`} className="flex-1">
                    <Button className="w-full h-12 text-base font-medium flex items-center justify-center gap-2 bg-black hover:bg-gray-800">
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
            <h3 className="text-xl font-medium text-black mb-2">No Projects Yet</h3>
            <p className="text-gray-600 mb-4">
              Start your first lighting project by browsing our product catalog.
            </p>
            <Link href="/products">
              <Button className="h-12 text-base font-medium bg-black hover:bg-gray-800">Browse Products</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}