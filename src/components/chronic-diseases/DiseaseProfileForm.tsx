import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChronicDisease, DiseaseProfile } from '@/types/chronic-disease';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ArrowLeft, User, Activity, Heart, Pill } from 'lucide-react';

const profileSchema = z.object({
  age: z.number().min(1, 'Age must be at least 1').max(120, 'Age must be at most 120'),
  gender: z.enum(['male', 'female', 'other']).optional(),
  symptoms: z.array(z.string()).min(1, 'Please select at least one symptom'),
  diet: z.enum(['poor', 'average', 'good', 'excellent']),
  exerciseFrequency: z.enum(['none', 'rarely', 'weekly', 'daily']),
  smokingStatus: z.enum(['never', 'former', 'current']),
  alcoholConsumption: z.enum(['none', 'occasional', 'moderate', 'heavy']),
  medicationHistory: z.string().min(10, 'Please provide at least 10 characters').max(1000, 'Maximum 1000 characters allowed').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface DiseaseProfileFormProps {
  disease: ChronicDisease;
  existingProfile?: DiseaseProfile;
  onSubmit: (profile: DiseaseProfile) => void;
  onCancel: () => void;
  elderlyMode: boolean;
}

export const DiseaseProfileForm = ({ 
  disease, 
  existingProfile, 
  onSubmit, 
  onCancel,
  elderlyMode 
}: DiseaseProfileFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: existingProfile ? {
      age: existingProfile.personalInfo.age,
      gender: existingProfile.personalInfo.gender,
      symptoms: existingProfile.symptoms,
      diet: existingProfile.lifestyle.diet,
      exerciseFrequency: existingProfile.lifestyle.exerciseFrequency,
      smokingStatus: existingProfile.lifestyle.smokingStatus,
      alcoholConsumption: existingProfile.lifestyle.alcoholConsumption,
      medicationHistory: existingProfile.medicationHistory,
    } : {
      symptoms: [],
      diet: 'average',
      exerciseFrequency: 'weekly',
      smokingStatus: 'never',
      alcoholConsumption: 'none',
      medicationHistory: '',
    },
  });

  const selectedSymptoms = watch('symptoms') || [];

  const handleSymptomToggle = (symptom: string) => {
    const current = selectedSymptoms;
    const updated = current.includes(symptom)
      ? current.filter((s) => s !== symptom)
      : [...current, symptom];
    setValue('symptoms', updated);
  };

  const onFormSubmit = (data: ProfileFormData) => {
    const profile: DiseaseProfile = {
      id: existingProfile?.id || Math.random().toString(36).substring(2, 11),
      userId: 'current-user', // This will be replaced with actual user ID
      diseaseId: disease.id,
      diseaseName: disease.name,
      personalInfo: {
        age: data.age,
        gender: data.gender,
      },
      symptoms: data.symptoms,
      lifestyle: {
        diet: data.diet,
        exerciseFrequency: data.exerciseFrequency,
        smokingStatus: data.smokingStatus,
        alcoholConsumption: data.alcoholConsumption,
      },
      medicationHistory: data.medicationHistory || '',
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSubmit(profile);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onCancel}
          className="glass"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className={cn('text-2xl font-bold', elderlyMode && 'text-3xl')}>
            {disease.name} Profile
          </h2>
          <p className="text-muted-foreground">
            {existingProfile ? 'Update your health information' : 'Tell us about your health'}
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className={cn('flex items-center gap-2', elderlyMode && 'text-xl')}>
            <User className="w-5 h-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                {...register('age', { valueAsNumber: true })}
                className={cn(elderlyMode && 'h-12 text-lg')}
              />
              {errors.age && (
                <p className="text-sm text-destructive">{errors.age.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                onValueChange={(value) => setValue('gender', value as 'male' | 'female' | 'other')}
                defaultValue={existingProfile?.personalInfo.gender}
              >
                <SelectTrigger className={cn(elderlyMode && 'h-12 text-lg')}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Symptoms */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className={cn('flex items-center gap-2', elderlyMode && 'text-xl')}>
            <Activity className="w-5 h-5 text-primary" />
            Current Symptoms *
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {disease.commonSymptoms.map((symptom) => (
              <div key={symptom} className="flex items-center space-x-2">
                <Checkbox
                  id={symptom}
                  checked={selectedSymptoms.includes(symptom)}
                  onCheckedChange={() => handleSymptomToggle(symptom)}
                />
                <Label
                  htmlFor={symptom}
                  className={cn('cursor-pointer', elderlyMode && 'text-base')}
                >
                  {symptom}
                </Label>
              </div>
            ))}
          </div>
          {errors.symptoms && (
            <p className="text-sm text-destructive mt-2">{errors.symptoms.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Lifestyle Factors */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className={cn('flex items-center gap-2', elderlyMode && 'text-xl')}>
            <Heart className="w-5 h-5 text-primary" />
            Lifestyle Factors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diet">Diet Quality</Label>
              <Select
                onValueChange={(value) => setValue('diet', value as 'poor' | 'average' | 'good' | 'excellent')}
                defaultValue={watch('diet')}
              >
                <SelectTrigger className={cn(elderlyMode && 'h-12 text-lg')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exercise">Exercise Frequency</Label>
              <Select
                onValueChange={(value) => setValue('exerciseFrequency', value as 'none' | 'rarely' | 'weekly' | 'daily')}
                defaultValue={watch('exerciseFrequency')}
              >
                <SelectTrigger className={cn(elderlyMode && 'h-12 text-lg')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="rarely">Rarely</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="smoking">Smoking Status</Label>
              <Select
                onValueChange={(value) => setValue('smokingStatus', value as 'never' | 'former' | 'current')}
                defaultValue={watch('smokingStatus')}
              >
                <SelectTrigger className={cn(elderlyMode && 'h-12 text-lg')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="former">Former</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alcohol">Alcohol Consumption</Label>
              <Select
                onValueChange={(value) => setValue('alcoholConsumption', value as 'none' | 'occasional' | 'moderate' | 'heavy')}
                defaultValue={watch('alcoholConsumption')}
              >
                <SelectTrigger className={cn(elderlyMode && 'h-12 text-lg')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="occasional">Occasional</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="heavy">Heavy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medication History */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className={cn('flex items-center gap-2', elderlyMode && 'text-xl')}>
            <Pill className="w-5 h-5 text-primary" />
            Medication History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="medicationHistory">
            Current medications, allergies, and past treatments
          </Label>
          <Textarea
            id="medicationHistory"
            {...register('medicationHistory')}
            placeholder="List your current medications, any drug allergies, and relevant medical history..."
            rows={5}
            className={cn(elderlyMode && 'text-lg')}
          />
          {errors.medicationHistory && (
            <p className="text-sm text-destructive">{errors.medicationHistory.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {watch('medicationHistory')?.length || 0} / 1000 characters
          </p>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className={cn('glass', elderlyMode && 'h-12 text-lg')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className={cn('gradient-primary flex-1', elderlyMode && 'h-12 text-lg')}
        >
          {existingProfile ? 'Update Profile' : 'Generate Guidelines'}
        </Button>
      </div>
    </form>
  );
};
