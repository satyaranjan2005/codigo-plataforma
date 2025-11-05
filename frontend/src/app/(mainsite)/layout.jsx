import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';


function MainLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

export default MainLayout;