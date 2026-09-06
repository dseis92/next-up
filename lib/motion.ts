/**
 * NextUp Motion System
 * Consistent animation timing and spring configurations
 */

export const motion = {
  // Duration in seconds
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
} as const;

export const spring = {
  // Responsive spring for UI interactions
  responsive: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
  },

  // Smooth spring for page transitions
  smooth: {
    type: "spring" as const,
    stiffness: 300,
    damping: 35,
  },

  // Bouncy spring for playful interactions
  bouncy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 25,
  },

  // Gentle spring for subtle movements
  gentle: {
    type: "spring" as const,
    stiffness: 200,
    damping: 40,
  },
} as const;

export const easing = {
  // Default easing curves
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
} as const;

// Common animation variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const slideLeft = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const slideRight = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};
