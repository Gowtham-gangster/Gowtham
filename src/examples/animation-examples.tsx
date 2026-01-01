/**
 * Animation Examples
 * 
 * This file demonstrates how to use the new animation features
 * implemented in task 10: Add animations and transitions
 * 
 * Requirements covered:
 * - 13.1: Page transitions (200ms fade-in)
 * - 13.2: Hover and interaction animations
 * - 13.3: Modal animations (slide-up with backdrop fade)
 * - 13.4: List update animations (slide and fade)
 * - 13.5: Skeleton loaders that pulse smoothly
 */

import { ButtonEnhanced } from '@/components/ui/button-enhanced';
import { CardEnhanced } from '@/components/ui/card-enhanced';
import { 
  MedicineCardSkeleton, 
  DashboardSkeleton, 
  ListSkeleton,
  FormSkeleton,
  TableSkeleton 
} from '@/components/ui/loading-states';
import { ListItemTransition } from '@/components/ui/page-transition';
import { hoverAnimations, pulseAnimations, combineAnimations } from '@/lib/animation-utils';

/**
 * Example 1: Page Transitions
 * 
 * Page transitions are automatically applied when using ProtectedRoute or PublicRoute
 * in App.tsx. All page navigations will have a smooth 200ms fade-in effect.
 */

/**
 * Example 2: Button Hover Animations
 * 
 * Buttons now have built-in hover and press animations:
 * - hover:scale-[1.02] - Slight scale up on hover
 * - active:scale-95 - Scale down on press
 * - hover:shadow-glow - Glow effect on hover
 */
export const ButtonAnimationExample = () => (
  <div className="space-y-4">
    <ButtonEnhanced variant="primary">
      Hover me for scale + glow
    </ButtonEnhanced>
    
    <ButtonEnhanced variant="outline">
      Click me for press animation
    </ButtonEnhanced>
  </div>
);

/**
 * Example 3: Card Hover Animations
 * 
 * Cards with hover prop enabled have lift effect:
 * - hover:scale-[1.02] - Slight scale up
 * - hover:-translate-y-1 - Lift up slightly
 * - hover:shadow-glow - Glow effect
 */
export const CardAnimationExample = () => (
  <CardEnhanced hover variant="glass" padding="lg">
    <h3 className="text-xl font-bold mb-2">Hover over me</h3>
    <p className="text-gray-400">I'll lift up and glow!</p>
  </CardEnhanced>
);

/**
 * Example 4: List Item Animations
 * 
 * Use ListItemTransition for smooth list updates with stagger effect
 */
export const ListAnimationExample = () => {
  const items = ['Item 1', 'Item 2', 'Item 3'];
  
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <ListItemTransition key={item} index={index}>
          <div className="p-4 glass rounded-lg">
            {item}
          </div>
        </ListItemTransition>
      ))}
    </div>
  );
};

/**
 * Example 5: Pulsing Animations for Urgent Items
 * 
 * Use animation utility classes for urgent items
 */
export const PulsingAnimationExample = () => (
  <div className="space-y-4">
    {/* Soft pulse (opacity) */}
    <div className={pulseAnimations.soft}>
      <CardEnhanced variant="glass" padding="md">
        Soft pulsing opacity
      </CardEnhanced>
    </div>
    
    {/* Glow pulse (shadow) */}
    <div className={pulseAnimations.glow}>
      <CardEnhanced variant="glass" padding="md">
        Pulsing glow effect
      </CardEnhanced>
    </div>
    
    {/* Border pulse */}
    <div className={pulseAnimations.border}>
      <CardEnhanced variant="bordered" padding="md">
        Pulsing border (for doses due soon)
      </CardEnhanced>
    </div>
  </div>
);

/**
 * Example 6: Skeleton Loaders
 * 
 * Use skeleton loaders that match your content structure
 */
export const SkeletonLoaderExample = () => (
  <div className="space-y-8">
    {/* Medicine card skeleton */}
    <div>
      <h3 className="text-lg font-semibold mb-4">Medicine Card Loading</h3>
      <MedicineCardSkeleton />
    </div>
    
    {/* Dashboard skeleton */}
    <div>
      <h3 className="text-lg font-semibold mb-4">Dashboard Loading</h3>
      <DashboardSkeleton />
    </div>
    
    {/* List skeleton */}
    <div>
      <h3 className="text-lg font-semibold mb-4">List Loading</h3>
      <ListSkeleton items={3} />
    </div>
    
    {/* Form skeleton */}
    <div>
      <h3 className="text-lg font-semibold mb-4">Form Loading</h3>
      <FormSkeleton fields={3} />
    </div>
    
    {/* Table skeleton */}
    <div>
      <h3 className="text-lg font-semibold mb-4">Table Loading</h3>
      <TableSkeleton rows={3} columns={4} />
    </div>
  </div>
);

/**
 * Example 7: Combining Animations
 * 
 * Use combineAnimations helper to combine multiple animation classes
 */
export const CombinedAnimationExample = () => (
  <div 
    className={combineAnimations(
      hoverAnimations.scale,
      hoverAnimations.glow,
      'cursor-pointer'
    )}
  >
    <CardEnhanced variant="glass" padding="lg">
      <h3 className="text-xl font-bold mb-2">Combined Animations</h3>
      <p className="text-gray-400">Scale + Glow on hover</p>
    </CardEnhanced>
  </div>
);

/**
 * Example 8: Custom Animation Delays
 * 
 * Use getStaggerDelay for staggered animations
 */
export const StaggeredAnimationExample = () => {
  const items = ['First', 'Second', 'Third', 'Fourth'];
  
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div 
          key={item}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardEnhanced variant="glass" padding="md">
            {item} - Delayed by {index * 100}ms
          </CardEnhanced>
        </div>
      ))}
    </div>
  );
};

/**
 * Usage in Real Components:
 * 
 * 1. Page Transitions: Automatically applied via App.tsx routing
 * 
 * 2. Loading States: Replace content with skeleton loaders
 *    {isLoading ? <MedicineCardSkeleton /> : <MedicineCard medicine={medicine} />}
 * 
 * 3. Hover Effects: Use hover prop on CardEnhanced or add utility classes
 *    <CardEnhanced hover>...</CardEnhanced>
 * 
 * 4. Urgent Items: Add pulsing animations to medicine cards
 *    <div className={isDueSoon ? pulseAnimations.border : ''}>...</div>
 * 
 * 5. List Updates: Wrap list items with ListItemTransition
 *    {items.map((item, i) => (
 *      <ListItemTransition key={item.id} index={i}>
 *        <ItemComponent item={item} />
 *      </ListItemTransition>
 *    ))}
 */
