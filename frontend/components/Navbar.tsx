
import React, { useState, useEffect } from 'react';
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { NavLink, useLocation } from 'react-router-dom';
import InstagramIcon from './icons/InstagramIcon';
import LinkedInIcon from './icons/LinkedInIcon';
// import logo from '../assets/brep-with-logo-bgr.png';
const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navbar is solid if scrolled or not on the homepage
  const isSolid = isScrolled || location.pathname !== '/';

  const navClass = isSolid
    ? 'bg-brand-white text-brand-black shadow-md'
    : 'bg-transparent text-brand-white';
  
  const baseLinkClass = 'relative py-2 transition-colors duration-300 hover:text-opacity-80';
  const activeLinkClass = 'after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full ' + (isSolid ? 'after:bg-brand-black' : 'after:bg-brand-white');

  const getLinkClassName = ({ isActive }: { isActive: boolean }) => 
    `${baseLinkClass} ${isActive ? activeLinkClass : ''}`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-in-out ${navClass}`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <NavLink to="/" className="text-xl font-bold tracking-wider">
          {/* <img src={logo} alt="Logo" className="h-12"/> */}
          BREP
        </NavLink>
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" end className={getLinkClassName}>Home</NavLink>
          <div 
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <NavLink to="/projects" className={getLinkClassName}>Projects <FiChevronDown className="inline ml-1" /></NavLink>
            {isDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-brand-white rounded-md shadow-lg py-2 transition-all duration-300 animate-fade-in-down border border-gray-100">
                <NavLink to="/projects?category=commercial" className="block px-4 py-2 text-brand-black hover:bg-gray-100 rounded">Commercial</NavLink>
                <NavLink to="/projects?category=residential" className="block px-4 py-2 text-brand-black hover:bg-gray-100 rounded">Residential</NavLink>
                <NavLink to="/projects?category=hospitality" className="block px-4 py-2 text-brand-black hover:bg-gray-100 rounded">Hospitality</NavLink>
                <NavLink to="/projects?category=interiors" className="block px-4 py-2 text-brand-black hover:bg-gray-100 rounded">Interiors</NavLink>
              </div>
            )}
          </div>
          <NavLink to="/about" className={getLinkClassName}>About Us</NavLink>
          <NavLink to="/contact" className={getLinkClassName}>Contact</NavLink>
        </nav>
        {/* Hamburger Icon for Mobile */}
        {/* Hamburger Icon for Mobile (only when menu is closed) */}
        {!isMobileMenuOpen && (
          <button
            className="md:hidden flex items-center justify-center p-2 rounded hover:bg-gray-100 focus:outline-none transition-colors z-50"
            aria-label="Open menu"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <FiMenu size={28} />
          </button>
        )}
        {/* Social Icons */}
        <div className="hidden md:flex items-center space-x-4">
          <a href="https://www.instagram.com/brep.ad" target='_blank' aria-label="Instagram" className="hover:opacity-75 transition-opacity">
            <InstagramIcon />
          </a>
        </div>
      </div>
      {/* Mobile Menu Overlay - always white bg and black text, X icon in front */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full h-screen bg-brand-white text-brand-black z-40 transition-opacity duration-500 ease-in-out ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ boxShadow: isMobileMenuOpen ? '0 4px 24px rgba(0,0,0,0.08)' : 'none' }}
      >
        {/* X icon absolute top right */}
        {isMobileMenuOpen && (
          <button
            className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none z-50"
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FiX size={32} color="#222" />
          </button>
        )}
        <div className="flex flex-col h-full justify-between px-8 py-8">
          <div>
            <NavLink to="/" end className="block text-2xl font-bold mb-8" onClick={() => setIsMobileMenuOpen(false)}>
              STUDIO
            </NavLink>
            <NavLink to="/" end className="block py-3 text-lg font-medium hover:bg-gray-100 rounded transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </NavLink>
            <div className="relative">
              <button
                className="w-full flex items-center justify-between py-3 text-lg font-medium hover:bg-gray-100 rounded transition-colors focus:outline-none"
                onClick={() => setIsMobileDropdownOpen((open) => !open)}
              >
                Projects <FiChevronDown className={`ml-2 transition-transform ${isMobileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMobileDropdownOpen && (
                <div className="pl-4 mt-1 flex flex-col gap-1 animate-fade-in-down">
                  <NavLink to="/projects?category=commercial" className="block py-2 text-base hover:bg-gray-100 rounded" style={{ color: '#222' }} onClick={() => setIsMobileMenuOpen(false)}>Commercial</NavLink>
                  <NavLink to="/projects?category=residential" className="block py-2 text-base hover:bg-gray-100 rounded" style={{ color: '#222' }} onClick={() => setIsMobileMenuOpen(false)}>Residential</NavLink>
                  <NavLink to="/projects?category=hospitality" className="block py-2 text-base hover:bg-gray-100 rounded" style={{ color: '#222' }} onClick={() => setIsMobileMenuOpen(false)}>Hospitality</NavLink>
                  <NavLink to="/projects?category=interiors" className="block py-2 text-base hover:bg-gray-100 rounded" style={{ color: '#222' }} onClick={() => setIsMobileMenuOpen(false)}>Interiors</NavLink>
                </div>
              )}
            </div>
            <NavLink to="/about" className="block py-3 text-lg font-medium hover:bg-gray-100 rounded transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              About Us
            </NavLink>
            <NavLink to="/contact" className="block py-3 text-lg font-medium hover:bg-gray-100 rounded transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Contact
            </NavLink>
          </div>
          <div className="flex items-center space-x-6 mt-8">
            <a href="#" aria-label="Instagram" className="hover:opacity-75 transition-opacity">
              <InstagramIcon />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:opacity-75 transition-opacity">
              <LinkedInIcon />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
