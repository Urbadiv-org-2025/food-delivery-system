import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DeliveryDashboard from "@/pages/DeliveryDashboard"; 

const queryClient = new QueryClient();

const App = () => {
  const { logout } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="logout-container">
              <Button onClick={logout} className="logout-button">
                Logout
              </Button>
            </div>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/delivery_personnel-dashboard" element={<DeliveryDashboard />} />
              <Route path="/restaurant_admin-dashboard" element={<div>Restaurant Dashboard</div>} />
              <Route path="/admin-dashboard" element={<div>Admin Dashboard</div>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
