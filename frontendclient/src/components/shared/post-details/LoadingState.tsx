// src/components/post-details/LoadingState.tsx
import { motion } from 'framer-motion';

export function LoadingState() {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center">
      <div className="flex items-center justify-center space-x-2">
        <motion.div className="h-3 w-3 bg-red-500 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} />
        <motion.div className="h-3 w-3 bg-red-500 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
        <motion.div className="h-3 w-3 bg-red-500 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
      </div>
    </div>
  );
}