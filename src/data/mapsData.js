import mapLevant from '../assets/map_levant_stylized.png';

export const MAPS = {
  levant: {
    id: 'levant',
    name: 'The Levant',
    hebrewName: 'הלבנט',
    image: mapLevant,
    // List all city IDs that should appear on this map
    cities: [
      'wadi_rum', 'eilat', 'aqaba', 'petra', 'beersheba', 'jerash', 
      'beirut', 'tripoli', 'sidon', 'tyre', 'masada', 'amman', 
      'hebron', 'haifa', 'tiberias', 'jericho', 'nablus', 'ramallah', 
      'akko', 'suwayda', 'byblos', 'damascus', 'palmyra', 'homs', 
      'baalbek', 'aleppo', 'jerusalem', 'madaba', 'karak'
    ]
  }
};
