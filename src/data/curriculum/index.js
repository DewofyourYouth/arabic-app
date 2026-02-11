import basics from './level-1-basics.json';
import numbers from './level-1-numbers.json';
import colors from './level-1-colors.json';
import family from './level-1-family.json';
import food from './level-1-food.json';
import verbsEssentials from './level-1-verbs-essentials.json';
import verbsExpanded from './level-1-verbs-expanded.json';
import verbsData from './level-1-verbs-common.json';
import clozePhrases from './cloze-phrases.json';

import activeParticiples from './level-2-active-participles.json';

// Helper to apply level
const withLevel = (data, level) => data.map(item => ({ ...item, level }));

// Define Curriculum Levels
// Level 1: Fundamentals (Greetings, Numbers, Colors, Family, Food, Essential Verbs)
const level1Content = [
  ...basics,
  ...numbers,
  ...colors,
  ...family,
  ...food,
  ...withLevel(verbsEssentials, 1) // Ensure Level 1
];

// Level 2: Verbs & Grammar (Expanded Verbs, More complex structures)
// Note: verbsExpanded was originally level 1 in JSON, we override to Level 2
const level2Content = [
  ...withLevel(verbsExpanded, 2)
];

// Level 3: Active Participles
// Note: activeParticiples was originally level 2 in JSON, we override to Level 3
const level3Content = [
  ...withLevel(activeParticiples, 3)
];

const combinedCurriculum = [
  ...level1Content,
  ...level2Content,
  ...level3Content
];

export const levels = [
  {
    id: 1,
    title: "Level 1: Fundamentals",
    description: "Basic greetings, numbers, family, and essential verbs.",
    content: level1Content
  },
  {
    id: 2,
    title: "Level 2: Verbs & Grammar",
    description: "Expanded verb conjugations and sentence building.",
    content: level2Content
  },
  {
    id: 3,
    title: "Level 3: Active Participles",
    description: "Mastering the active participle form.",
    content: level3Content
  }
];

export default combinedCurriculum;
export { verbsData, verbsEssentials, verbsExpanded, clozePhrases };
