import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { authService } from "@/services/api/auth-service";
import api from "@/lib/api-client";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import MedicineEdit from "./pages/MedicineEdit";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Prescriptions from "./pages/Prescriptions";
import PrescriptionUpload from "./pages/PrescriptionUpload";
import Caregiver from "./pages/Caregiver";
import NotFound from "./pages/NotFound";
import Orders from "./pages/Orders";
import Integrations from "./pages/Integrations";
import OrdersStore from "./pages/OrdersStore";
import VideoConsultation from "./pages/VideoConsultation";
import PrescriptionVoice from "./pages/PrescriptionVoice";
import ChronicDiseases from "./pages/ChronicDiseases";

const queryClient = new QueryClient();

// Loading component for auth check
const AuthLoading = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route wrapper (only redirects from login/signup if already logged in)
const PublicRoute = ({ children, isLanding = false }: { children: React.ReactNode; isLanding?: boolean }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  
  // Allow landing page to be viewed even when authenticated
  if (isLanding) {
    return <>{children}</>;
  }
  
  // Redirect to dashboard if trying to access login/signup while authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const elderlyMode = useStore((state) => state.elderlyMode);
  const login = useStore((state) => state.login);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Check for existing JWT token on app load and restore session if valid
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getAuthToken();
      
      // Always attempt to restore valid sessions
      if (token) {
        try {
          // Verify token is still valid by fetching current user
          const response = await authService.getCurrentUser();
          // Cast to User type since normalizeUser ensures all required fields
          login(response.user as any);
        } catch (error) {
          // Token is invalid or expired, clear it
          console.error('Session expired or invalid:', error);
          api.clearAuthToken();
        }
      }
      
      setAuthChecked(true);
    };
    
    checkAuth();
  }, [login]);
  
  // Show loading screen while checking authentication
  if (!authChecked) {
    return <AuthLoading />;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className={`dark ${elderlyMode ? 'elderly-mode' : ''}`}>
          <Toaster />
          <Sonner position="top-center" />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<PublicRoute isLanding={true}><Landing /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/medicines" element={<ProtectedRoute><Medicines /></ProtectedRoute>} />
              <Route path="/medicines/new" element={<ProtectedRoute><MedicineEdit /></ProtectedRoute>} />
              <Route path="/medicines/:id/edit" element={<ProtectedRoute><MedicineEdit /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/prescriptions" element={<ProtectedRoute><Prescriptions /></ProtectedRoute>} />
              <Route path="/prescriptions/upload" element={<ProtectedRoute><PrescriptionUpload /></ProtectedRoute>} />
              <Route path="/caregiver" element={<ProtectedRoute><Caregiver /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/orders-store" element={<ProtectedRoute><OrdersStore /></ProtectedRoute>} />
              <Route path="/video-consultation" element={<ProtectedRoute><VideoConsultation /></ProtectedRoute>} />
              <Route path="/prescription-voice" element={<ProtectedRoute><PrescriptionVoice /></ProtectedRoute>} />
              <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
              <Route path="/chronic-diseases" element={<ProtectedRoute><ChronicDiseases /></ProtectedRoute>} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
