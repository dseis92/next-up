"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./button";

export interface ToastProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
  visible: boolean;
}

export function Toast({ message, action, onClose, visible }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:bottom-8 md:left-auto md:right-8 md:w-auto md:min-w-[320px]"
        >
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-surface-elevated p-4 shadow-lg ring-1 ring-border">
            <p className="flex-1 text-sm font-medium text-foreground">
              {message}
            </p>
            {action && (
              <Button variant="ghost" size="sm" onClick={action.onClick}>
                {action.label}
              </Button>
            )}
            <button
              onClick={onClose}
              className="shrink-0 rounded-md p-1 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
