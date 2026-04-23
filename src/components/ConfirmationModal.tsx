import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
}

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = 'Confirm',
  variant = 'primary'
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest">{title}</h2>
            </div>
            
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6 leading-relaxed">
              {message}
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-2 rounded font-black text-[10px] uppercase tracking-widest transition-all ${
                  variant === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-900 hover:bg-black text-white'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
