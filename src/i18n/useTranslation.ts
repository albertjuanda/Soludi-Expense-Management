import { useAppStore } from '../store/appStore';
import { translations } from './translations';

export function useTranslation() {
  const language = useAppStore(s => s.language);
  const t = translations[language];
  return { t, language };
}
