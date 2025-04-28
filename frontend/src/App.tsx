
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import VerifyRestaurantRegistration from "./components/verifyRestaurantRegistration";
import ManageUsers from "./components/manageUsers";
import AdminDashboard from "./pages/adminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/delivery_personnel-dashboard" element={<div>Delivery Dashboard</div>} />
            <Route path="/restaurant_admin-dashboard" element={<div>Restaurant Dashboard</div>} />
            <Route path="/admin-dashboard" element={<AdminDashboard/>} />
            <Route path="/admin/restaurants" element={<VerifyRestaurantRegistration />} />
            <Route path="/admin/profiles" element={<ManageUsers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
