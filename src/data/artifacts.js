import artifactWadiRum from '../assets/artifacts/wadi_rum.png';
import artifactPetra from '../assets/artifacts/petra.png';
import artifactJerusalem from '../assets/artifacts/jerusalem.png';
import artifactJericho from '../assets/artifacts/jericho.png';
import artifactAmman from '../assets/artifacts/amman.png';
import artifactBeerSheba from '../assets/artifacts/abrahamsWell.png';
import eilatArtifact from '../assets/artifacts/eilat.png';
import beirutArtifact from '../assets/artifacts/cedar.jpg';
import sidonArtifact from '../assets/artifacts/sidon.jpg';
import jerashArtifact from '../assets/artifacts/jerash.jpg';
import tyreArtifact from '../assets/artifacts/tyre.jpg';
import hebronArtifact from '../assets/artifacts/hebron.jpg';
import aqabaArtifact from '../assets/artifacts/aqaba.jpg';
import madabaArtifact from '../assets/artifacts/madaba.png';
import karakArtifact from '../assets/artifacts/karak.png';
import masadaArtifact from '../assets/artifacts/romanScroll.jpg';
import nablusSoapArtifact from '../assets/artifacts/nablus_soap.png';
import haifaArtifact from '../assets/artifacts/haifa.jpg';
import tiberiasArtifact from '../assets/artifacts/tiberias.jpg';
import suwaydaArtifact from '../assets/artifacts/assuwayada.jpg';
import byblosArtifact from '../assets/artifacts/byblos.jpg';
import homsArtifact from '../assets/artifacts/homs.jpg';
import palmyraArtifact from '../assets/artifacts/palmyra.jpg';
import baalbekArtifact from '../assets/artifacts/baalbek.jpg';
import aleppoArtifact from '../assets/artifacts/aleppo.jpg';
import akkoArtifact from '../assets/artifacts/akko.jpg';
import damascusArtifact from '../assets/artifacts/damascus.jpg';
import ramallahArtifact from '../assets/artifacts/ramallah.jpg';
import tripoliArtifact from '../assets/artifacts/tripoli.jpg';

