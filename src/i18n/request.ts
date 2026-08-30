import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as typeof routing.locales extends (infer U)[] ? U : never)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
