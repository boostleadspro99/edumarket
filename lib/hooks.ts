import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './auth';

// Debounce hook for search optimization
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

// Mock data fetching hook (replace with actual API calls)
export function useProducts(search: string = '') {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockProducts = [
        {
          id: '1',
          title: 'Advanced React Patterns',
          description: 'Learn advanced React patterns and best practices',
          pricePoints: 50,
          seller: { name: 'John Expert' },
          fileUrl: '/pdfs/react-patterns.pdf'
        },
        {
          id: '2',
          title: 'TypeScript Masterclass',
          description: 'Complete guide to TypeScript development',
          pricePoints: 75,
          seller: { name: 'Jane Developer' },
          fileUrl: '/pdfs/typescript-masterclass.pdf'
        },
        {
          id: '3',
          title: 'Next.js Complete Guide',
          description: 'Build full-stack applications with Next.js',
          pricePoints: 100,
          seller: { name: 'Mike Coder' },
          fileUrl: '/pdfs/nextjs-guide.pdf'
        }
      ].filter(product => 
        product.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.description.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      
      setProducts(mockProducts);
      setLoading(false);
    };

    fetchProducts();
  }, [debouncedSearch]);

  return { products, loading };
}

// Point packs hook
export function usePointPacks() {
  const [pointPacks] = useState([
    { id: '1', name: 'Starter Pack', priceEuro: 10, points: 100 },
    { id: '2', name: 'Popular Pack', priceEuro: 25, points: 275 },
    { id: '3', name: 'Pro Pack', priceEuro: 50, points: 600 },
    { id: '4', name: 'Ultimate Pack', priceEuro: 100, points: 1300 }
  ]);

  return pointPacks;
}

// Purchases hook
export function usePurchases() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchPurchases = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockPurchases = [
        {
          id: '1',
          product: {
            id: '1',
            title: 'Advanced React Patterns',
            fileUrl: '/pdfs/react-patterns.pdf',
            seller: { name: 'John Expert' }
          },
          createdAt: new Date('2024-01-15'),
          points: 50
        },
        {
          id: '2',
          product: {
            id: '2',
            title: 'TypeScript Masterclass',
            fileUrl: '/pdfs/typescript-masterclass.pdf',
            seller: { name: 'Jane Developer' }
          },
          createdAt: new Date('2024-01-10'),
          points: 75
        }
      ];
      
      setPurchases(mockPurchases);
      setLoading(false);
    };

    fetchPurchases();
  }, [user]);

  return { purchases, loading };
}