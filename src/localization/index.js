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
];

export const translations = { en, ar, tr, id, ur, ru, fr, bn, ms, uz };

export const getTranslation = (languageCode) => translations[languageCode] || translations.en;
