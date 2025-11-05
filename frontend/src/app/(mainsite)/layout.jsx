import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';


function MainLayout({ children }) {
  // Child layouts must not include <html> or <body> — the root `src/app/layout.jsx`
  // already provides them. Return a fragment that renders the site chrome.
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default MainLayout;