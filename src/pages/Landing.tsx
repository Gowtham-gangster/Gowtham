import { Link } from 'react-router-dom';
import { ButtonEnhanced } from '@/components/ui/button-enhanced';
import { CardEnhanced } from '@/components/ui/card-enhanced';
import { 
  Pill, 
  Bell, 
  Clock, 
  Users, 
  Volume2, 
  Shield, 
  Calendar,
  Heart,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description: 'Complex medication schedules made simple. Daily, weekly, or custom intervals.'
  },
  {
    icon: Bell,
    title: 'Never Miss a Dose',
    description: 'Timely reminders with in-app notifications and alerts.'
  },
  {
    icon: Volume2,
    title: 'Voice Reminders',
    description: 'Spoken reminders for accessibility. Perfect for elderly users.'
  },
  {
    icon: Users,
    title: 'Caregiver Support',
    description: 'Share your schedule with family members or caregivers.'
  },
  {
    icon: Calendar,
    title: 'Track Your Progress',
    description: 'Monitor adherence with detailed history and statistics.'
  },
  {
    icon: Shield,
    title: 'Refill Alerts',
    description: 'Get notified before you run out of medication.'
  }
];

export const Landing = () => {
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 glass backdrop-blur-md border-b border-white/10">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-violet-600 to-magenta-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-glow">
              <Pill className="text-white" size={22} />
            </div>
            <span className="font-bold text-lg sm:text-xl text-white">MedReminder Pro</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login">
              <ButtonEnhanced variant="ghost" size="md" className="text-sm sm:text-base">Log in</ButtonEnhanced>
            </Link>
            <Link to="/signup">
              <ButtonEnhanced variant="primary" size="md" className="shadow-glow text-sm sm:text-base">
                Sign up
              </ButtonEnhanced>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Task 3.1 */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-magenta-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent" />
        
        {/* Floating orbs for futuristic effect */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-magenta-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container px-4 relative mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass backdrop-blur-md bg-violet-600/10 border border-violet-500/30 text-violet-300 text-sm font-medium mb-6 animate-fade-in">
              <Sparkles size={16} className="text-violet-400" aria-hidden="true" />
              <span>Your AI-Powered Health Companion</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up leading-tight">
              Never Miss a{' '}
              <span className="bg-gradient-to-r from-violet-400 via-magenta-400 to-cyan-400 bg-clip-text text-transparent">
                Medication
              </span>{' '}
              Again
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-10 animate-slide-up leading-relaxed max-w-3xl mx-auto">
              Smart prescription management and intelligent reminders designed for patients 
              with chronic conditions, elderly users, and their caregivers.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up mb-8">
              <Link to="/signup">
                <ButtonEnhanced 
                  size="xl" 
                  variant="primary" 
                  className="shadow-glow hover:scale-105 transition-transform"
                  rightIcon={<ArrowRight size={24} aria-hidden="true" />}
                >
                  Get Started Free
                </ButtonEnhanced>
              </Link>
              <Link to="/login">
                <ButtonEnhanced 
                  size="xl" 
                  variant="outline"
                  className="hover:scale-105 transition-transform"
                >
                  I have an account
                </ButtonEnhanced>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" aria-hidden="true" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" aria-hidden="true" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" aria-hidden="true" />
                <span>HIPAA compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Task 3.2 */}
      <section className="py-20 relative">
        <div className="container px-4 mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass backdrop-blur-md bg-cyan-600/10 border border-cyan-500/30 text-cyan-300 text-sm font-medium mb-4">
              <Zap size={16} className="text-cyan-400" aria-hidden="true" />
              <span>Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                stay healthy
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Designed with accessibility and ease of use in mind for users of all ages and abilities.
            </p>
          </div>
          
          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <CardEnhanced
                  key={index}
                  variant="glass"
                  padding="lg"
                  hover={true}
                  className="group animate-fade-in border border-white/10"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div 
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-magenta-600 flex items-center justify-center mb-4 shadow-glow group-hover:scale-110 transition-transform"
                    aria-hidden="true"
                  >
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-violet-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardEnhanced>
              );
            })}
          </div>
        </div>
      </section>

      {/* Elderly Mode Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-magenta-600/5" />
        <div className="container px-4 mx-auto max-w-7xl relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass backdrop-blur-md bg-magenta-600/10 border border-magenta-500/30 text-magenta-300 text-sm font-medium mb-6">
                <Users size={16} className="text-magenta-400" />
                <span>Designed for everyone</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Elderly Mode for{' '}
                <span className="bg-gradient-to-r from-magenta-400 to-violet-400 bg-clip-text text-transparent">
                  Easy Access
                </span>
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Large buttons, high contrast, simplified interface, and voice reminders 
                make medication management easy for seniors and those with visual impairments.
              </p>
              <ul className="space-y-4">
                {[
                  'Extra large text and buttons',
                  'High contrast colors',
                  'Voice-guided reminders',
                  'Simplified navigation',
                  'One-tap dose confirmation'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="text-green-500" size={16} />
                    </div>
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 relative">
              <CardEnhanced variant="glass" padding="lg" className="border border-white/10 shadow-glow">
                <div className="space-y-6">
                  <div className="text-3xl font-bold text-center text-white">9:00 AM</div>
                  <CardEnhanced 
                    variant="bordered" 
                    padding="lg" 
                    className="border-violet-500 shadow-glow"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-glowCyan flex-shrink-0">
                        <Pill className="text-white" size={32} />
                      </div>
                      <div className="flex-1">
                        <p className="text-2xl font-bold text-white">Metformin</p>
                        <p className="text-lg text-gray-400">500mg • 1 tablet</p>
                      </div>
                    </div>
                    <ButtonEnhanced 
                      variant="primary" 
                      size="xl" 
                      fullWidth 
                      className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-glow"
                      leftIcon={<CheckCircle2 size={28} />}
                    >
                      Take Now
                    </ButtonEnhanced>
                  </CardEnhanced>
                </div>
              </CardEnhanced>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Task 3.3 */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-magenta-600/10 to-cyan-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent" />
        
        <div className="container px-4 text-center mx-auto max-w-7xl relative">
          <CardEnhanced 
            variant="glass" 
            padding="lg" 
            className="max-w-4xl mx-auto border border-white/10 shadow-glow"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass backdrop-blur-md bg-violet-600/10 border border-violet-500/30 text-violet-300 text-sm font-medium mb-6">
              <Heart size={16} className="text-violet-400" />
              <span>Join thousands of users</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Start managing your medications{' '}
              <span className="bg-gradient-to-r from-violet-400 to-magenta-400 bg-clip-text text-transparent">
                today
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of users who never miss a dose. Free to use, no credit card required.
            </p>
            
            <Link to="/signup">
              <ButtonEnhanced 
                size="xl" 
                variant="primary" 
                className="shadow-glow hover:scale-105 transition-transform"
                rightIcon={<ArrowRight size={24} />}
              >
                Create Free Account
              </ButtonEnhanced>
            </Link>
          </CardEnhanced>
        </div>
      </section>

      {/* Footer - Task 3.3 */}
      <footer className="py-12 border-t border-white/10 relative">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-r from-violet-600 to-magenta-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-glow">
                  <Pill className="text-white" size={20} />
                </div>
                <span className="font-bold text-lg text-white">MedReminder Pro</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your health, our priority. Smart medication management for everyone.
              </p>
            </div>
            
            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/signup" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">Features</Link></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">Pricing</Link></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">Security</Link></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">Roadmap</Link></li>
              </ul>
            </div>
            
            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/signup" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">About</Link></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">Blog</Link></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">Careers</Link></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">Contact</Link></li>
              </ul>
            </div>
            
            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/signup" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">Privacy</Link></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">Terms</Link></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">HIPAA</Link></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">Compliance</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © 2024 MedReminder Pro. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">
                LinkedIn
              </a>
              <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
