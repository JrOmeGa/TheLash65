import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lash Booking',
  description: 'Book your lash extension appointment online',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
