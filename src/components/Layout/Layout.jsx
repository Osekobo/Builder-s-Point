import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from '../Common/ScrollToTop';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow mx-auto w-full max-w-[1600px] px-3 py-3 md:px-4 md:py-4">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Layout;