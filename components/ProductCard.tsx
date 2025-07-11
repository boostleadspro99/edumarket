'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { Coins, User, Download, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    pricePoints: number;
    seller: { name: string };
    fileUrl?: string;
  };
  showPurchaseButton?: boolean;
  showDownloadButton?: boolean;
}

export default function ProductCard({ 
  product, 
  showPurchaseButton = true, 
  showDownloadButton = false 
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to purchase products.',
        variant: 'destructive',
      });
      return;
    }

    if (user.balancePoints < product.pricePoints) {
      toast({
        title: 'Insufficient Points',
        description: 'You need more points to purchase this product.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate purchase API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user balance
      updateBalance(-product.pricePoints);
      
      toast({
        title: 'Purchase Successful!',
        description: `You've purchased "${product.title}" for ${product.pricePoints} points.`,
      });
    } catch (error) {
      toast({
        title: 'Purchase Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    // In a real app, this would be a secure download link
    toast({
      title: 'Download Started',
      description: `Downloading "${product.title}"...`,
    });
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {product.title}
          </CardTitle>
          <Badge variant="secondary" className="ml-2 flex items-center">
            <Coins className="w-3 h-3 mr-1" />
            {product.pricePoints}
          </Badge>
        </div>
        <CardDescription className="line-clamp-3">
          {product.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="flex items-center text-sm text-gray-600">
          <User className="w-4 h-4 mr-2" />
          <span>by {product.seller.name}</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        {showDownloadButton && (
          <Button 
            onClick={handleDownload}
            className="w-full"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        )}
        
        {showPurchaseButton && (
          <Button 
            onClick={handlePurchase}
            disabled={isLoading || !user || user.balancePoints < product.pricePoints}
            className="w-full"
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Purchase ({product.pricePoints} points)
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}