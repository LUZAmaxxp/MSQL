import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    closeMenus();
  }, [location.pathname]);

  const isHomePage = location.pathname === '/';
  const navbarClasses = `fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
    isScrolled || !isHomePage
      ? 'bg-white shadow-md py-2'
      : 'bg-transparent py-4'
  }`;

  const linkClasses = `text-sm font-medium transition-colors hover:text-primary-700 ${
    isScrolled || !isHomePage ? 'text-gray-700' : 'text-white'
  }`;

  const activeClasses = 'text-primary-700 font-semibold';
  const logoClasses = `font-display text-xl transition-colors ${
    isScrolled || !isHomePage ? 'text-primary-800' : 'text-white'
  }`;

  return (
    <header className={navbarClasses}>
      <div className="container-custom">
        <div className="flex items-center justify-between">
          <Link to="/" className={logoClasses} onClick={closeMenus}>
            Azure Haven
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`${linkClasses} ${
                location.pathname === '/' ? activeClasses : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/rooms"
              className={`${linkClasses} ${
                location.pathname.includes('/rooms') ? activeClasses : ''
              }`}
            >
              Rooms
            </Link>
            
            {isAdmin && (
              <Link
                to="/admin"
                className={`${linkClasses} ${
                  location.pathname.includes('/admin') ? activeClasses : ''
                }`}
              >
                Admin
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className={`flex items-center space-x-1 ${linkClasses}`}
                >
                  <User size={16} />
                  <span>{user?.firstName}</span>
                  <ChevronDown size={16} />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 animate-slide-down">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <User size={16} className="mr-2" />
                        My Profile
                      </div>
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary rounded-full"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X
                size={24}
                className={isScrolled || !isHomePage ? 'text-gray-800' : 'text-white'}
              />
            ) : (
              <Menu
                size={24}
                className={isScrolled || !isHomePage ? 'text-gray-800' : 'text-white'}
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4 z-20 animate-slide-down">
          <div className="container-custom flex flex-col space-y-4">
            <Link
              to="/"
              className={`${
                location.pathname === '/' ? activeClasses : 'text-gray-700'
              } font-medium`}
            >
              Home
            </Link>
            <Link
              to="/rooms"
              className={`${
                location.pathname.includes('/rooms') ? activeClasses : 'text-gray-700'
              } font-medium`}
            >
              Rooms
            </Link>
            
            {isAdmin && (
              <Link
                to="/admin"
                className={`${
                  location.pathname.includes('/admin') ? activeClasses : 'text-gray-700'
                } font-medium`}
              >
                Admin
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className={`${
                    location.pathname === '/profile' ? activeClasses : 'text-gray-700'
                  } font-medium flex items-center`}
                >
                  <User size={16} className="mr-2" />
                  My Profile
                </Link>
                <button
                  onClick={logout}
                  className="text-left text-gray-700 font-medium flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary w-full text-center">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;