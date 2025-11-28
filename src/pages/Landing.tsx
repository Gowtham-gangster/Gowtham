import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  ArrowRight
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="gradient-primary w-10 h-10 rounded-xl flex items-center justify-center shadow-glow">
              <Pill className="text-primary-foreground" size={22} />
            </div>
            <span className="font-bold text-xl">MedReminder</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button className="gradient-primary shadow-glow">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="container px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Heart size={16} />
              Your health companion
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up">
              Never Miss a{' '}
              <span className="text-primary">Medication</span>{' '}
              Again
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-slide-up">
              Smart prescription management and medication reminders designed for patients 
              with chronic conditions, elderly users, and their caregivers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link to="/signup">
                <Button size="lg" className="gradient-primary shadow-glow text-lg px-8 h-14">
                  Get Started Free
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                  I have an account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to manage medications
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Designed with accessibility in mind for users of all ages and abilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-glow">
                      <Icon className="text-primary-foreground" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Elderly Mode Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
                <Users size={16} />
                Designed for everyone
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Elderly Mode for{' '}
                <span className="text-secondary">Easy Access</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Large buttons, high contrast, simplified interface, and voice reminders 
                make medication management easy for seniors and those with visual impairments.
              </p>
              <ul className="space-y-3">
                {[
                  'Extra large text and buttons',
                  'High contrast colors',
                  'Voice-guided reminders',
                  'Simplified navigation',
                  'One-tap dose confirmation'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="text-success" size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-card rounded-2xl shadow-soft p-6 border border-border">
                <div className="space-y-4">
                  <div className="text-2xl font-bold text-center">9:00 AM</div>
                  <div className="bg-primary/5 rounded-xl p-6 border-2 border-primary">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-pill-blue flex items-center justify-center">
                        <Pill className="text-primary-foreground" size={32} />
                      </div>
                      <div className="flex-1">
                        <p className="text-2xl font-bold">Metformin</p>
                        <p className="text-lg text-muted-foreground">500mg • 1 tablet</p>
                      </div>
                    </div>
                    <Button className="w-full mt-4 h-16 text-xl gradient-success">
                      <CheckCircle2 className="mr-2" size={28} />
                      Take Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start managing your medications today
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who never miss a dose. Free to use, no credit card required.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gradient-primary shadow-glow text-lg px-8 h-14">
              Create Free Account
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="gradient-primary w-8 h-8 rounded-lg flex items-center justify-center">
                <Pill className="text-primary-foreground" size={16} />
              </div>
              <span className="font-semibold">MedReminder</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MedReminder. Your health, our priority.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
