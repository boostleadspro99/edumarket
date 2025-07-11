'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { Coins, CreditCard, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PointPack } from '@/lib/supabase';

interface PointPackCardProps {
  pointPack: PointPack;
  isPopular?: boolean;
}

export default function PointPackCard({ pointPack, isPopular = false }: PointPackCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: 'Authentification requise',
        description: 'Veuillez vous connecter pour acheter des packs de points.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Intégrer Stripe Checkout dans la prochaine étape
      // Pour l'instant, simulation de l'achat
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Fonctionnalité à venir',
        description: 'L\'intégration Stripe sera disponible dans la prochaine mise à jour.',
      });
    } catch (error) {
      toast({
        title: 'Erreur de paiement',
        description: 'Une erreur est survenue lors du paiement. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const priceEuro = pointPack.price_euro / 100; // Convertir centimes en euros
  const valuePerPoint = (priceEuro / pointPack.points).toFixed(3);

  return (
    <Card className={`h-full flex flex-col hover:shadow-lg transition-all duration-200 ${
      isPopular ? 'border-blue-500 shadow-lg scale-105' : ''
    }`}>
      <CardHeader className="text-center">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">
            {pointPack.name}
          </CardTitle>
          {isPopular && (
            <Badge className="bg-blue-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              Populaire
            </Badge>
          )}
        </div>
        <CardDescription>
          Meilleur rapport qualité-prix
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Coins className="w-8 h-8 text-yellow-500" />
            <span className="text-3xl font-bold text-gray-900">
              {pointPack.points}
            </span>
            <span className="text-lg text-gray-600">points</span>
          </div>
          
          <div className="text-2xl font-semibold text-gray-900">
            {priceEuro}€
          </div>
          
          <div className="text-sm text-gray-500">
            {valuePerPoint}€ par point
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          onClick={handlePurchase}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            'Traitement du paiement...'
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Acheter maintenant
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}