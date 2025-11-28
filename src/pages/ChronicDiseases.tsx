import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useStore } from '@/store/useStore';
import { ChronicDisease, DiseaseProfile, Guideline, Precaution } from '@/types/chronic-disease';
import { DiseaseSelectionGrid } from '@/components/chronic-diseases/DiseaseSelectionGrid';
import { DiseaseProfileForm } from '@/components/chronic-diseases/DiseaseProfileForm';
import { GuidelinesDisplay } from '@/components/chronic-diseases/GuidelinesDisplay';
import { SavedProfilesList } from '@/components/chronic-diseases/SavedProfilesList';
import { guidelineGenerator } from '@/services/guideline-generator';
import { pdfGenerator } from '@/services/pdf-generator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Activity, ArrowLeft, List } from 'lucide-react';
import { toast } from 'sonner';

type ViewState = 'selection' | 'form' | 'guidelines' | 'profiles';

export const ChronicDiseases = () => {
  const { elderlyMode, diseaseProfiles, addDiseaseProfile, updateDiseaseProfile, deleteDiseaseProfile, user } = useStore();
  
  const [currentView, setCurrentView] = useState<ViewState>('selection');
  const [selectedDisease, setSelectedDisease] = useState<ChronicDisease | null>(null);
  const [currentProfile, setCurrentProfile] = useState<DiseaseProfile | null>(null);
  const [currentGuidelines, setCurrentGuidelines] = useState<Guideline[]>([]);
  const [currentPrecautions, setCurrentPrecautions] = useState<Precaution[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDiseaseSelect = (disease: ChronicDisease) => {
    setSelectedDisease(disease);
    setCurrentProfile(null);
    setCurrentView('form');
  };

  const handleFormSubmit = (profile: DiseaseProfile) => {
    setIsLoading(true);
    
    try {
      // Update profile with actual user ID
      const updatedProfile = {
        ...profile,
        userId: user?.id || 'current-user',
      };
      
      // Generate guidelines and precautions
      const guidelines = guidelineGenerator.generateGuidelines(updatedProfile);
      const precautions = guidelineGenerator.generatePrecautions(updatedProfile);
      
      setCurrentProfile(updatedProfile);
      setCurrentGuidelines(guidelines);
      setCurrentPrecautions(precautions);
      setCurrentView('guidelines');
      
      toast.success('Guidelines generated successfully!');
    } catch (error) {
      console.error('Error generating guidelines:', error);
      toast.error('Failed to generate guidelines. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setCurrentView('selection');
    setSelectedDisease(null);
    setCurrentProfile(null);
  };

  const handleSaveProfile = () => {
    if (!currentProfile) return;
    
    try {
      // Check if profile already exists
      const existingProfile = diseaseProfiles.find(p => p.id === currentProfile.id);
      
      if (existingProfile) {
        updateDiseaseProfile(currentProfile.id, currentProfile);
        toast.success('Profile updated successfully!');
      } else {
        addDiseaseProfile(currentProfile);
        toast.success('Profile saved successfully!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const handleEditProfile = () => {
    if (!currentProfile || !selectedDisease) return;
    setCurrentView('form');
  };

  const handleDownloadPDF = async () => {
    if (!currentProfile) return;
    
    try {
      setIsLoading(true);
      const pdfBlob = await pdfGenerator.generatePrescriptionPDF(
        currentProfile,
        currentGuidelines,
        currentPrecautions
      );
      const filename = pdfGenerator.generateFilename(currentProfile.diseaseName);
      pdfGenerator.downloadPDF(pdfBlob, filename);
      toast.success('Prescription downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSavedProfiles = () => {
    setCurrentView('profiles');
    setSelectedDisease(null);
    setCurrentProfile(null);
  };

  const handleViewProfile = (profile: DiseaseProfile) => {
    setIsLoading(true);
    
    try {
      // Regenerate guidelines and precautions
      const guidelines = guidelineGenerator.generateGuidelines(profile);
      const precautions = guidelineGenerator.generatePrecautions(profile);
      
      setCurrentProfile(profile);
      setCurrentGuidelines(guidelines);
      setCurrentPrecautions(precautions);
      setCurrentView('guidelines');
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSavedProfile = (profile: DiseaseProfile) => {
    // Find the disease for this profile
    const disease = chronicDiseases.find(d => d.id === profile.diseaseId);
    if (!disease) {
      toast.error('Disease information not found.');
      return;
    }
    
    setSelectedDisease(disease);
    setCurrentProfile(profile);
    setCurrentView('form');
  };

  const handleDeleteProfile = (profileId: string) => {
    try {
      deleteDiseaseProfile(profileId);
      toast.success('Profile deleted successfully!');
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete profile. Please try again.');
    }
  };

  const handleBackToSelection = () => {
    setCurrentView('selection');
    setSelectedDisease(null);
    setCurrentProfile(null);
    setCurrentGuidelines([]);
    setCurrentPrecautions([]);
  };

  return (
    <Layout>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {(currentView === 'form' || currentView === 'guidelines' || currentView === 'profiles') && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleBackToSelection}
                className="glass"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className={cn('text-2xl font-bold flex items-center gap-2', elderlyMode && 'text-3xl')}>
                <Activity className={cn('w-7 h-7 text-primary', elderlyMode && 'w-9 h-9')} />
                Chronic Diseases
              </h1>
              <p className="text-muted-foreground mt-1">
                {currentView === 'selection' && 'Select a condition to get personalized management guidelines'}
                {currentView === 'form' && 'Provide your health information'}
                {currentView === 'guidelines' && 'Your personalized management plan'}
                {currentView === 'profiles' && 'View and manage your saved profiles'}
              </p>
            </div>
          </div>
          
          {currentView === 'selection' && diseaseProfiles.length > 0 && (
            <Button
              onClick={handleViewSavedProfiles}
              className={cn('gradient-primary gap-2', elderlyMode && 'h-12 text-lg')}
            >
              <List className="w-5 h-5" />
              Saved Profiles ({diseaseProfiles.length})
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <>
            {currentView === 'selection' && (
              <DiseaseSelectionGrid
                onDiseaseSelect={handleDiseaseSelect}
                elderlyMode={elderlyMode}
              />
            )}

            {currentView === 'form' && selectedDisease && (
              <DiseaseProfileForm
                disease={selectedDisease}
                existingProfile={currentProfile || undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                elderlyMode={elderlyMode}
              />
            )}

            {currentView === 'guidelines' && currentProfile && (
              <GuidelinesDisplay
                profile={currentProfile}
                guidelines={currentGuidelines}
                precautions={currentPrecautions}
                onDownloadPDF={handleDownloadPDF}
                onEdit={handleEditProfile}
                onSave={handleSaveProfile}
                elderlyMode={elderlyMode}
              />
            )}

            {currentView === 'profiles' && (
              <SavedProfilesList
                profiles={diseaseProfiles}
                onView={handleViewProfile}
                onEdit={handleEditSavedProfile}
                onDelete={handleDeleteProfile}
                elderlyMode={elderlyMode}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ChronicDiseases;

// Import chronic diseases data for the edit function
import { chronicDiseases } from '@/data/chronic-diseases';
