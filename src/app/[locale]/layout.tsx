import type { Metadata } from "next";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import ThemeProvider from "src/theme";
import { SettingsProvider } from "src/components/settings";
import { ToastProvider } from "src/components/toast";
import { getMessages } from "next-intl/server";
import { localesSettings } from "src/i18n/config-locale";
import type { LocaleType } from "src/i18n/config-locale";
import { notFound } from "next/navigation";
import { routing } from "src/i18n/routing";
import { plexArabic } from "src/theme/typography";
import { AuthProvider } from "src/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Trade Global",
  description: "Trade Global Dashboard",
  manifest: "/favicon/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the locale is supported
  if (!routing.locales.includes(locale as LocaleType)) {
    notFound();
  }

  const messages = await getMessages();

  const localeSetting = localesSettings[locale as LocaleType];
  const dir = localeSetting?.dir ?? "rtl";
  const themeDirection = dir as "rtl" | "ltr";

  return (
    <html lang={locale} dir={dir} className={`${plexArabic.className} antialiased`}>
      <body>
        <SettingsProvider
          defaultSettings={{
            themeStretch: false,
            themeMode: "light",
            themeDirection,
            themeContrast: "default",
            themeLayout: "vertical",
            themeColorPresets: "default",
          }}
        >
          <ThemeProvider>
            <ToastProvider>
              <NextIntlClientProvider messages={messages}>
                <AuthProvider>
                  {children}
                </AuthProvider>
              </NextIntlClientProvider>
            </ToastProvider>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
