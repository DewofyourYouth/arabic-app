/**
 * Spaced Repetition System (SRS) Utilities
 * Implements a simplified SuperMemo-2 (SM-2) algorithm.
 * 
 * Card Data Structure:
 * {
 *   id: string,
 *   ...content,
 *   srs: {
 *     interval: number (days),
 *     repetition: number (count),
 *     ef: number (easiness factor, default 2.5),
 *     dueDate: timestamp (ISO string)
 *   }
 * }
 */

export const INITIAL_SRS_STATE = {
  interval: 0,
  repetition: 0,
  ef: 2.5,
  dueDate: new Date().toISOString()
};

/**
 * Calculate new SRS state based on performance rating.
 * @param {Object} currentSrs - Current SRS state of the card
 * @param {number} grade - Performance rating (0-2: Fail, 3: Hard, 4: Good, 5: Easy)
 * In our simple UI: "Hard" maps to 3, "Easy" maps to 5.
 */
export const calculateSrs = (currentSrs = INITIAL_SRS_STATE, grade) => {
  let { interval, repetition, ef } = currentSrs;

  if (grade >= 3) {
    // Correct response
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
    repetition += 1;
  } else {
    // Incorrect response - Reset stats
    repetition = 0;
    interval = 1;
  }

  // Update Easiness Factor (EF) - Standard SM-2 formula
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  ef = ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (ef < 1.3) ef = 1.3;

  // Calculate Due Date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);

  return {
    interval,
    repetition,
    ef,
    dueDate: dueDate.toISOString()
  };
};

/**
 * Filter cards that are due for review.
 * @param {Array} cards - All cards
 * @returns {Array} - Cards due today or earlier
 */
export const getDueCards = (cards) => {
  const now = new Date();
  return cards.filter(card => {
    if (!card.srs || !card.srs.dueDate) return true; // New cards are due
    return new Date(card.srs.dueDate) <= now;
  });
};
