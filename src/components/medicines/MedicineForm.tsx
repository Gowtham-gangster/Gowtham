import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Medicine, Schedule, PillColor, MedicineForm as MedicineFormType, FrequencyType } from '@/types';
import { useStore } from '@/store/useStore';
import { generateId } from '@/services/api';
import { Button } from '@/components/ui/button';
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
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
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

    if (!name || !strength) {
      toast.error('Please fill in required fields');
      return;
    }

    if (timesOfDay.length === 0) {
      toast.error('Please add at least one dose time');
      return;
    }

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
      if (!proceed) return;
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

      {/* Medicine Details */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className={cn(elderlyMode && 'text-2xl')}>Medicine Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={cn(elderlyMode && 'text-lg')}>
                Medicine Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Metformin"
                className={cn(elderlyMode && 'text-lg h-12')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname" className={cn(elderlyMode && 'text-lg')}>
                Nickname (optional)
              </Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g., Blood sugar pill"
                className={cn(elderlyMode && 'text-lg h-12')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strength" className={cn(elderlyMode && 'text-lg')}>
                Strength/Dosage *
              </Label>
              <Input
                id="strength"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                placeholder="e.g., 500mg"
                className={cn(elderlyMode && 'text-lg h-12')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className={cn(elderlyMode && 'text-lg')}>Form</Label>
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

          <div className="space-y-2">
            <Label className={cn(elderlyMode && 'text-lg')}>Color Tag</Label>
            <div className="flex flex-wrap gap-3">
              {pillColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setColorTag(color)}
                  className={cn(
                    'p-1 rounded-lg border-2 transition-all',
                    colorTag === color ? 'border-primary scale-110' : 'border-transparent'
                  )}
                >
                  <PillTag color={color} form={form} name={name || 'M'} size="md" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stockCount" className={cn(elderlyMode && 'text-lg')}>
                Current Stock
              </Label>
              <Input
                id="stockCount"
                type="number"
                min="0"
                value={stockCount}
                onChange={(e) => setStockCount(e.target.value)}
                className={cn(elderlyMode && 'text-lg h-12')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refillThreshold" className={cn(elderlyMode && 'text-lg')}>
                Refill Alert Threshold
              </Label>
              <Input
                id="refillThreshold"
                type="number"
                min="0"
                value={refillThreshold}
                onChange={(e) => setRefillThreshold(e.target.value)}
                className={cn(elderlyMode && 'text-lg h-12')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions" className={cn(elderlyMode && 'text-lg')}>
              Instructions
            </Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Take with food"
              className={cn(elderlyMode && 'text-lg')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className={cn(elderlyMode && 'text-2xl')}>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className={cn(elderlyMode && 'text-lg')}>Frequency</Label>
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
            <div className="space-y-2">
              <Label className={cn(elderlyMode && 'text-lg')}>Select Days</Label>
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
            <div className="space-y-2">
              <Label htmlFor="intervalDays" className={cn(elderlyMode && 'text-lg')}>
                Every X days
              </Label>
              <Input
                id="intervalDays"
                type="number"
                min="2"
                value={intervalDays}
                onChange={(e) => setIntervalDays(e.target.value)}
                className={cn('w-24', elderlyMode && 'text-lg h-12')}
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className={cn(elderlyMode && 'text-lg')}>Times of Day</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTime}
                className="gap-1"
              >
                <Plus size={16} />
                Add Time
              </Button>
            </div>
            <div className="space-y-2">
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

          <div className="space-y-2">
            <Label htmlFor="dosageAmount" className={cn(elderlyMode && 'text-lg')}>
              Amount per dose
            </Label>
            <Input
              id="dosageAmount"
              type="number"
              min="1"
              value={dosageAmount}
              onChange={(e) => setDosageAmount(e.target.value)}
              className={cn('w-24', elderlyMode && 'text-lg h-12')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className={cn(elderlyMode && 'text-lg')}>
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={cn(elderlyMode && 'text-lg h-12')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className={cn(elderlyMode && 'text-lg')}>
                End Date (optional)
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={cn(elderlyMode && 'text-lg h-12')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxDosePerIntake" className={cn(elderlyMode && 'text-lg')}>
                Max per intake (optional)
              </Label>
              <Input
                id="maxDosePerIntake"
                type="number"
                min="1"
                value={maxDosePerIntake}
                onChange={(e) => setMaxDosePerIntake(e.target.value)}
                className={cn('w-32', elderlyMode && 'text-lg h-12')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDosePerDay" className={cn(elderlyMode && 'text-lg')}>
                Max per day (optional)
              </Label>
              <Input
                id="maxDosePerDay"
                type="number"
                min="1"
                value={maxDosePerDay}
                onChange={(e) => setMaxDosePerDay(e.target.value)}
                className={cn('w-32', elderlyMode && 'text-lg h-12')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        className={cn(
          'w-full gradient-primary shadow-glow',
          elderlyMode && 'h-16 text-xl'
        )}
      >
        <Save size={elderlyMode ? 24 : 20} className="mr-2" />
        {existingMedicine ? 'Update Medicine' : 'Add Medicine'}
      </Button>
    </form>
  );
};
