
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import Button from './Button';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import logoIcon from '../public/logo-icon.png';

interface NavbarProps {
  customScrolled?: boolean;
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ customScrolled, activeSection, onNavigate }) => {
  const [internalScrolled, setInternalScrolled] = useState(false);
  const isScrolled = customScrolled !== undefined ? customScrolled : internalScrolled;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setInternalScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle scroll on initial load if hash matches
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const elementId = location.hash.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);


  const navLinks = [
    { name: 'Home', target: 'home' },
    { name: 'Features', target: 'features' },
    { name: 'How It Works', target: 'demo' },
  ];

  const handleNavClick = (targetId: string) => {
    setIsMobileMenuOpen(false);

    if (location.pathname === '/' && onNavigate) {
      onNavigate(targetId);
    } else {
      if (location.pathname === '/') {
        // Fallback for default behavior if onNavigate not provided
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `#${targetId}`);
        }
      } else {
        navigate(`/#${targetId}`);
      }
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen
        ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div
            className="flex-shrink-0 flex items-center cursor-pointer gap-3"
            onClick={() => handleNavClick('home')}
          >
            <img
              src={logoIcon}
              alt="E-Written Logo"
              className="h-10 w-10 object-contain flex-shrink-0"
            />
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                E-<span className="text-primary dark:text-blue-400">Written</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">From Handwriting to Smart Grading</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.target)}
                className={`font-medium transition-all focus:outline-none relative py-1 ${activeSection === link.target
                  ? 'text-primary dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400'
                  }`}
              >
                {link.name}
                {activeSection === link.target && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-blue-400 rounded-full"
                  />
                )}
              </button>
            ))}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <Button variant="primary" size="sm" onClick={handleLoginClick}>
              Faculty Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white focus:outline-none p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.target)}
                  className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                >
                  {link.name}
                </button>
              ))}
              <div className="pt-4">
                <Button variant="primary" className="w-full justify-center" onClick={handleLoginClick}>
                  Faculty Login
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
