import React from 'react';
import MailIcon from '../components/icons/MailIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import MapPinIcon from '../components/icons/MapPinIcon';

const ContactPage: React.FC = () => {
  return (
    <div className="bg-brand-white text-brand-black">
      <div className="container mx-auto px-6 py-24 md:py-32">
        
        {/* Top Header Block */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold">Get In Touch</h1>
          <p className="mt-4 text-base text-gray-500 max-w-xl mx-auto font-light leading-relaxed">
            We'd love to hear about your project. Reach out to us directly or visit our studio.
          </p>
        </div>
        
        {/* ✅ FIXED: Layout transformed from split columns to a clean, centered stack */}
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center space-y-12">
          
          <h2 className="text-2xl font-semibold tracking-wide uppercase text-sm border-b pb-2 px-6 border-gray-200">
            Contact Information
          </h2>
          
          {/* Info Blocks Row Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 w-full pt-4">
            
            {/* 📍 Our Studio */}
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-neutral-50 rounded-full border border-neutral-100">
                <MapPinIcon className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">Our Studio</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[200px] mx-auto">
                  35B, Vadugan thottam,<br />
                  Nalliyampalayam, Thindal,<br />
                  Erode, TN 638012
                </p>
              </div>
            </div>

            {/* ✉️ Email Channel */}
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-neutral-50 rounded-full border border-neutral-100">
                <MailIcon className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">Email Us</h3>
                <a 
                  href="mailto:contact@architectstudio.com" 
                  className="text-xs text-gray-500 hover:text-black transition-colors underline underline-offset-4"
                >
                  contact@architectstudio.com
                </a>
              </div>
            </div>

            {/* 📞 Direct Line */}
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-neutral-50 rounded-full border border-neutral-100">
                <PhoneIcon className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">Call Us</h3>
                <a 
                  href="tel:+919790444744" 
                  className="text-xs text-gray-500 hover:text-black transition-colors font-medium"
                >
                  (+91) 97904 44744
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Interactive Geolocation Viewport Map Frame */}
      <section className="w-full h-96 border-t border-gray-100">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3912.1716992286424!2d77.67964627452385!3d11.322157748891696!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba96f7cd96754b5%3A0xc04d0a8697ab69bb!2sBrep%20Architecture%20%26%20Design%20Studio!5e0!3m2!1sen!2sin!4v1764238843544!5m2!1sen!2sin"
          className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Map of our location"
        ></iframe>
      </section>
    </div>
  );
};

export default ContactPage;