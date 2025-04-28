import { useState, useEffect } from 'react';
import axios from 'axios';
import { Restaurant } from '@/types/restaurant';
import { useAuth } from '@/context/AuthContext';

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get(`http://localhost:3002/api/restaurants/admin/${user?.id}`);
        setRestaurants(response.data.data);
      } catch (err) {
        setError('Failed to fetch restaurants');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchRestaurants();
    }
  }, [user]);

  return { restaurants, isLoading, error };
}