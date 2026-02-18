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
    hebrewName: 'ואדי רם',
    label: 'Start Here',
    hebrewLabel: 'התחל כאן',
    x: 60,
    y: 80,
    artifact: {
      image: artifactWadiRum,
      name: 'Dallah (Coffee Pot)',
      hebrewName: 'דלה (קומקום קפה)',
      description: 'A symbol of hospitality. Always served with the right hand!',
      hebrewDescription: 'סמל לאירוח. מוגש תמיד ביד ימין!'
    }
  },
  {
    id: 'eilat',
    name: 'Eilat',
    hebrewName: 'אילת',
    label: 'Red Sea Port',
    hebrewLabel: 'נמל הים האדום',
    x: 40,
    y: 80,
    artifact: {
      image: eilatArtifact,
      name: 'Coral Reef',
      hebrewName: 'שונית אלמוגים',
      description: 'Beautiful underwater gardens of the Red Sea.',
      hebrewDescription: 'גנים תת ימיים יפהפיים של הים האדום.'
    }
  },
  {
    id: 'aqaba',
    name: 'Aqaba',
    hebrewName: 'עקבה',
    label: 'Red Sea Gateway',
    hebrewLabel: 'שער הים האדום',
    x: 45,
    y: 82,
    artifact: {
      image: aqabaArtifact,
      name: 'Coral Diving Mask',
      hebrewName: 'מסכת צלילה',
      description: 'Gateway to Jordan\'s Red Sea coast.',
      hebrewDescription: 'השער לחוף הים האדום של ירדן.'
    }
  },
  {
    id: 'petra',
    name: 'Petra',
    hebrewName: 'פטרה',
    label: 'The Treasury',
    hebrewLabel: 'האוצר',
    x: 55,
    y: 65,
    artifact: {
      image: artifactPetra,
      name: 'Nabatean Coin',
      hebrewName: 'מטבע נבטי',
      description: 'Ancient currency from the rose-red city.',
      hebrewDescription: 'מטבע עתיק מהעיר האדומה.'
    }
  },
  { 
    id: 'beersheba', 
    name: 'Beer Sheba', 
    hebrewName: 'באר שבע',
    label: 'Negev Capital', 
    hebrewLabel: 'בירת הנגב',
    x: 35, y: 48, 
    artifact: { 
      image: artifactBeerSheba, 
      name: 'Abraham\'s Well', 
      hebrewName: 'באר אברהם',
      description: 'Ancient well associated with the patriarch.',
      hebrewDescription: 'באר עתיקה המזוהה עם האבות.'
    } 
  },
  { 
    id: 'jerash', 
    name: 'Jerash', 
    hebrewName: 'ג׳רש',
    label: 'Roman Ruins', 
    hebrewLabel: 'עתיקות רומיות',
    x: 70, y: 25, 
    artifact: { 
      image: jerashArtifact, 
      name: 'Roman Column Fragment', 
      hebrewName: 'שבר עמוד רומי',
      description: 'Piece of the extensive Roman architecture.',
      hebrewDescription: 'חלק מהאדריכלות הרומית הנרחבת.'
    } 
  },
  { 
    id: 'beirut', 
    name: 'Beirut', 
    hebrewName: 'ביירות',
    label: 'Coastal Gem', 
    hebrewLabel: 'פנינת החוף',
    x: 46, y: 8, 
    artifact: { 
      image: beirutArtifact, 
      name: 'Cedar Tree', 
      hebrewName: 'עץ ארז',
      description: 'Symbol of Lebanon\'s resilience.',
      hebrewDescription: 'סמל לעמידותה של לבנון.'
    } 
  },
  { 
    id: 'tripoli', 
    name: 'Tripoli', 
    hebrewName: 'טריפולי',
    label: 'Northern Port', 
    hebrewLabel: 'הנמל הצפוני',
    x: 47, y: 4, 
    artifact: { 
      image: tripoliArtifact, 
      name: 'Crusader Citadel', 
      hebrewName: 'מצודה צלבנית',
      description: 'Medieval fortress overlooking the sea.',
      hebrewDescription: 'מבצר מימי הביניים המשקיף על הים.'
    } 
  },
  { 
    id: 'sidon', 
    name: 'Sidon', 
    hebrewName: 'צידון',
    label: 'Sea Castle', 
    hebrewLabel: 'מבצר הים',
    x: 45, y: 11, 
    artifact: { 
      image: sidonArtifact, 
      name: 'Phoenician Harbor', 
      hebrewName: 'נמל פיניקי',
      description: 'Ancient trading port of the Phoenicians.',
      hebrewDescription: 'נמל סחר עתיק של הפיניקים.'
    } 
  },
  { 
    id: 'tyre', 
    name: 'Tyre', 
    hebrewName: 'צור',
    label: 'Purple Dye', 
    hebrewLabel: 'ארגמן צורי',
    x: 44, y: 14, 
    artifact: { 
      image: tyreArtifact, 
      name: 'Royal Purple Shell', 
      hebrewName: 'קונכיית ארגמן מלכותי',
      description: 'Source of the legendary Tyrian purple.',
      hebrewDescription: 'מקור הארגמן הצורי האגדי.'
    } 
  },
  { 
    id: 'masada', 
    name: 'Masada', 
    hebrewName: 'מצדה',
    label: 'Desert Fortress', 
    hebrewLabel: 'מבצר המדבר',
    x: 48, y: 47, 
    artifact: { 
      image: masadaArtifact, 
      name: 'Roman Scroll', 
      hebrewName: 'מגילה רומית',
      description: 'Ancient texts preserved in the desert climate.',
      hebrewDescription: 'טקסטים עתיקים שנשמרו באקלים המדברי.'
    } 
  },
  { 
    id: 'amman', 
    name: 'Amman', 
    hebrewName: 'רבת עמון',
    label: 'The Amphitheater', 
    hebrewLabel: 'האמפיתיאטרון',
    x: 70, y: 35, 
    artifact: { 
      image: artifactAmman, 
      name: 'Roman Dagger', 
      hebrewName: 'פגיון רומי',
      description: 'Relic from Philadelphia (ancient Amman).',
      hebrewDescription: 'שריד מפילדלפיה (רבת עמון העתיקה).'
    } 
  },
  { 
    id: 'hebron', 
    name: 'Hebron', 
    hebrewName: 'חברון',
    label: 'Ancient City', 
    hebrewLabel: 'עיר האבות',
    x: 45, y: 44, 
    artifact: { 
      image: hebronArtifact, 
      name: 'Tomb of the Patriarchs', 
      hebrewName: 'מערת המכפלה',
      description: 'Burial site of Abraham, Isaac, and Jacob.',
      hebrewDescription: 'מקום קבורתם של אברהם, יצחק ויעקב.'
    } 
  },
  { 
    id: 'haifa', 
    name: 'Haifa', 
    hebrewName: 'חיפה',
    label: 'Bahai Gardens', 
    hebrewLabel: 'הגנים הבהאיים',
    x: 42, y: 20, 
    artifact: { 
      image: haifaArtifact, 
      name: 'Mount Carmel Flora', 
      hebrewName: 'צמחיית הכרמל',
      description: 'Unique species from the holy mountain.',
      hebrewDescription: 'מינים ייחודיים מההר הקדוש.'
    } 
  },
  { 
    id: 'tiberias', 
    name: 'Tiberias', 
    hebrewName: 'טבריה',
    label: 'Sea of Galilee', 
    hebrewLabel: 'הכנרת',
    x: 48, y: 21, 
    artifact: { 
      image: tiberiasArtifact, 
      name: 'St. Peter\'s Fish', 
      hebrewName: 'דג מושט',
      description: 'Famous fish from the Sea of Galilee.',
      hebrewDescription: 'דג מפורסם מהכנרת.'
    } 
  },
  { 
    id: 'jericho', 
    name: 'Jericho', 
    hebrewName: 'יריחו',
    label: 'Ancient Oasis', 
    hebrewLabel: 'נווה מדבר עתיק',
    x: 50, y: 37, 
    artifact: { 
      image: artifactJericho, 
      name: 'Date Palm', 
      hebrewName: 'עץ תמר',
      description: 'The oldest continuously inhabited city in the world.',
      hebrewDescription: 'העיר המיושבת ברציפות העתיקה בעולם.'
    } 
  },
  { 
    id: 'nablus', 
    name: 'Nablus', 
    hebrewName: 'שכם',
    label: 'Olive Soap', 
    hebrewLabel: 'סבון שמן זית',
    x: 48, y: 31, 
    artifact: { 
      image: nablusSoapArtifact, 
      name: 'Nabulsi Soap', 
      hebrewName: 'סבון שכם',
      description: 'Handmade olive oil soap, a tradition for centuries.',
      hebrewDescription: 'סבון שמן זית בעבודת יד, מסורת של מאות שנים.'
    } 
  },
  { 
    id: 'ramallah', 
    name: 'Ramallah', 
    hebrewName: 'רמאללה',
    label: 'Cultural Hub', 
    hebrewLabel: 'מרכז תרבותי',
    x: 45, y: 37, 
    artifact: { 
      image: ramallahArtifact, 
      name: 'Debke Scarf', 
      hebrewName: 'כאפייה (דבקה)',
      description: 'Symbol of traditional Palestinian dance.',
      hebrewDescription: 'סמל לריקוד הדבקה המסורתי.'
    } 
  },
  { 
    id: 'akko', 
    name: 'Akko', 
    hebrewName: 'עכו',
    label: 'Crusader Halls', 
    hebrewLabel: 'אולמות האבירים',
    x: 43, y: 17, 
    artifact: { 
      image: akkoArtifact, 
      name: 'Knight\'s Helmet', 
      hebrewName: 'קסדת אביר',
      description: 'Relic from the Crusader period.',
      hebrewDescription: 'שריד מהתקופה הצלבנית.'
    } 
  },
  { 
    id: 'suwayda', 
    name: 'As-Suwayda', 
    hebrewName: 'א-סוּוַיְדָא',
    label: 'Black Basalt', 
    hebrewLabel: 'בזלת שחורה',
    x: 80, y: 18, 
    artifact: { 
      image: suwaydaArtifact, 
      name: 'Basalt Stone', 
      hebrewName: 'אבן בזלת',
      description: 'Volcanic rock used in local architecture.',
      hebrewDescription: 'סלע געשי המשמש באדריכלות המקומית.'
    } 
  },
  { 
    id: 'byblos', 
    name: 'Byblos', 
    hebrewName: 'גבל',
    label: 'Oldest Port', 
    hebrewLabel: 'הנמל העתיק ביותר',
    x: 46, y: 6, 
    artifact: { 
      image: byblosArtifact, 
      name: 'Phoenician Alphabet', 
      hebrewName: 'אלפבית פיניקי',
      description: 'Birthplace of the modern alphabet.',
      hebrewDescription: 'מקום הולדתו של האלפבית המודרני.'
    } 
  },
  { 
    id: 'damascus', 
    name: 'Damascus', 
    hebrewName: 'דמשק',
    label: 'City of Jasmine', 
    hebrewLabel: 'עיר היסמין',
    x: 68, y: 13, 
    artifact: { 
      image: damascusArtifact, 
      name: 'Damascus Steel', 
      hebrewName: 'פלדה דמשקאית',
      description: 'Legendary sword-making technique.',
      hebrewDescription: 'טכניקת חישול חרבות אגדית.'
    } 
  },
  { 
    id: 'palmyra', 
    name: 'Palmyra', 
    hebrewName: 'תדמור',
    label: 'Desert Oasis', 
    hebrewLabel: 'נווה מדבר',
    x: 85, y: 10, 
    artifact: { 
      image: palmyraArtifact, 
      name: 'Temple Columns', 
      hebrewName: 'עמודי המקדש',
      description: 'Zenobia\'s legendary desert kingdom.',
      hebrewDescription: 'ממלכת המדבר האגדית של זנוביה.'
    } 
  },
  { 
    id: 'homs', 
    name: 'Homs', 
    hebrewName: 'חומס',
    label: 'Historic City', 
    hebrewLabel: 'עיר היסטורית',
    x: 62, y: 5, 
    artifact: { 
      image: homsArtifact, 
      name: 'Crusader Castle', 
      hebrewName: 'מבצר צלבני',
      description: 'Krak des Chevaliers overlooks the valley.',
      hebrewDescription: 'קראק דה שבלייה משקיף על העמק.'
    } 
  },
  { 
    id: 'baalbek', 
    name: 'Baalbek', 
    hebrewName: 'בעלבכ',
    label: 'Temple of Jupiter', 
    hebrewLabel: 'מקדש יופיטר',
    x: 65, y: 8, 
    artifact: { 
      image: baalbekArtifact, 
      name: 'Keystone Fragment', 
      hebrewName: 'שבר אבן ראשה',
      description: 'Massive stone from the temple complex.',
      hebrewDescription: 'אבן עצומה ממתחם המקדש.'
    } 
  },
  { 
    id: 'aleppo', 
    name: 'Aleppo', 
    hebrewName: 'חלב',
    label: 'The Citadel', 
    hebrewLabel: 'המצודה',
    x: 75, y: 2, 
    artifact: { 
      image: aleppoArtifact, 
      name: 'Aleppo Soap', 
      hebrewName: 'סבון חלב',
      description: 'Famous laurel soap.',
      hebrewDescription: 'סבון הדפנה המפורסם.'
    } 
  },
  { 
    id: 'jerusalem', 
    name: 'Jerusalem', 
    hebrewName: 'ירושלים',
    label: 'Old City Walls', 
    hebrewLabel: 'חומות העיר העתיקה',
    x: 45, y: 38, 
    artifact: { 
      image: artifactJerusalem, 
      name: 'City Key', 
      hebrewName: 'מפתח העיר',
      description: 'Iron key to the ancient gates.',
      hebrewDescription: 'מפתח ברזל לשערים העתיקים.'
    } 
  },
  { 
    id: 'madaba', 
    name: 'Madaba', 
    hebrewName: 'מידבא',
    label: 'Mosaic City', 
    hebrewLabel: 'עיר הפסיפסים',
    x: 68, y: 40, 
    artifact: { 
      image: madabaArtifact, 
      name: 'Byzantine Mosaic', 
      hebrewName: 'פסיפס ביזנטי',
      description: 'Ancient map of the Holy Land.',
      hebrewDescription: 'מפה עתיקה של ארץ הקודש.'
    } 
  },
  { 
    id: 'karak', 
    name: 'Karak', 
    hebrewName: 'כרך',
    label: 'Crusader Castle', 
    hebrewLabel: 'מבצר כרך',
    x: 62, y: 51, 
    artifact: { 
      image: karakArtifact, 
      name: 'Castle Key', 
      hebrewName: 'מפתח המבצר',
      description: 'Fortress along the King\'s Highway.',
      hebrewDescription: 'מבצר על דרך המלך.'
    } 
  }
];
