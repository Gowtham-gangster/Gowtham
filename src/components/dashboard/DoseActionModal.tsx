import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, SkipForward } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

interface DoseActionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
  medicineName: string;
  action: 'TAKEN' | 'SKIPPED';
  warningMessage?: string;
}

const quickNotes = [
  'Felt fine',
  'Slight nausea',
  'Headache',
  'Took with food',
  'Dizzy',
  'No side effects'
];

export const DoseActionModal = ({
  open,
  onClose,
  onConfirm,
  medicineName,
  action,
  warningMessage
}: DoseActionModalProps) => {
  const [notes, setNotes] = useState('');
  const { elderlyMode } = useStore();

  const handleConfirm = () => {
    onConfirm(notes || undefined);
    setNotes('');
  };

  const handleQuickNote = (note: string) => {
    setNotes(prev => prev ? `${prev}, ${note}` : note);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn('sm:max-w-md', elderlyMode && 'sm:max-w-lg')}>
        <DialogHeader>
          <DialogTitle className={cn('flex items-center gap-2', elderlyMode && 'text-2xl')}>
            {action === 'TAKEN' ? (
              <>
                <div className="w-10 h-10 rounded-full gradient-success flex items-center justify-center">
                  <Check className="text-success-foreground" size={24} />
                </div>
                Mark as Taken
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <SkipForward className="text-muted-foreground" size={24} />
                </div>
                Skip Dose
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {warningMessage && (
            <div className="p-3 rounded-lg border-2 border-warning bg-warning/10 text-warning">
              {warningMessage}
            </div>
          )}
          <p className={cn('text-muted-foreground', elderlyMode && 'text-lg')}>
            {action === 'TAKEN' 
              ? `Confirm that you've taken ${medicineName}`
              : `Skip this dose of ${medicineName}?`
            }
          </p>

          <div className="space-y-2">
            <Label className={cn(elderlyMode && 'text-lg')}>
              Add notes (optional)
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {quickNotes.map((note) => (
                <Button
                  key={note}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickNote(note)}
                  className={cn(
                    'text-xs',
                    elderlyMode && 'text-sm h-10'
                  )}
                >
                  {note}
                </Button>
              ))}
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling? Any side effects?"
              className={cn(elderlyMode && 'text-lg min-h-[100px]')}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className={cn(elderlyMode && 'text-lg h-12')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className={cn(
              action === 'TAKEN' ? 'gradient-success' : '',
              elderlyMode && 'text-lg h-12 px-8'
            )}
          >
            {action === 'TAKEN' ? 'Confirm Taken' : 'Skip Dose'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
