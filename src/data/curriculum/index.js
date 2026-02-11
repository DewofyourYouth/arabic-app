import basics from './level-1-basics.json';
import family from './level-1-family.json';
import food from './level-1-food.json';
import colors from './level-1-colors.json';
import numbers from './level-1-numbers.json';
import verbs from './level-1-verbs-essentials.json';
import verbsCommon from './level-1-verbs-common.json';
import verbsData from './verbs.json';
import clozePhrases from './cloze-phrases.json';

const combinedCurriculum = [
  ...basics,
  ...family,
  ...food,
  ...colors,
  ...numbers,
  ...verbs
];

export default combinedCurriculum;
export { verbsData, verbsCommon, clozePhrases };
