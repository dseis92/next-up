"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./button";
import { useEffect } from "react";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
}: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-[var(--radius-lg)] bg-surface-elevated p-6 shadow-2xl ring-1 ring-border"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-md p-1 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Title */}
              <h2 className="mb-2 pr-8 text-heading text-foreground">{title}</h2>

              {/* Description */}
              {description && (
                <p className="mb-4 text-sm text-foreground-secondary">
                  {description}
                </p>
              )}

              {/* Content */}
              {children && <div className="mb-6">{children}</div>}

              {/* Actions */}
              {actions && <div className="flex gap-3">{actions}</div>}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "destructive";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
