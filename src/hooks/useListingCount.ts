// hooks/useListingCount.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

export const useListingCount = () => {
  const { user } = useAuth();
  const [listingCount, setListingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListingCount = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const baseURL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem('access_token');
        
        const response = await axios.get(
          `${baseURL}/seller_listing/my-listing?page=1&size=1`, 
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setListingCount(response.data.total_items || 0);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching listing count:', err);
        setError('Failed to fetch listing count');
        setListingCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListingCount();
  }, [user]);

  const hasReachedLimit = listingCount >= 5;

  return {
    listingCount,
    hasReachedLimit,
    isLoading,
    error
  };
};