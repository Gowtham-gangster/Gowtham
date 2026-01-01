import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
}

/**
 * OptimizedImage component with lazy loading and blur-up effect
 * Automatically handles loading states and provides fallback support
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallback = '/placeholder.svg',
  className,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(fallback);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };
  }, [src]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-all duration-300',
          isLoading && 'blur-sm scale-105',
          !isLoading && 'blur-0 scale-100',
          className
        )}
        loading="lazy"
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
    </div>
  );
};
