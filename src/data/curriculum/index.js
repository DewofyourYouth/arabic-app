import basics from './level-1-basics.json';
import numbers from './level-1-numbers.json';
import colors from './level-1-colors.json';
import family from './level-1-family.json';
import food from './level-1-food.json';
import verbsEssentials from './level-1-verbs-essentials.json';
import verbsExpanded from './level-1-verbs-expanded.json';
import verbsData from './level-1-verbs-common.json';
import clozePhrases from './cloze-phrases.json';

import l1Grammar from './level-1-grammar.json';
import l2Grammar from './level-2-grammar.json';
import l3Grammar from './level-3-grammar.json';
import l4Grammar from './level-4-grammar.json';

import activeParticiples from './level-2-active-participles.json';

// Helper to apply level
const withLevel = (data, level) => data.map(item => ({ ...item, level }));

// Define Curriculum Levels

// Phase 1: The Foundation (A1)
const level1Content = [
  ...basics,
  ...numbers,
  ...colors,
  ...family,
  ...food,
  ...withLevel(verbsEssentials, 1),
  ...l1Grammar
];

// Phase 2: The Routine (A1/A2 Bridge)
const level2Content = [
  ...withLevel(verbsExpanded, 2),
  ...withLevel(activeParticiples, 2),
  ...l2Grammar
];

// Phase 3: The Conversationalist (B1)
const level3Content = [
  ...l3Grammar
];

// Phase 4: Fluency (B2)
const level4Content = [
  ...l4Grammar
];

const combinedCurriculum = [
  ...level1Content,
  ...level2Content,
  ...level3Content,
  ...level4Content
];

export const levels = [
  {
    id: 1,
    title: "Phase 1: The Foundation",
    description: "Survival basics, introductions, and simple sentences.",
    content: level1Content
  },
  {
    id: 2,
    title: "Phase 2: The Routine",
    description: "Daily life, past events, and future plans.",
    content: level2Content
  },
  {
    id: 3,
    title: "Phase 3: The Conversationalist",
    description: "Expressing opinions, stories, and complex interactions.",
    content: level3Content
  },
  {
    id: 4,
    title: "Phase 4: Fluency",
    description: "Abstract concepts, media, and advanced structures.",
    content: level4Content
  }
];

export default combinedCurriculum;
export { verbsData, verbsEssentials, verbsExpanded, clozePhrases };
