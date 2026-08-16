import en from './en.json';
import ar from './ar.json';
import tr from './tr.json';
import id from './id.json';
import ur from './ur.json';
import ru from './ru.json';
import fr from './fr.json';
import bn from './bn.json';
import ms from './ms.json';
import uz from './uz.json';
import hi from './hi.json';
import pa from './pa.json';
import ha from './ha.json';
import sw from './sw.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'ms', label: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'uz', label: 'Oʻzbekcha', flag: '🇺🇿' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pa', label: 'پنجابی', flag: '🇵🇰' },
  { code: 'ha', label: 'Hausa', flag: '🇳🇬' },
  { code: 'sw', label: 'Kiswahili', flag: '🇹🇿' },
];

export const translations = { en, ar, tr, id, ur, ru, fr, bn, ms, uz, hi, pa, ha, sw };

export const getTranslation = (languageCode) => translations[languageCode] || translations.en;
