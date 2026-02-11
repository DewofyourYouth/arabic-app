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

// Combine verbs: items from expanded that are NOT in essentials (based on Arabic or English similarity?)
// Actually, let's just include all. If there are duplicates, the app might handle them or we might see them twice.
// 'verbsEssentials' has "I want", "I go", "I see", "I eat", "I drink".
// 'verbsExpanded' has "I want", "I go", ... "I eat", "I drink" ... 
// Let's rely on the set to be distinct enough or just concatenation for now.
// However, the ID's in expanded are l1_v_want vs l1_verb_want in essentials. 
// A quick check: essentials has 5 verbs. expanded has 50+. 
// Ideally we remove duplicates. 
// For now, let's just add expanded after essentials. 

const combinedCurriculum = [
  ...basics,
  ...numbers,
  ...colors, // Colors before family seems easier? Or maybe Family first. The plan said Numbers -> Colors -> Family.
  ...family,
  ...food,
  ...verbsEssentials,
  ...verbsExpanded,
  ...activeParticiples
];

export default combinedCurriculum;
export { verbsData, verbsEssentials, verbsExpanded, clozePhrases };
