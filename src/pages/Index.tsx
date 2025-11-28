import { Navigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';

const Index = () => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/" replace />;
};

export default Index;
