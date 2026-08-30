import { useLocale } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { LocaleType, localesSettings } from 'src/i18n/config-locale';

export function useCurrentLocale() {
  const locale = useLocale();

  return localesSettings[locale as LocaleType];
}

export async function getCurrentLocale() {
  const locale = await getLocale();

  return localesSettings[locale as LocaleType];
}

export function useNameValue() {
  const locale = useLocale();

  return locale === 'ar' ? 'nameAr' : 'nameEn';
}

export async function getNameValue() {
  const locale = await getLocale();

  return locale === 'ar' ? 'nameAr' : 'nameEn';
}
