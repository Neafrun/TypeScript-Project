import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../translations/translations';

// 번역 훅
export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key) => {
    return getTranslation(language, key);
  };

  return { t, language };
};
