import fibonacci from './fibonacci';

export type VotingScaleType = 'fibonacci' | 'tshirt' | 'powers-of-2' | 'linear' | 'custom';

export interface VotingScale {
  type: VotingScaleType;
  label: string;
  values: (string | number)[];
  customValues?: string; // For custom scale, comma-separated
}

/**
 * Get voting scale values based on type
 */
export const getScaleValues = (scale: VotingScale): (string | number)[] => {
  switch (scale.type) {
    case 'fibonacci':
      // Extended Fibonacci: [1, 2, 3, 5, 8, 13, 21, 34, 55]
      return [...new Set(fibonacci(10))].filter(v => v > 0);

    case 'tshirt':
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    case 'powers-of-2':
      return [1, 2, 4, 8, 16, 32, 64];

    case 'linear':
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    case 'custom':
      if (scale.customValues) {
        // Parse comma-separated values, trim whitespace, filter empty
        return scale.customValues
          .split(',')
          .map(v => v.trim())
          .filter(v => v !== '')
          .map(v => {
            // Try to parse as number, otherwise keep as string
            const num = parseFloat(v);
            return isNaN(num) ? v : num;
          });
      }
      return [1, 2, 3, 5, 8]; // Fallback

    default:
      return [...new Set(fibonacci(10))].filter(v => v > 0);
  }
};

/**
 * Default voting scales
 */
export const DEFAULT_SCALES: Record<VotingScaleType, VotingScale> = {
  fibonacci: {
    type: 'fibonacci',
    label: 'Fibonacci (1, 2, 3, 5, 8, 13, 21, 34, 55)',
    values: [],
  },
  tshirt: {
    type: 'tshirt',
    label: 'T-Shirt Sizes (XS, S, M, L, XL, XXL)',
    values: [],
  },
  'powers-of-2': {
    type: 'powers-of-2',
    label: 'Powers of 2 (1, 2, 4, 8, 16, 32, 64)',
    values: [],
  },
  linear: {
    type: 'linear',
    label: 'Linear (1-10)',
    values: [],
  },
  custom: {
    type: 'custom',
    label: 'Custom (comma-separated)',
    values: [],
    customValues: '',
  },
};

/**
 * Convert a vote value to its numeric representation for calculations
 * T-shirt sizes map to Fibonacci-like values
 */
export const voteToNumber = (vote: string | number | null): number | null => {
  if (vote === null || vote === undefined) return null;

  if (typeof vote === 'number') return vote;

  // Map t-shirt sizes to numbers
  const tshirtMap: Record<string, number> = {
    'XS': 1,
    'S': 2,
    'M': 5,
    'L': 8,
    'XL': 13,
    'XXL': 21,
  };

  if (vote in tshirtMap) {
    return tshirtMap[vote];
  }

  // Try to parse as number
  const num = parseFloat(vote);
  return isNaN(num) ? null : num;
};

/**
 * Get default voting scale (Fibonacci)
 */
export const getDefaultScale = (): VotingScale => {
  return {
    ...DEFAULT_SCALES.fibonacci,
    values: getScaleValues(DEFAULT_SCALES.fibonacci),
  };
};
