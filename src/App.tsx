import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "@/store/useStore";

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

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const elderlyMode = useStore((state) => state.elderlyMode);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className={`dark ${elderlyMode ? 'elderly-mode' : ''}`}>
          <Toaster />
          <Sonner position="top-center" />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
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
