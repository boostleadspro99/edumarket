'use client';

import { usePointPacks } from '@/lib/hooks';
import PointPackCard from '@/components/PointPackCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, CreditCard, Shield, Zap } from 'lucide-react';

export default function PointPacksPage() {
  const pointPacks = usePointPacks();

  const benefits = [
    {
      icon: <Coins className="w-8 h-8 text-yellow-500" />,
      title: 'One Currency, Endless Learning',
      description: 'Use points across all educational content without multiple subscriptions.'
    },
    {
      icon: <Shield className="w-8 h-8 text-green-500" />,
      title: 'Secure Payments',
      description: 'Your transactions are protected with bank-level security via Stripe.'
    },
    {
      icon: <Zap className="w-8 h-8 text-blue-500" />,
      title: 'Instant Access',
      description: 'Points are added to your account immediately after purchase.'
    },
    {
      icon: <CreditCard className="w-8 h-8 text-purple-500" />,
      title: 'Flexible Pricing',
      description: 'Choose the pack that fits your learning goals and budget.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Point Packs
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Purchase points to access premium educational content. 
              The more you buy, the more you save!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Point Packs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pointPacks.map((pack, index) => (
            <PointPackCard 
              key={pack.id} 
              pointPack={pack}
              isPopular={index === 1} // Make the second pack popular
            />
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Why Choose Our Point System?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do points work?
              </h3>
              <p className="text-gray-600 mb-4">
                Points are our virtual currency. Purchase them in packs and use them to buy educational PDFs from our marketplace.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do points expire?
              </h3>
              <p className="text-gray-600">
                No, your points never expire! Use them whenever you're ready to learn something new.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I get a refund?
              </h3>
              <p className="text-gray-600 mb-4">
                Point pack purchases are final, but you can always contact our support team if you have any issues.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and popular payment methods through Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}