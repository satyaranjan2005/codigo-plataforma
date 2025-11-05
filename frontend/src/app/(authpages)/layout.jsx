function AuthLayout({ children }) {
  // Auth pages are nested under the root layout; do not render <html> or <body> here.
  return <>{children}</>;
}

export default AuthLayout;