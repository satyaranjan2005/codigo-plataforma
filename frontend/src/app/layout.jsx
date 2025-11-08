import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/Toast';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Primary favicon using project logo (SVG) for modern browsers */}
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        {/* Fallback to classic ICO for older browsers */}
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body>
        <ErrorBoundary>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}