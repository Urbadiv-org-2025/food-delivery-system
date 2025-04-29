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
        const token = localStorage.getItem('token');  // ✅ Get the token saved at login
        const response = await axios.get(
          `http://localhost:3002/api/restaurants/admin/${user?.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,          // ✅ Add the token here!
            },
          }
        );
        setRestaurants(response.data.data);
      } catch (err) {
        console.error('Fetch error:', err);
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
