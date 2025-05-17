import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export const useRestaurantAvailability = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateAvailability = async (
    restaurantId: string,
    available: boolean
  ) => {
    setIsUpdating(true);
    try {
      // Update the API endpoint to match your backend service
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/restaurants/${restaurantId}/availability`,
        { available },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Restaurant availability updated successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        "Failed to update restaurant availability";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateAvailability, isUpdating };
};
