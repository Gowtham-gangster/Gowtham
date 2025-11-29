import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { localAuthService } from '@/services/local-auth-service';
import { Pill, Loader2, ArrowLeft, User, Users } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs before submission
      if (!name.trim()) {
        toast.error('Please enter your name');
        setLoading(false);
        return;
      }

      if (!email.trim()) {
        toast.error('Please enter your email');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      // Use local auth service - instant signup, no email verification
      const user = await localAuthService.signUp({
        email: email.trim(),
        password,
        name: name.trim(),
        role,
      });
      
      login(user);
      toast.success(`Welcome, ${user.name}! Your account has been created.`);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Display user-friendly error message
      const errorMessage = error?.getUserMessage?.() || error?.message || 'Something went wrong. Please try again.';
      toast.error(errorMessage);
      
      // Log detailed error for debugging
      if (error?.code) {
        console.error('Error code:', error.code);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
          Back to home
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-soft">
          <CardHeader className="text-center">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Pill className="text-primary-foreground" size={32} />
            </div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Start managing your medications today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label>I am a...</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('PATIENT')}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                      role === 'PATIENT'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <User className="text-primary" size={20} />
                    </div>
                    <p className="font-semibold">Patient</p>
                    <p className="text-xs text-muted-foreground">
                      I manage my own medications
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('CAREGIVER')}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                      role === 'CAREGIVER'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-2">
                      <Users className="text-secondary" size={20} />
                    </div>
                    <p className="font-semibold">Caregiver</p>
                    <p className="text-xs text-muted-foreground">
                      I help others with their meds
                    </p>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="h-12"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 gradient-primary shadow-glow"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