export const CITIES = [
  {
    id: 'wadi_rum',
    name: 'Wadi Rum',
    label: 'Start Here',
    x: 60,
    y: 80,
    artifact: {
      image: artifactWadiRum,
      name: 'Dallah (Coffee Pot)',
      description: 'A symbol of hospitality. Always served with the right hand!'
    }
  },
  {
    id: 'eilat',
    name: 'Eilat',
    label: 'Red Sea Port',
    x: 40,
    y: 80,
    artifact: {
      image: eilatArtifact,
      name: 'Coral Reef',
      description: 'Beautiful underwater gardens of the Red Sea.'
    }
  },
  {
    id: 'aqaba',
    name: 'Aqaba',
    label: 'Red Sea Gateway',
    x: 45,
    y: 82,
    artifact: {
      image: aqabaArtifact,
      name: 'Coral Diving Mask',
      description: 'Gateway to Jordan\'s Red Sea coast.'
    }
  },
  {
    id: 'petra',
    name: 'Petra',
    label: 'The Treasury',
    x: 55,
    y: 65,
    artifact: {
      image: artifactPetra,
      name: 'Nabatean Coin',
      description: 'Ancient currency from the rose-red city.'
    }
  },
  { id: 'beersheba', name: 'Beer Sheba', label: 'Negev Capital', x: 35, y: 48, artifact: { image: artifactBeerSheba, name: 'Abraham\'s Well', description: 'Ancient well associated with the patriarch.' } },
  { id: 'jerash', name: 'Jerash', label: 'Roman Ruins', x: 70, y: 25, artifact: { image: jerashArtifact, name: 'Roman Column Fragment', description: 'Piece of the extensive Roman architecture.' } },
  { id: 'beirut', name: 'Beirut', label: 'Coastal Gem', x: 46, y: 8, artifact: { image: beirutArtifact, name: 'Cedar Tree', description: 'Symbol of Lebanon\'s resilience.' } },
  { id: 'tripoli', name: 'Tripoli', label: 'Northern Port', x: 47, y: 4, artifact: { image: tripoliArtifact, name: 'Crusader Citadel', description: 'Medieval fortress overlooking the sea.' } },
  { id: 'sidon', name: 'Sidon', label: 'Sea Castle', x: 45, y: 11, artifact: { image: sidonArtifact, name: 'Phoenician Harbor', description: 'Ancient trading port of the Phoenicians.' } },
  { id: 'tyre', name: 'Tyre', label: 'Purple Dye', x: 44, y: 14, artifact: { image: tyreArtifact, name: 'Royal Purple Shell', description: 'Source of the legendary Tyrian purple.' } },
  { id: 'masada', name: 'Masada', label: 'Desert Fortress', x: 48, y: 47, artifact: { image: masadaArtifact, name: 'Roman Scroll', description: 'Ancient texts preserved in the desert climate.' } },
  { id: 'amman', name: 'Amman', label: 'The Amphitheater', x: 70, y: 35, artifact: { image: artifactAmman, name: 'Roman Dagger', description: 'Relic from Philadelphia (ancient Amman).' } },
  { id: 'hebron', name: 'Hebron', label: 'Ancient City', x: 45, y: 44, artifact: { image: hebronArtifact, name: 'Tomb of the Patriarchs', description: 'Burial site of Abraham, Isaac, and Jacob.' } },
  { id: 'haifa', name: 'Haifa', label: 'Bahai Gardens', x: 42, y: 20, artifact: { image: haifaArtifact, name: 'Mount Carmel Flora', description: 'Unique species from the holy mountain.' } },
  { id: 'tiberias', name: 'Tiberias', label: 'Sea of Galilee', x: 48, y: 21, artifact: { image: tiberiasArtifact, name: 'St. Peter\'s Fish', description: 'Famous fish from the Sea of Galilee.' } },
  { id: 'jericho', name: 'Jericho', label: 'Ancient Oasis', x: 50, y: 37, artifact: { image: artifactJericho, name: 'Date Palm', description: 'The oldest continuously inhabited city in the world.' } },
  { id: 'nablus', name: 'Nablus', label: 'Olive Soap', x: 48, y: 31, artifact: { image: nablusSoapArtifact, name: 'Nabulsi Soap', description: 'Handmade olive oil soap, a tradition for centuries.' } },
  { id: 'ramallah', name: 'Ramallah', label: 'Cultural Hub', x: 45, y: 37, artifact: { image: ramallahArtifact, name: 'Debke Scarf', description: 'Symbol of traditional Palestinian dance.' } },
  { id: 'akko', name: 'Akko', label: 'Crusader Halls', x: 43, y: 17, artifact: { image: akkoArtifact, name: 'Knight\'s Helmet', description: 'Relic from the Crusader period.' } },
  { id: 'suwayda', name: 'As-Suwayda', label: 'Black Basalt', x: 80, y: 18, artifact: { image: suwaydaArtifact, name: 'Basalt Stone', description: 'Volcanic rock used in local architecture.' } },
  { id: 'byblos', name: 'Byblos', label: 'Oldest Port', x: 46, y: 6, artifact: { image: byblosArtifact, name: 'Phoenician Alphabet', description: 'Birthplace of the modern alphabet.' } },
  { id: 'damascus', name: 'Damascus', label: 'City of Jasmine', x: 68, y: 13, artifact: { image: damascusArtifact, name: 'Damascus Steel', description: 'Legendary sword-making technique.' } },
  { id: 'palmyra', name: 'Palmyra', label: 'Desert Oasis', x: 85, y: 10, artifact: { image: palmyraArtifact, name: 'Temple Columns', description: 'Zenobia\'s legendary desert kingdom.' } },
  { id: 'homs', name: 'Homs', label: 'Historic City', x: 62, y: 5, artifact: { image: homsArtifact, name: 'Crusader Castle', description: 'Krak des Chevaliers overlooks the valley.' } },
  { id: 'baalbek', name: 'Baalbek', label: 'Temple of Jupiter', x: 65, y: 8, artifact: { image: baalbekArtifact, name: 'Keystone Fragment', description: 'Massive stone from the temple complex.' } },
  { id: 'aleppo', name: 'Aleppo', label: 'The Citadel', x: 75, y: 2, artifact: { image: aleppoArtifact, name: 'Aleppo Soap', description: 'Famous laurel soap.' } },
  { id: 'jerusalem', name: 'Jerusalem', label: 'Old City Walls', x: 45, y: 38, artifact: { image: artifactJerusalem, name: 'City Key', description: 'Iron key to the ancient gates.' } },
  { id: 'madaba', name: 'Madaba', label: 'Mosaic City', x: 68, y: 40, artifact: { image: madabaArtifact, name: 'Byzantine Mosaic', description: 'Ancient map of the Holy Land.' } },
  { id: 'karak', name: 'Karak', label: 'Crusader Castle', x: 62, y: 51, artifact: { image: karakArtifact, name: 'Castle Key', description: 'Fortress along the King\'s Highway.' } }
];
