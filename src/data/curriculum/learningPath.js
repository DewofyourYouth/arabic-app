import basics from './level-1-basics.json';
import numbers from './level-1-numbers.json';
import colors from './level-1-colors.json';
import family from './level-1-family.json';
import food from './level-1-food.json';
import verbsEssentials from './level-1-verbs-essentials.json';
import verbsExpanded from './level-1-verbs-expanded.json';
import verbsData from './level-1-verbs-common.json';
import l1Grammar from './level-1-grammar.json';

// New Topics
import ordering from './topics-ordering.json';
import shopping from './topics-shopping.json';
import directions from './topics-directions.json';
import household from './topics-household.json';
import feelings from './topics-feelings.json';
import storytelling from './topics-storytelling.json';
import weather from './topics-weather.json';
import hobbies from './topics-hobbies.json';
import health from './topics-health.json';
import work from './topics-work.json';

import time from './topics-time.json';
import places from './topics-places.json';

// Helper to apply level/location metadata to content
const withLocation = (data, locationId) => data.map(item => ({ ...item, locationId }));

export const learningPath = [
  // --- JORDAN (South to North) ---
  {
    id: 'wadi_rum',
    name: 'Wadi Rum',
    label: 'Start Here',
    description: 'Start your journey in the desert with essential greetings and pronouns.',
    minXP: 0,
    content: [
      ...withLocation(basics, 'wadi_rum'),
    ]
  },
  {
    id: 'eilat',
    name: 'Eilat',
    label: 'Red Sea Port',
    description: 'Learn to describe the world around you with colors and family.',
    minXP: 100, 
    content: [
      ...withLocation(colors, 'eilat'),
      ...withLocation(family, 'eilat')
    ]
  },
  {
    id: 'aqaba',
    name: 'Aqaba',
    label: 'Gateway',
    description: 'Master numbers and essential food vocabulary by the sea.',
    minXP: 250,
    content: [
      ...withLocation(numbers, 'aqaba'),
      ...withLocation(food, 'aqaba')
    ]
  },
  {
    "id": "madaba",
    "name": "Madaba",
    "label": "City of Mosaics",
    "description": "Learn to tell time and days while exploring ancient maps.",
    "minXP": 450,
    "content": [
        ...withLocation(time, "madaba")
    ]
  },
  {
    id: 'petra',
    name: 'Petra',
    label: 'The Treasury',
    description: 'Unlock the power of verbs in the ancient rose city.',
    minXP: 600,
    content: [
      ...withLocation(verbsEssentials, 'petra'),
      ...withLocation(l1Grammar, 'petra')
    ]
  },
  {
      id: 'amman',
      name: 'Amman',
      label: 'The Capital',
      description: 'Navigate city life: Places, cafes, and shopping.',
      minXP: 850,
      content: [
          ...withLocation(places, 'amman'),
          ...withLocation(ordering, 'amman'),
          ...withLocation(shopping, 'amman')
      ]
  },
  {
      id: 'jerash',
      name: 'Jerash',
      label: 'Roman Ruins',
      description: 'Learn to ask for directions while exploring endless columns.',
      minXP: 1100,
      content: [
          ...withLocation(directions, 'jerash'),
          ...withLocation(verbsExpanded.slice(0, 20), 'jerash') 
      ]
  },

  // --- WEST BANK (Crossing over) ---
   {
      id: 'jericho',
      name: 'Jericho',
      label: 'Ancient Oasis',
      description: 'Talk about the weather and seasons in the world\'s oldest city.',
      minXP: 1250,
      content: [
          ...withLocation(weather, 'jericho')
      ]
  },
  {
      id: 'hebron',
      name: 'Hebron',
      label: 'Ancient City',
      description: 'Discuss the home, furniture, and family life.',
      minXP: 1400,
      content: [
          ...withLocation(household, 'hebron')
      ]
  },
  {
      id: 'nablus',
      name: 'Nablus',
      label: 'Olive Soap',
      description: 'Learn about health, the body, and wellness.',
      minXP: 1550,
      content: [
          ...withLocation(health, 'nablus')
      ]
  },
  {
      id: 'ramallah',
      name: 'Ramallah',
      label: 'Cultural Hub',
      description: 'Express feelings and share your opinions.',
      minXP: 1700,
      content: [
          ...withLocation(feelings, 'ramallah')
      ]
  },

  // --- COAST & NORTH ---
  {
      id: 'haifa',
      name: 'Haifa',
      label: 'Bahai Gardens',
      description: 'Discuss hobbies, leisure, and free time.',
      minXP: 1850,
      content: [
          ...withLocation(hobbies, 'haifa')
      ]
  },
  {
      id: 'beirut',
      name: 'Beirut',
      label: 'Coastal Gem',
      description: 'Tell stories with timing and sequence.',
      minXP: 2000,
      content: [
          ...withLocation(storytelling, 'beirut')
      ]
  },

  // --- SYRIA (Inland/North) ---
  {
      id: 'damascus',
      name: 'Damascus',
      label: 'City of Jasmine',
      description: 'Talk about your profession, studies, and work life.',
      minXP: 2150,
      content: [
         ...withLocation(work, 'damascus')
      ]
  },
  {
      id: 'homs',
      name: 'Homs',
      label: 'Historic City',
      description: 'Review core grammar and connectors on the road north.',
      minXP: 2150,
      content: [
          ...withLocation(basics.slice(0,5), 'homs') // Placeholder/Review
      ]
  },
  {
      id: 'aleppo',
      name: 'Aleppo',
      label: 'The Citadel',
      description: 'Advanced Verbs and conjugation challenges.',
      minXP: 2300,
      content: [
           ...withLocation(verbsExpanded.slice(20), 'aleppo')
      ]
  }
];

// Helper to get all content flat for search/indexing
export const getAllContent = () => {
    return learningPath.flatMap(loc => loc.content);
};
