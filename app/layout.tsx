import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SWIFT gpi Banking Fund Tracker & Secure API Gateway',
  description: 'Real-time banking SWIFT gpi fund verification, transaction monitoring dashboard, and secure API gateway with ISO 20022 pacs.008 support.',
  openGraph: {
    title: 'SWIFT gpi Banking Fund Tracker & Secure API Gateway',
    description: 'Real-time banking SWIFT gpi fund verification, transaction monitoring dashboard, and secure API gateway with ISO 20022 pacs.008 support.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SWIFT gpi Banking Fund Tracker & Secure API Gateway',
    description: 'Real-time banking SWIFT gpi fund verification, transaction monitoring dashboard, and secure API gateway with ISO 20022 pacs.008 support.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-blue-600 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
