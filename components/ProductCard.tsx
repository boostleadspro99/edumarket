'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { usePurchaseProduct } from '@/lib/hooks';
import { Coins, User, Download, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price_points: number;
    seller: { name: string };
    file_url?: string | null;
  };
  showPurchaseButton?: boolean;
  showDownloadButton?: boolean;
}

export default function ProductCard({ 
  product, 
  showPurchaseButton = true, 
  showDownloadButton = false 
}: ProductCardProps) {
  const { user } = useAuth();
  const { purchaseProduct, loading } = usePurchaseProduct();
  const { toast } = useToast();

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: 'Authentification requise',
        description: 'Veuillez vous connecter pour acheter des produits.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await purchaseProduct(product as any);
      
      toast({
        title: 'Achat réussi !',
        description: `Vous avez acheté "${product.title}" pour ${product.price_points} points.`,
      });
    } catch (error: any) {
      toast({
        title: 'Échec de l\'achat',
        description: error.message || 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async () => {
    if (!product.file_url) {
      toast({
        title: 'Fichier non disponible',
        description: 'Le fichier n\'est pas encore disponible au téléchargement.',
        variant: 'destructive',
      });
      return;
    }

    // TODO: Implémenter le téléchargement sécurisé avec URL signée
    toast({
      title: 'Téléchargement démarré',
      description: `Téléchargement de "${product.title}"...`,
    });
  };

  const canAfford = user && user.balance_points >= product.price_points;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {product.title}
          </CardTitle>
          <Badge variant="secondary" className="ml-2 flex items-center">
            <Coins className="w-3 h-3 mr-1" />
            {product.price_points}
          </Badge>
        </div>
        <CardDescription className="line-clamp-3">
          {product.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="flex items-center text-sm text-gray-600">
          <User className="w-4 h-4 mr-2" />
          <span>par {product.seller.name}</span>
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
            Télécharger PDF
          </Button>
        )}
        
        {showPurchaseButton && (
          <Button 
            onClick={handlePurchase}
            disabled={loading || !user || !canAfford}
            className="w-full"
          >
            {loading ? (
              'Traitement...'
            ) : !user ? (
              'Connexion requise'
            ) : !canAfford ? (
              `Insuffisant (${product.price_points} points requis)`
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Acheter ({product.price_points} points)
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}