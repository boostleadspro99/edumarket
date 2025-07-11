import { useState, useEffect, useCallback } from 'react';
import { supabase, type Product, type PointPack, type Purchase } from './supabase';
import { useAuth } from './auth';

// Debounce hook pour optimiser les recherches
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook pour récupérer les produits avec recherche
export function useProducts(search: string = '') {
  const [products, setProducts] = useState<(Product & { seller: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            profiles!products_seller_id_fkey (
              name
            )
          `)
          .eq('is_active', true);

        if (debouncedSearch) {
          query = query.or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        const formattedProducts = data?.map(product => ({
          ...product,
          seller: { name: (product.profiles as any)?.name || 'Vendeur inconnu' }
        })) || [];

        setProducts(formattedProducts);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedSearch]);

  return { products, loading };
}

// Hook pour récupérer les packs de points
export function usePointPacks() {
  const [pointPacks, setPointPacks] = useState<PointPack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPointPacks = async () => {
      try {
        const { data, error } = await supabase
          .from('point_packs')
          .select('*')
          .eq('is_active', true)
          .order('points', { ascending: true });

        if (error) throw error;

        setPointPacks(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des packs de points:', error);
        setPointPacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPointPacks();
  }, []);

  return { pointPacks, loading };
}

// Hook pour récupérer les achats de l'utilisateur
export function usePurchases() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<(Purchase & { 
    product: Product & { seller: { name: string } } 
  })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPurchases([]);
      setLoading(false);
      return;
    }

    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('purchases')
          .select(`
            *,
            products (
              *,
              profiles!products_seller_id_fkey (
                name
              )
            )
          `)
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedPurchases = data?.map(purchase => ({
          ...purchase,
          product: {
            ...purchase.products,
            seller: { name: (purchase.products?.profiles as any)?.name || 'Vendeur inconnu' }
          }
        })) || [];

        setPurchases(formattedPurchases as any);
      } catch (error) {
        console.error('Erreur lors du chargement des achats:', error);
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [user]);

  return { purchases, loading };
}

// Hook pour effectuer un achat
export function usePurchaseProduct() {
  const { user, updateBalance } = useAuth();
  const [loading, setLoading] = useState(false);

  const purchaseProduct = useCallback(async (product: Product) => {
    if (!user) throw new Error('Utilisateur non connecté');
    if (user.balance_points < product.price_points) {
      throw new Error('Solde de points insuffisant');
    }

    setLoading(true);
    try {
      // Vérifier si le produit n'a pas déjà été acheté
      const { data: existingPurchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existingPurchase) {
        throw new Error('Vous avez déjà acheté ce produit');
      }

      // Commencer une transaction
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          buyer_id: user.id,
          product_id: product.id,
          points_spent: product.price_points
        });

      if (purchaseError) throw purchaseError;

      // Déduire les points de l'acheteur
      await updateBalance(-product.price_points);

      // Calculer la commission (70% au vendeur, 30% à la plateforme)
      const sellerPoints = Math.floor(product.price_points * 0.7);
      const commission = product.price_points - sellerPoints;

      // Créditer le vendeur
      const { error: sellerUpdateError } = await supabase.rpc('increment_balance', {
        user_id: product.seller_id,
        points: sellerPoints
      });

      if (sellerUpdateError) throw sellerUpdateError;

      // Enregistrer les transactions
      const transactions = [
        {
          sender_id: user.id,
          receiver_id: null,
          product_id: product.id,
          points: product.price_points,
          type: 'PURCHASE' as const,
          description: `Achat de "${product.title}"`
        },
        {
          sender_id: null,
          receiver_id: product.seller_id,
          product_id: product.id,
          points: sellerPoints,
          commission: commission,
          type: 'SALE' as const,
          description: `Vente de "${product.title}"`
        }
      ];

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(transactions);

      if (transactionError) throw transactionError;

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'achat:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, updateBalance]);

  return { purchaseProduct, loading };
}