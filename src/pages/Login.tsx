import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ButtonEnhanced } from '@/components/ui/button-enhanced';
import { InputEnhanced } from '@/components/ui/input-enhanced';
import { CardEnhanced } from '@/components/ui/card-enhanced';
import { useStore } from '@/store/useStore';
import { authService } from '@/services/api/auth-service';
import { Pill, ArrowLeft, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      // Set flag to allow session restoration on future page loads
      sessionStorage.setItem('restore_session', 'true');
      await login(response.user as any);
      toast.success(`Welcome back, ${response.user.name}!`);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error?.message || 'Invalid email or password');
      // Set error on password field for failed login
      setErrors({ password: 'Invalid email or password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          Back to home
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <CardEnhanced variant="glass" padding="lg" className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-magenta-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Pill className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">
              Sign in to your MedReminder account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputEnhanced
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="you@example.com"
              leftIcon={<Mail size={20} />}
              error={errors.email}
              required
            />

            <InputEnhanced
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              placeholder="••••••••"
              leftIcon={<Lock size={20} />}
              error={errors.password}
              required
            />

            <ButtonEnhanced
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </ButtonEnhanced>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </CardEnhanced>
      </div>
    </div>
  );
};

export default Login;
