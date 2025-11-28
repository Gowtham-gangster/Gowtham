import { cn } from '@/lib/utils';
import { PillColor, MedicineForm } from '@/types';
import { Pill, Droplet, Syringe, CircleDot } from 'lucide-react';

interface PillTagProps {
  color: PillColor;
  form: MedicineForm;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorClasses: Record<PillColor, string> = {
  red: 'bg-pill-red',
  blue: 'bg-pill-blue',
  green: 'bg-pill-green',
  yellow: 'bg-pill-yellow',
  purple: 'bg-pill-purple',
  orange: 'bg-pill-orange',
  pink: 'bg-pill-pink',
  teal: 'bg-pill-teal'
};

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base'
};

const iconSizes = {
  sm: 14,
  md: 18,
  lg: 24
};

const FormIcon = ({ form, size }: { form: MedicineForm; size: number }) => {
  switch (form) {
    case 'tablet':
      return <Pill size={size} />;
    case 'capsule':
      return <CircleDot size={size} />;
    case 'liquid':
      return <Droplet size={size} />;
    case 'injection':
      return <Syringe size={size} />;
    default:
      return <Pill size={size} />;
  }
};

export const PillTag = ({ color, form, name, size = 'md', className }: PillTagProps) => {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-primary-foreground font-semibold shadow-soft',
        colorClasses[color],
        sizeClasses[size],
        className
      )}
      title={name}
    >
      <FormIcon form={form} size={iconSizes[size]} />
    </div>
  );
};
