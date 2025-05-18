import { Heart, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-display text-xl mb-4">Azure Haven</h3>
            <p className="text-gray-400 mb-4">
              Experience luxury and comfort in our exquisite accommodations, where every detail is crafted for an unforgettable stay.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/rooms" className="text-gray-400 hover:text-white transition-colors">Rooms</Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Services</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex">
                <MapPin size={20} className="mr-2 flex-shrink-0 text-primary-500" />
                <span>123 Seaside Avenue, Coastal City, CC 10001</span>
              </li>
              <li className="flex">
                <Phone size={20} className="mr-2 flex-shrink-0 text-primary-500" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex">
                <Mail size={20} className="mr-2 flex-shrink-0 text-primary-500" />
                <span>info@azurehaven.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4">Subscribe to receive updates and special offers.</p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white"
                required
              />
              <button type="submit" className="btn-primary w-full">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">&copy; {currentYear} Azure Haven. All rights reserved.</p>
            <p className="text-sm flex items-center mt-2 md:mt-0">
              Made with <Heart size={14} className="mx-1 text-red-500" /> for a luxurious experience
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;