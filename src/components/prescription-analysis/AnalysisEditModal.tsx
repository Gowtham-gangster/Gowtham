import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { cn } from '@/lib/utils';
import { Save, X, Trash2 } from 'lucide-react';
import { AnalysisResult } from '@/types/prescription-analysis';
import { chronicDiseases } from '@/data/chronic-diseases';
import { Checkbox } from '@/components/ui/checkbox';

interface AnalysisEditModalProps {
  result: AnalysisResult;
  open: boolean;
  onSave: (edited: AnalysisResult) => void;
  onCancel: () => void;
  elderlyMode: boolean;
}

export const AnalysisEditModal = ({
  result,
  open,
  onSave,
  onCancel,
  elderlyMode,
}: AnalysisEditModalProps) => {
  const [editedResult, setEditedResult] = useState<AnalysisResult>(result);

  const handleSave = () => {
    onSave(editedResult);
  };

  const handleRemoveDisease = (diseaseId: string) => {
    setEditedResult({
      ...editedResult,
      detectedDiseases: editedResult.detectedDiseases.filter(
        (d) => d.diseaseId !== diseaseId
      ),
    });
  };

  const handleAddDisease = (diseaseId: string) => {
    const disease = chronicDiseases.find((d) => d.id === diseaseId);
    if (!disease) return;

    setEditedResult({
      ...editedResult,
      detectedDiseases: [
        ...editedResult.detectedDiseases,
        {
          diseaseId: disease.id,
          diseaseName: disease.name,
          confidence: 1.0,
          matchedTerms: ['manually added'],
          context: 'Added by user',
          source: 'explicit',
          relatedMedications: [],
        },
      ],
    });
  };

  const handleRemoveMedication = (index: number) => {
    setEditedResult({
      ...editedResult,
      parsedMedications: editedResult.parsedMedications.filter(
        (_, i) => i !== index
      ),
    });
  };

  const handleUpdateMedication = (index: number, field: string, value: any) => {
    const updated = [...editedResult.parsedMedications];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setEditedResult({
      ...editedResult,
      parsedMedications: updated,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className={cn('max-w-4xl max-h-[80vh] overflow-y-auto', elderlyMode && 'text-lg')}>
        <DialogHeader>
          <DialogTitle className={cn(elderlyMode && 'text-2xl')}>
            Edit Analysis Results
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Diseases Section */}
          <div className="space-y-3">
            <h3 className={cn('font-semibold', elderlyMode && 'text-xl')}>
              Detected Diseases
            </h3>
            
            <div className="space-y-2">
              {editedResult.detectedDiseases.map((disease) => (
                <div
                  key={disease.diseaseId}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                >
                  <span>{disease.diseaseName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDisease(disease.diseaseId)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Select onValueChange={handleAddDisease}>
                <SelectTrigger>
                  <SelectValue placeholder="Add disease..." />
                </SelectTrigger>
                <SelectContent>
                  {chronicDiseases
                    .filter(
                      (d) =>
                        !editedResult.detectedDiseases.some(
                          (ed) => ed.diseaseId === d.id
                        )
                    )
                    .map((disease) => (
                      <SelectItem key={disease.id} value={disease.id}>
                        {disease.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Medications Section */}
          <div className="space-y-3">
            <h3 className={cn('font-semibold', elderlyMode && 'text-xl')}>
              Detected Medications
            </h3>
            
            <div className="space-y-4">
              {editedResult.parsedMedications.map((med, index) => (
                <div
                  key={index}
                  className="p-4 bg-muted/20 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Label>Medication {index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMedication(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={med.name}
                        onChange={(e) =>
                          handleUpdateMedication(index, 'name', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Strength</Label>
                      <Input
                        value={med.strength}
                        onChange={(e) =>
                          handleUpdateMedication(index, 'strength', e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Instructions</Label>
                    <Textarea
                      value={med.instructions}
                      onChange={(e) =>
                        handleUpdateMedication(index, 'instructions', e.target.value)
                      }
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            <X size={16} className="mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="gradient-primary">
            <Save size={16} className="mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
