import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Navigate } from "react-router-dom";
import Index from "./pages/Index";
import VerifyRestaurantRegistration from "./components/verifyRestaurantRegistration";
import ManageUsers from "./components/manageUsers";
import AdminDashboard from "./pages/adminDashboard";
import NotFound from "./pages/NotFound";
import RestaurantDashboard from "./components/RestaurantDashboard";
import RestaurantDetails from "./pages/RestaurantDetails";
import RestaurantEdit from './pages/EditRestaurant'; 
import CreateRestaurant from "./pages/CreateRestaurant";
import CreateMenuItem from "./pages/CreateMenuItem";
import MenuDetails from "./pages/MenuItemDetails";
import EditMenuItem from "./pages/EditMenuItem";
import LandingPage from "./pages/LandingPage";
import { ScrollToTop } from "./components/ScrollToTop";
import DeliveryDashboard from "@/pages/DeliveryDashboard"; 
import CustomerTrackingPage from "./pages/CustomerTrackingPage";
import ExploreRestaurants from "./pages/ExploreRestaurants";
import RestaurantDetailsClient from "./pages/RestaurantDetailsClient";
import RestaurantMenus from "./pages/RestaurantMenus";
import RestaurantOrders from "./pages/RestaurantOrders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<Index />} />
            <Route path="/login" element={<Navigate to="/app" replace />} />
            <Route path="/restaurants/explore" element={<ExploreRestaurants />} />
            {/* <Route path="/delivery_personnel-dashboard" element={<div>Delivery Dashboard</div>} /> */}
            <Route path="/restaurant_admin-dashboard" element={<RestaurantDashboard />} />
            <Route path="/restaurants/:id" element={<RestaurantDetailsClient />} />
            <Route path="/restaurant/:id" element={<RestaurantDetails />} />
            <Route path="/restaurants/:id/edit" element={<RestaurantEdit />} />
            <Route path="/restaurants/new" element={<CreateRestaurant />} />
            <Route path="/restaurants/:id/menu/new" element={<CreateMenuItem />} />
            <Route path="/restaurants/:restaurantId/menu/:id" element={<MenuDetails />} />
            <Route path="/restaurant/menus" element={<RestaurantMenus />} />
            <Route path="/restaurant/orders" element={<RestaurantOrders />} />
            <Route path="/restaurants/:restaurantId/menu/:id/edit" element={<EditMenuItem />} />
            <Route path="/delivery_personnel-dashboard" element={<DeliveryDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            {/* <Route path="/admin-dashboard" element={<div>Admin Dashboard</div>} /> */}
            <Route path="/delivery_personnel-dashboard" element={<DeliveryDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard/>} />
            <Route path="/admin/restaurants" element={<VerifyRestaurantRegistration />} />
            <Route path="/admin/profiles" element={<ManageUsers />} />
            <Route path="/customer-tracking/:deliveryId" element={<CustomerTrackingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
