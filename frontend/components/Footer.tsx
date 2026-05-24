
import React from 'react';
import InstagramIcon from './icons/InstagramIcon';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-white border-t border-gray-200 text-brand-black">
      <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-gray-600 mb-4 md:mb-0">
          © {new Date().getFullYear()} Architecture Studio. All Rights Reserved.
        </p>
        <div className="flex items-center space-x-6">
          <a href="https://www.instagram.com/brep.ad" target='_blank' aria-label="Instagram" className="text-gray-600 hover:text-brand-black transition-colors">
            <InstagramIcon />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
