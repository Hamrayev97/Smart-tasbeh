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
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ur', label: 'اردو' },
  { code: 'ru', label: 'Русский' },
  { code: 'fr', label: 'Français' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'uz', label: 'Oʻzbekcha' },
];

export const translations = { en, ar, tr, id, ur, ru, fr, bn, ms, uz };

export const getTranslation = (languageCode) => translations[languageCode] || translations.en;
