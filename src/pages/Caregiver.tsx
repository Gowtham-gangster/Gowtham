import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Plus, 
  Link as LinkIcon, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { generateId } from '@/services/api';
import { CaregiverLink } from '@/types';

export const Caregiver = () => {
  const { user, caregiverLinks, addCaregiverLink, removeCaregiverLink, elderlyMode } = useStore();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddPatient = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock adding a patient
    const link: CaregiverLink = {
      id: generateId(),
      caregiverId: user?.id || '',
      patientId: generateId(),
      patientName: `Patient ${inviteCode}`,
      createdAt: new Date().toISOString()
    };
    
    addCaregiverLink(link);
    setInviteCode('');
    toast.success('Patient linked successfully!');
    setLoading(false);
  };

  const handleRemovePatient = (linkId: string) => {
    if (confirm('Are you sure you want to unlink this patient?')) {
      removeCaregiverLink(linkId);
      toast.success('Patient unlinked');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className={cn('text-2xl font-bold flex items-center gap-2', elderlyMode && 'text-3xl')}>
            <Users size={elderlyMode ? 32 : 26} className="text-primary" />
            Manage Patients
          </h1>
          <p className={cn('text-muted-foreground', elderlyMode && 'text-lg')}>
            Monitor medication adherence for your patients
          </p>
        </div>

        {/* Add Patient */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className={cn('flex items-center gap-2', elderlyMode && 'text-xl')}>
              <LinkIcon size={20} />
              Link New Patient
            </CardTitle>
            <CardDescription>
              Enter the invite code shared by a patient to start monitoring their medications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="inviteCode" className="sr-only">Invite Code</Label>
                <Input
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Enter invite code (e.g., ABC123XY)"
                  className={cn('font-mono', elderlyMode && 'h-14 text-lg')}
                />
              </div>
              <Button
                onClick={handleAddPatient}
                disabled={loading || !inviteCode.trim()}
                className={cn('gradient-primary gap-2', elderlyMode && 'h-14 text-lg px-6')}
              >
                <Plus size={20} />
                Link Patient
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patient List */}
        {caregiverLinks.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={40} className="text-muted-foreground" />
              </div>
              <h3 className={cn('text-lg font-semibold mb-2', elderlyMode && 'text-xl')}>
                No patients linked yet
              </h3>
              <p className={cn('text-muted-foreground max-w-md mx-auto', elderlyMode && 'text-lg')}>
                Ask your patient to share their invite code from their Settings page, 
                then enter it above to start monitoring.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className={cn('font-semibold text-lg', elderlyMode && 'text-xl')}>
              Linked Patients ({caregiverLinks.length})
            </h2>
            {caregiverLinks.map((link) => (
              <Card key={link.id} className="shadow-soft">
                <CardContent className={cn('p-4', elderlyMode && 'p-6')}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
                      {link.patientName.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={cn('font-semibold text-lg', elderlyMode && 'text-xl')}>
                        {link.patientName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Linked since {new Date(link.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Mock stats */}
                      <div className="hidden md:flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={16} className="text-success" />
                          <span>
                            <span className="font-semibold text-success">85%</span>
                            <span className="text-muted-foreground ml-1">adherence</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-primary" />
                          <span>
                            <span className="font-semibold">3</span>
                            <span className="text-muted-foreground ml-1">doses today</span>
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePatient(link.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Mobile stats */}
                  <div className="md:hidden flex items-center gap-4 mt-4 text-sm">
                    <Badge variant="outline" className="gap-1">
                      <TrendingUp size={12} className="text-success" />
                      85% adherence
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Calendar size={12} />
                      3 doses today
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Caregiver;
