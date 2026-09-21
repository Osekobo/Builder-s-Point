import { Link } from "react-router-dom";
import {
  FaLocationDot,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaFacebookF,
  FaXTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaChevronRight,
  FaShieldHalved,
  FaHeart,
} from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white border-t-8 border-terra">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          <div>
            <Link
              to="/"
              className="font-h text-2xl font-bold text-terra mb-4 inline-block"
            >
              Kione Hardware
            </Link>
            <p className="text-sand/70 mb-4 leading-relaxed">
              Your trusted hardware and general store serving Nairobi and
              beyond with quality building materials, paint, and everyday
              essentials.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-terra/20 p-2 border border-terra hover:bg-terra hover:scale-110 transition-all duration-300"
              >
                <FaFacebookF className="w-5 h-5 text-terra hover:text-white" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-terra/20 p-2 border border-terra hover:bg-terra hover:scale-110 transition-all duration-300"
              >
                <FaXTwitter className="w-5 h-5 text-terra hover:text-white" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-terra/20 p-2 border border-terra hover:bg-terra hover:scale-110 transition-all duration-300"
              >
                <FaInstagram className="w-5 h-5 text-terra hover:text-white" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-terra/20 p-2 border border-terra hover:bg-terra hover:scale-110 transition-all duration-300"
              >
                <FaYoutube className="w-5 h-5 text-terra hover:text-white" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-terra/20 p-2 border border-terra hover:bg-terra hover:scale-110 transition-all duration-300"
              >
                <FaLinkedinIn className="w-5 h-5 text-terra hover:text-white" />
              </a>
            </div>
          </div>

          
          <div>
            <h3 className="font-h text-lg font-bold text-terra mb-4 uppercase">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sand/70 hover:text-terra transition-colors flex items-center group"
                >
                  <FaChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-sand/70 hover:text-terra transition-colors flex items-center group"
                >
                  <FaChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sand/70 hover:text-terra transition-colors flex items-center group"
                >
                  <FaChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sand/70 hover:text-terra transition-colors flex items-center group"
                >
                  <FaChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sand/70 hover:text-terra transition-colors flex items-center group"
                >
                  <FaChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          
          <div>
            <h3 className="font-h text-lg font-bold text-terra mb-4 uppercase">
              Customer Service
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-sand/70 hover:text-terra transition-colors flex items-center group"
                >
                  <FaChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sand/70 hover:text-terra transition-colors flex items-center group"
                >
                  <FaChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-sand/70 hover:text-terra transition-colors flex items-center group"
                >
                  <FaChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/payment"
                  className="text-sand/70 hover:text-terra transition-colors flex items-center group"
                >
                  <FaChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Payment Methods
                </Link>
              </li>
            </ul>
          </div>

          
          <div>
            <h3 className="font-h text-lg font-bold text-terra mb-4 uppercase">
              Stay Connected
            </h3>
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-3 text-sand/70">
                <FaLocationDot className="w-5 h-5 flex-shrink-0 text-terra" />
                <span>Nairobi, Kenya</span>
              </div>
              <div className="flex items-center space-x-3 text-sand/70">
                <FaPhone className="w-5 h-5 flex-shrink-0 text-terra" />
                <a
                  href="tel:0712437715"
                  className="hover:text-terra transition-colors"
                >
                  0712 437 715
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sand/70">
                <FaEnvelope className="w-5 h-5 flex-shrink-0 text-terra" />
                <a
                  href="mailto:info@kionehardware.com"
                  className="hover:text-terra transition-colors"
                >
                  info@kionehardware.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sand/70">
                <FaClock className="w-5 h-5 flex-shrink-0 text-terra" />
                <span>Mon-Sat: 8AM - 7PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-terra/30 pt-8 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="bg-terra/20 p-3 border border-terra">
                <FaShieldHalved className="w-6 h-6 text-terra" />
              </div>
              <div>
                <h4 className="font-h font-bold text-terra">Secure Payment</h4>
                <p className="text-sm text-sand/50">100% secure transactions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-terra/20 p-3 border border-terra">
                <FaHeart className="w-6 h-6 text-terra" />
              </div>
              <div>
                <h4 className="font-h font-bold text-terra">Trusted Service</h4>
                <p className="text-sm text-sand/50">Since day one in Nairobi</p>
              </div>
            </div>
          </div>
        </div>

        
        <div className="border-t-2 border-terra/30 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div
              className="flex space-x-3 flex-wrap gap-2"
              aria-label="Available payment method"
            >
              <div className="bg-white rounded p-1 h-8 px-3 flex items-center justify-center shadow-sm">
                <span className="text-green-600 font-bold text-sm tracking-wide">
                  M-PESA
                </span>
              </div>
            </div>
            <div className="text-center text-sand/50 text-sm">
              <p>
                &copy; {currentYear} Kione Hardware & General Stores. All rights
                reserved.
              </p>
              <p className="mt-1">Located in Nairobi, Kenya</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
