// This root layout is intentionally minimal.
// All locale-specific configuration (lang, dir, providers) is handled
// in src/app/[locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
