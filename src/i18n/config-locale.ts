export type LocaleType = 'en' | 'ar';

interface LocaleSetting {
  label: string;
  value: LocaleType;
  dir: 'ltr' | 'rtl';
  currency: string;
  icon: string;
  numberFormat: {
    code: string;
    currency: string;
  };
}

export const locales: LocaleType[] = ['ar', 'en'];
export const defaultLocale: LocaleType = 'ar';

export const localesSettings: { [key in LocaleType]: LocaleSetting } = {
  ar: {
    label: 'العربية',
    value: 'ar',
    dir: 'rtl',
    currency: 'ر.س',
    icon: 'flagpack:sa',
    numberFormat: {
      code: 'ar',
      currency: 'AED',
    },
  },
  en: {
    label: 'English',
    value: 'en',
    dir: 'ltr',
    currency: 'SAR',
    icon: 'flagpack:gb-nir',
    numberFormat: {
      code: 'en-US',
      currency: 'USD',
    },
  },
};

export const allLocales = Object.values(localesSettings);
