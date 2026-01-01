import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Medicine, Schedule, PillColor, MedicineForm as MedicineFormType, FrequencyType } from '@/types';
import { useStore } from '@/store/useStore';
import { generateId } from '@/services/api';
import { Button } from '@/components/ui/button';
import { ButtonEnhanced } from '@/components/ui/button-enhanced';
import { InputEnhanced } from '@/components/ui/input-enhanced';
import { CardEnhanced } from '@/components/ui/card-enhanced';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PillTag } from '@/components/ui/PillTag';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MedicineFormProps {
  existingMedicine?: Medicine;
  existingSchedule?: Schedule;
}

const pillColors: PillColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'teal'];
const medicineFormTypes: { value: MedicineFormType; label: string }[] = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'liquid', label: 'Liquid' },
  { value: 'injection', label: 'Injection' },
  { value: 'other', label: 'Other' },
];

const frequencyTypes: { value: FrequencyType; label: string }[] = [
  { value: 'DAILY', label: 'Every day' },
  { value: 'WEEKDAYS', label: 'Weekdays only (Mon-Fri)' },
  { value: 'CUSTOM_DAYS', label: 'Specific days of the week' },
  { value: 'EVERY_X_DAYS', label: 'Every X days' },
];

const daysOfWeek = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export const MedicineForm = ({ existingMedicine, existingSchedule }: MedicineFormProps) => {
  const navigate = useNavigate();
  const { user, addMedicine, updateMedicine, addSchedule, updateSchedule, deleteMedicine, deleteSchedule, elderlyMode } = useStore();

  // Medicine state
  const [name, setName] = useState(existingMedicine?.name || '');
  const [nickname, setNickname] = useState(existingMedicine?.nickname || '');
  const [strength, setStrength] = useState(existingMedicine?.strength || '');
  const [form, setForm] = useState<MedicineFormType>(existingMedicine?.form || 'tablet');
  const [colorTag, setColorTag] = useState<PillColor>(existingMedicine?.colorTag || 'blue');
  const [stockCount, setStockCount] = useState(existingMedicine?.stockCount?.toString() || '30');
  const [refillThreshold, setRefillThreshold] = useState(existingMedicine?.refillThreshold?.toString() || '7');
  const [instructions, setInstructions] = useState(existingMedicine?.instructions || '');

  // Schedule state
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(existingSchedule?.frequencyType || 'DAILY');
  const [timesOfDay, setTimesOfDay] = useState<string[]>(existingSchedule?.timesOfDay || ['08:00']);
  const [selectedDays, setSelectedDays] = useState<number[]>(existingSchedule?.daysOfWeek || [1, 2, 3, 4, 5]);
  const [intervalDays, setIntervalDays] = useState(existingSchedule?.intervalDays?.toString() || '2');
  const [dosageAmount, setDosageAmount] = useState(existingSchedule?.dosageAmount?.toString() || '1');
  const [startDate, setStartDate] = useState(existingSchedule?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(existingSchedule?.endDate?.split('T')[0] || '');
  const [maxDosePerIntake, setMaxDosePerIntake] = useState(existingSchedule?.maxDosePerIntake?.toString() || '');
  const [maxDosePerDay, setMaxDosePerDay] = useState(existingSchedule?.maxDosePerDay?.toString() || '');

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleAddTime = () => {
    setTimesOfDay([...timesOfDay, '12:00']);
  };

  const handleRemoveTime = (index: number) => {
    setTimesOfDay(timesOfDay.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...timesOfDay];
    newTimes[index] = value;
    setTimesOfDay(newTimes);
  };

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors: Record<string, string> = {};
    
    if (!name.trim()) {
      errors.name = 'Medicine name is required';
    }
    if (!strength.trim()) {
      errors.strength = 'Strength/dosage is required';
    }
    if (timesOfDay.length === 0) {
      errors.timesOfDay = 'Please add at least one dose time';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Please fix the validation errors');
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);

    try {
      const medicineId = existingMedicine?.id || generateId();
      const scheduleId = existingSchedule?.id || generateId();

      const medicine: Medicine = {
        id: medicineId,
        userId: user?.id || '',
        name,
        nickname: nickname || undefined,
        strength,
        form,
        colorTag,
        stockCount: parseInt(stockCount) || 0,
        refillThreshold: parseInt(refillThreshold) || 7,
        instructions: instructions || undefined,
        createdAt: existingMedicine?.createdAt || new Date().toISOString(),
      };

      const schedule: Schedule = {
        id: scheduleId,
        medicineId,
        frequencyType,
        timesOfDay: timesOfDay.sort(),
        daysOfWeek: frequencyType === 'CUSTOM_DAYS' ? selectedDays : undefined,
        intervalDays: frequencyType === 'EVERY_X_DAYS' ? parseInt(intervalDays) : undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        dosageAmount: parseInt(dosageAmount) || 1,
        dosageUnit: form === 'liquid' ? 'ml' : form,
        maxDosePerIntake: maxDosePerIntake ? parseInt(maxDosePerIntake) : undefined,
        maxDosePerDay: maxDosePerDay ? parseInt(maxDosePerDay) : undefined,
      };

      const perIntake = schedule.maxDosePerIntake ?? Infinity;
      const perDay = schedule.maxDosePerDay ?? Infinity;
      const dailyPlanned = schedule.timesOfDay.length * (schedule.dosageAmount || 1);
      const exceedsIntake = (schedule.dosageAmount || 1) > perIntake;
      const exceedsDay = dailyPlanned > perDay;
      if (exceedsIntake || exceedsDay) {
        const proceed = window.confirm('Dosage exceeds configured limits. Do you want to proceed?');
        if (!proceed) {
          setIsSubmitting(false);
          return;
        }
      }

      if (existingMedicine) {
        updateMedicine(medicineId, medicine);
        if (existingSchedule) {
          updateSchedule(scheduleId, schedule);
        } else {
          addSchedule(schedule);
        }
        toast.success('Medicine updated successfully');
      } else {
        addMedicine(medicine);
        addSchedule(schedule);
        toast.success('Medicine added successfully');
      }

      navigate('/medicines');
    } catch (error) {
      toast.error('Failed to save medicine');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (existingMedicine && confirm('Are you sure you want to delete this medicine?')) {
      if (existingSchedule) {
        deleteSchedule(existingSchedule.id);
      }
      deleteMedicine(existingMedicine.id);
      toast.success('Medicine deleted');
      navigate('/medicines');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/medicines')}
          className="gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
        {existingMedicine && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            className="gap-2"
          >
            <Trash2 size={18} />
            Delete
          </Button>
        )}
      </div>

      {/* Validation Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <CardEnhanced variant="bordered" padding="md" className="border-red-500/50 bg-red-500/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-500 mb-2">Please fix the following errors:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-400">
                {Object.values(validationErrors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardEnhanced>
      )}

      {/* Medicine Details */}
      <CardEnhanced variant="glass" padding="lg">
        <CardHeader className="px-0 pt-0">
          <CardTitle className={cn(elderlyMode && 'text-2xl')}>Medicine Details</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputEnhanced
              id="name"
              label="Medicine Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Metformin, Aspirin, Lisinopril"
              className={cn(elderlyMode && 'text-lg h-12')}
              required
              error={validationErrors.name}
            />
            <InputEnhanced
              id="nickname"
              label="Nickname (optional)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., Blood sugar pill, Heart medicine"
              helperText="A friendly name to help you remember"
              className={cn(elderlyMode && 'text-lg h-12')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputEnhanced
              id="strength"
              label="Strength/Dosage"
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              placeholder="e.g., 500mg, 10mg, 100ml"
              helperText="Include the unit (mg, ml, etc.)"
              className={cn(elderlyMode && 'text-lg h-12')}
              required
              error={validationErrors.strength}
            />
            <div className="space-y-2">
              <Label className={cn('text-base', elderlyMode && 'text-lg')}>Form</Label>
              <Select value={form} onValueChange={(v) => setForm(v as MedicineFormType)}>
                <SelectTrigger className={cn(elderlyMode && 'text-lg h-12')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {medicineFormTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className={cn('text-base', elderlyMode && 'text-lg')}>Color Tag</Label>
            <div className="flex flex-wrap gap-3">
              {pillColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setColorTag(color)}
                  className={cn(
                    'p-1 rounded-lg border-2 transition-all',
                    colorTag === color ? 'border-primary scale-110 shadow-glow' : 'border-transparent hover:border-gray-600'
                  )}
                >
                  <PillTag color={color} form={form} name={name || 'M'} size="md" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputEnhanced
              id="stockCount"
              label="Current Stock"
              type="number"
              min="0"
              value={stockCount}
              onChange={(e) => setStockCount(e.target.value)}
              placeholder="e.g., 30, 60, 90"
              helperText="How many doses you have"
              className={cn(elderlyMode && 'text-lg h-12')}
            />
            <InputEnhanced
              id="refillThreshold"
              label="Refill Alert Threshold"
              type="number"
              min="0"
              value={refillThreshold}
              onChange={(e) => setRefillThreshold(e.target.value)}
              placeholder="e.g., 7, 10, 14"
              helperText="Alert when stock falls below this"
              className={cn(elderlyMode && 'text-lg h-12')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions" className={cn('text-base', elderlyMode && 'text-lg')}>
              Instructions (Optional)
            </Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Take with food, Avoid alcohol, Take on empty stomach"
              className={cn(elderlyMode && 'text-lg min-h-[100px]')}
            />
            <p className="text-sm text-muted-foreground">
              Any special directions from your doctor
            </p>
          </div>
        </CardContent>
      </CardEnhanced>

      {/* Schedule */}
      <CardEnhanced variant="glass" padding="lg">
        <CardHeader className="px-0 pt-0">
          <CardTitle className={cn(elderlyMode && 'text-2xl')}>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 space-y-6">
          <div className="space-y-2">
            <Label className={cn('text-base', elderlyMode && 'text-lg')}>Frequency</Label>
            <Select value={frequencyType} onValueChange={(v) => setFrequencyType(v as FrequencyType)}>
              <SelectTrigger className={cn(elderlyMode && 'text-lg h-12')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {frequencyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {frequencyType === 'CUSTOM_DAYS' && (
            <div className="space-y-3">
              <Label className={cn('text-base', elderlyMode && 'text-lg')}>Select Days</Label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      'w-12 h-12',
                      elderlyMode && 'w-16 h-16 text-lg'
                    )}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {frequencyType === 'EVERY_X_DAYS' && (
            <InputEnhanced
              id="intervalDays"
              label="Every X days"
              type="number"
              min="2"
              value={intervalDays}
              onChange={(e) => setIntervalDays(e.target.value)}
              placeholder="e.g., 2, 3, 7"
              helperText="How many days between doses"
              className={cn('w-32', elderlyMode && 'text-lg h-12')}
            />
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className={cn('text-base', elderlyMode && 'text-lg')}>Times of Day</Label>
              <ButtonEnhanced
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Plus size={16} />}
                onClick={handleAddTime}
              >
                Add Time
              </ButtonEnhanced>
            </div>
            {validationErrors.timesOfDay && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.timesOfDay}
              </p>
            )}
            <div className="space-y-3">
              {timesOfDay.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    className={cn('w-32', elderlyMode && 'text-lg h-12 w-40')}
                  />
                  {timesOfDay.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTime(index)}
                    >
                      <Trash2 size={18} className="text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <InputEnhanced
            id="dosageAmount"
            label="Amount per dose"
            type="number"
            min="1"
            value={dosageAmount}
            onChange={(e) => setDosageAmount(e.target.value)}
            placeholder="e.g., 1, 2, 3"
            helperText="Number of pills/doses to take"
            className={cn('w-32', elderlyMode && 'text-lg h-12')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputEnhanced
              id="startDate"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={cn(elderlyMode && 'text-lg h-12')}
            />
            <InputEnhanced
              id="endDate"
              label="End Date (optional)"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              helperText="Leave empty for ongoing medication"
              className={cn(elderlyMode && 'text-lg h-12')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputEnhanced
              id="maxDosePerIntake"
              label="Max per intake (optional)"
              type="number"
              min="1"
              value={maxDosePerIntake}
              onChange={(e) => setMaxDosePerIntake(e.target.value)}
              placeholder="e.g., 2, 3"
              helperText="Maximum doses per single intake"
              className={cn('w-32', elderlyMode && 'text-lg h-12')}
            />
            <InputEnhanced
              id="maxDosePerDay"
              label="Max per day (optional)"
              type="number"
              min="1"
              value={maxDosePerDay}
              onChange={(e) => setMaxDosePerDay(e.target.value)}
              placeholder="e.g., 4, 6, 8"
              helperText="Maximum doses per day"
              className={cn('w-32', elderlyMode && 'text-lg h-12')}
            />
          </div>
        </CardContent>
      </CardEnhanced>

      <ButtonEnhanced
        type="submit"
        variant="primary"
        size={elderlyMode ? 'xl' : 'lg'}
        fullWidth
        leftIcon={<Save size={elderlyMode ? 24 : 20} />}
        isLoading={isSubmitting}
      >
        {existingMedicine ? 'Update Medicine' : 'Add Medicine'}
      </ButtonEnhanced>
    </form>
  );
};
