import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * PageTransition component provides smooth fade-in transitions for page navigation
 * Requirements: 13.1, 13.3, 13.4
 * - Fade-in transitions (200ms) for page navigation
 * - Smooth modal open/close animations
 * - Slide and fade effects for list updates
 */
export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1], // cubic-bezier(0.4, 0, 0.2, 1)
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * ListItemTransition provides slide and fade effects for list item updates
 * Requirements: 13.4
 */
interface ListItemTransitionProps {
  children: ReactNode;
  index?: number;
}

export const ListItemTransition = ({ children, index = 0 }: ListItemTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{
        duration: 0.2,
        delay: index * 0.05, // Stagger effect
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * ModalTransition provides smooth modal open/close animations
 * Requirements: 13.3
 */
interface ModalTransitionProps {
  children: ReactNode;
  isOpen: boolean;
}

export const ModalTransition = ({ children, isOpen }: ModalTransitionProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
