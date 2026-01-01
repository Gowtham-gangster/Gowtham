import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText, Upload, Camera, Scan } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';

/**
 * PrescriptionsEmptyState - Enhanced empty state for prescriptions list
 * Includes helpful guidance for uploading prescriptions
 * Validates: Requirements 14.1, 14.2
 */
export const PrescriptionsEmptyState = () => {
  const navigate = useNavigate();
  const { elderlyMode } = useStore();

  const uploadTips = [
    {
      icon: <Camera className="w-5 h-5" />,
      title: "Take a Photo",
      description: "Snap a clear picture of your prescription document"
    },
    {
      icon: <Scan className="w-5 h-5" />,
      title: "Auto-Extract",
      description: "Our AI automatically extracts medication details"
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Review & Save",
      description: "Verify the details and add to your medicine list"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Main Empty State */}
      <EmptyState
        icon={<FileText className="w-8 h-8" />}
        title="No prescriptions uploaded"
        description="Upload a photo of your prescription to automatically extract medication details and create reminders."
        action={{
          label: "Upload Your First Prescription",
          onClick: () => navigate('/prescriptions/upload'),
          icon: <Upload className="w-5 h-5" />
        }}
      />

      {/* Upload Tips */}
      <div className="max-w-3xl mx-auto">
        <h3 className={cn(
          "text-center text-lg font-semibold text-white mb-6",
          elderlyMode && "text-xl"
        )}>
          How prescription scanning works
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {uploadTips.map((tip, index) => (
            <div
              key={index}
              className={cn(
                "glass backdrop-blur-md bg-background-secondary/50 border border-white/10",
                "rounded-xl p-6 text-center transition-all duration-200",
                "hover:scale-105 hover:shadow-glow hover:border-violet-500/30"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-cyan-600/20 flex items-center justify-center mx-auto mb-3 text-cyan-400">
                {tip.icon}
              </div>
              <h4 className={cn(
                "font-semibold text-white mb-2",
                elderlyMode && "text-lg"
              )}>
                {tip.title}
              </h4>
              <p className={cn(
                "text-sm text-gray-400",
                elderlyMode && "text-base"
              )}>
                {tip.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Help Text */}
        <div className={cn(
          "mt-8 text-center text-sm text-gray-400",
          elderlyMode && "text-base"
        )}>
          <p>
            💡 <strong className="text-white">Pro Tip:</strong> Make sure your prescription is well-lit and all text is clearly visible for best results
          </p>
        </div>
      </div>
    </div>
  );
};

PrescriptionsEmptyState.displayName = "PrescriptionsEmptyState";
