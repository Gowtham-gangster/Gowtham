import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ButtonEnhanced } from '@/components/ui/button-enhanced';
import { InputEnhanced } from '@/components/ui/input-enhanced';
import { CardEnhanced } from '@/components/ui/card-enhanced';
import { useStore } from '@/store/useStore';
import { authService } from '@/services/api/auth-service';
import { Pill, ArrowLeft, User as UserIcon, Users, Mail, Lock, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';

export const Signup = () => {
  const navigate = useNavigate();
  const { login } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('PATIENT');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  // Password strength calculation
  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    
    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
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
      const response = await authService.signup({
        email: email.trim(),
        password,
        name: name.trim(),
        role,
      });
      
      // Set flag to allow session restoration on future page loads
      sessionStorage.setItem('restore_session', 'true');
      await login(response.user as any);
      toast.success(`Welcome, ${response.user.name}! Your account has been created.`);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error?.message || 'Something went wrong. Please try again.');
      // Set error on email field for duplicate email errors
      if (error?.message?.toLowerCase().includes('email')) {
        setErrors({ email: error.message });
      }
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
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">
              Start managing your medications today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                I am a... <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('PATIENT')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                    role === 'PATIENT'
                      ? 'border-violet-500 bg-violet-600/10 shadow-glow'
                      : 'border-gray-700 hover:border-violet-500/50'
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center mb-2">
                    <UserIcon className="text-violet-400" size={20} />
                  </div>
                  <p className="font-semibold text-white">Patient</p>
                  <p className="text-xs text-gray-400">
                    I manage my own medications
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('CAREGIVER')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                    role === 'CAREGIVER'
                      ? 'border-magenta-500 bg-magenta-600/10 shadow-glow'
                      : 'border-gray-700 hover:border-magenta-500/50'
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-magenta-600/20 flex items-center justify-center mb-2">
                    <Users className="text-magenta-400" size={20} />
                  </div>
                  <p className="font-semibold text-white">Caregiver</p>
                  <p className="text-xs text-gray-400">
                    I help others with their meds
                  </p>
                </button>
              </div>
            </div>

            <InputEnhanced
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="John Doe"
              leftIcon={<UserIcon size={20} />}
              error={errors.name}
              required
            />

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

            <div>
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
                helperText="At least 6 characters"
                required
              />
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Password strength:</span>
                    <span className={cn(
                      'font-medium',
                      passwordStrength.score === 1 && 'text-red-500',
                      passwordStrength.score === 2 && 'text-yellow-500',
                      passwordStrength.score === 3 && 'text-blue-500',
                      passwordStrength.score === 4 && 'text-green-500'
                    )}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          'h-1.5 flex-1 rounded-full transition-all duration-200',
                          level <= passwordStrength.score
                            ? passwordStrength.color
                            : 'bg-gray-700'
                        )}
                      />
                    ))}
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className={cn(
                      'flex items-center gap-1',
                      password.length >= 6 ? 'text-green-500' : 'text-gray-500'
                    )}>
                      {password.length >= 6 ? <Check size={14} /> : <X size={14} />}
                      <span>At least 6 characters</span>
                    </div>
                    <div className={cn(
                      'flex items-center gap-1',
                      /[a-z]/.test(password) && /[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-500'
                    )}>
                      {/[a-z]/.test(password) && /[A-Z]/.test(password) ? <Check size={14} /> : <X size={14} />}
                      <span>Upper and lowercase letters</span>
                    </div>
                    <div className={cn(
                      'flex items-center gap-1',
                      /\d/.test(password) ? 'text-green-500' : 'text-gray-500'
                    )}>
                      {/\d/.test(password) ? <Check size={14} /> : <X size={14} />}
                      <span>At least one number</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <ButtonEnhanced
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </ButtonEnhanced>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </CardEnhanced>
      </div>
    </div>
  );
};

export default Signup;
