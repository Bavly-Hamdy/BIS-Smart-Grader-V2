import React from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollToTopProps {
  isVisible: boolean;
  onClick: () => void;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ isVisible, onClick }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={onClick}
          className="fixed bottom-8 right-8 z-40 p-3 rounded-full bg-primary dark:bg-blue-600 text-white shadow-lg hover:shadow-primary/50 dark:hover:shadow-blue-900/50 hover:bg-primary-hover dark:hover:bg-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;