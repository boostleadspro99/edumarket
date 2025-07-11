'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { usePurchases } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from '@/components/ProductCard';
import { Coins, Download, ShoppingBag, TrendingUp, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

export default function ClientDashboard() {
  const { user } = useAuth();
  const { purchases, loading } = usePurchases();

  const stats = [
    {
      title: 'Point Balance',
      value: user?.balancePoints || 0,
      icon: <Coins className="w-6 h-6 text-yellow-500" />,
      suffix: 'points'
    },
    {
      title: 'Purchased PDFs',
      value: purchases.length,
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      suffix: 'items'
    },
    {
      title: 'Total Spent',
      value: purchases.reduce((sum, p) => sum + p.points, 0),
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      suffix: 'points'
    },
    {
      title: 'This Month',
      value: purchases.filter(p => {
        const now = new Date();
        const purchaseDate = new Date(p.createdAt);
        return purchaseDate.getMonth() === now.getMonth() && 
               purchaseDate.getFullYear() === now.getFullYear();
      }).length,
      icon: <Calendar className="w-6 h-6 text-purple-500" />,
      suffix: 'purchases'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Continue your learning journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value} {stat.suffix}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Need More Points?
              </CardTitle>
              <CardDescription className="text-blue-100">
                Purchase point packs to continue learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/point-packs">
                <Button className="bg-white text-blue-600 hover:bg-gray-100">
                  Buy Point Packs
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Discover New Content
              </CardTitle>
              <CardDescription className="text-green-100">
                Browse thousands of educational PDFs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/browse">
                <Button className="bg-white text-green-600 hover:bg-gray-100">
                  Browse PDFs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Purchased Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Your Purchased Content
            </CardTitle>
            <CardDescription>
              Download and access your educational materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Purchases</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                {loading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Card key={index} className="animate-pulse">
                        <CardHeader>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : purchases.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {purchases.map((purchase) => (
                      <ProductCard
                        key={purchase.id}
                        product={purchase.product}
                        showPurchaseButton={false}
                        showDownloadButton={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No purchases yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start exploring our educational content to make your first purchase.
                    </p>
                    <Link href="/browse">
                      <Button>
                        Browse Products
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="recent" className="mt-6">
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Recent Purchases
                  </h3>
                  <p className="text-gray-600">
                    Your recent purchases will appear here.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="favorites" className="mt-6">
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Favorite Content
                  </h3>
                  <p className="text-gray-600">
                    Mark content as favorite to see it here.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}