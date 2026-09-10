import { cookies } from 'next/headers';
import { plexArabic } from 'src/theme/typography';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'ar';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${plexArabic.className} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
