import React, { useState, useEffect, useCallback } from 'react';
import MailIcon from '../components/icons/MailIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
import LinkedInIcon from '../components/icons/LinkedInIcon';
import { getTeamMembers } from '../services/teamService';
import { TeamMember } from '../src/types';
const companyPhotos = [
  'https://picsum.photos/seed/company1/1600/900',
  'https://picsum.photos/seed/company2/1600/900',
  'https://picsum.photos/seed/company3/1600/900',
];

const fetchTeamData = async (setTeamMembers: (data: TeamMember[]) => void, setLoading: (status: boolean) => void) => {
    try {
        const data = await getTeamMembers();
        setTeamMembers(data);
    } catch (error) {
        console.error("Error fetching team:", error);
    } finally {
        setLoading(false);
    }
};

const TeamMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => (
  <div className="text-center">
    <div className="relative group w-full aspect-[4/5] mb-4 overflow-hidden rounded-lg shadow-lg">
      <img
        src={member.photo.url}
        alt={member.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
      </div>
    </div>
    <h3 className="font-bold text-lg">{member.name}</h3>
    <p className="text-gray-600 text-sm">{member.role}</p>
  </div>
);

/*


*/

const CompanyCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % companyPhotos.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {companyPhotos.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`Company photo ${index + 1}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          decoding="async"
        />
      ))}
    </div>
  );
};

const AboutPage: React.FC = () => {

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeamData(setTeamMembers, setLoading);
    }, []);

  return (
    <div className="bg-brand-white text-brand-black">
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-white">
        <div className="container mx-auto px-6 mt-5">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-12">Architecture Studio</h1>
        </div>

        {/* Company Image Section */}
        <div className="relative w-full h-[60vh] flex flex-col lg:flex-row">
  {/* Left: Company Carousel - 60% on large screens */}
  <div className="relative w-full lg:w-3/5 h-full overflow-hidden">
    <div className="w-full h-full lg:[clip-path:polygon(0_0,100%_0,calc(100%-40px)_100%,0_100%)]">
      <CompanyCarousel />
    </div>
  </div>

  {/* Right: Founder Image - 40% on large screens, hidden on smaller */}
  <div className="hidden lg:block relative w-2/5 h-full overflow-hidden">
    <img
      src="https://picsum.photos/seed/company1/1600/900"
      alt="Founder Alex Rivera"
      className="w-full h-full object-cover lg:[clip-path:polygon(40px_0,100%_0,100%_100%,0_100%)]"
      loading="lazy"
      decoding="async"
    />
  </div>
</div>

      </section>

      {/* About Company Text Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-start">
          <div className="w-full lg:w-4/5 lg:pr-16 mb-8 lg:mb-0">
            <p className="text-lg text-gray-700 leading-relaxed text-justify mb-6">
              We believe that great architecture is born from a deep understanding of people and place. Our work is guided by a commitment to creating designs that are thoughtful, enduring, and responsive to the needs of our clients and the environment.
            </p>
            <hr className="w-full h-px my-6 bg-gray-200 border-0" />
            <p className="text-lg text-gray-700 leading-relaxed text-justify">
              From private residences to large-scale public buildings, our portfolio is diverse, but our approach is consistent. We embrace challenges, seek innovative solutions, and strive for a level of craft and detail that elevates the human experience.
            </p>
          </div>
          {/* Optional architectural lines design */}
          {/* <div className="hidden lg:block w-1/5 h-48 relative">
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-300"></div>
            <div className="absolute top-8 bottom-8 left-1/4 w-px bg-gray-200"></div>
            <div className="absolute top-8 bottom-8 left-3/4 w-px bg-gray-200"></div>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300"></div>
          </div> */}
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/4">
              <h2 className="text-3xl md:text-4xl font-bold lg:sticky top-32">Our Team</h2>
            </div>
            <div className="lg:w-3/4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {teamMembers.map(member => <TeamMemberCard key={member.name} member={member} />)}
            </div>
          </div>
        </div>
      </section>

      {/* Contact + Location Section */}
      <section className="py-12 md:py-16 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-center items-center gap-6 md:gap-16 text-sm">
          <a href="#" className="flex items-center space-x-3 text-gray-600 hover:text-black transition-colors">
              <MapPinIcon className="w-5 h-5 flex-shrink-0" />
              <span>35B, Vadugan thottam, Nalliyampalayam, Thindal, Erode, Tamil Nadu 638012</span>
          </a>
          <a href="tel:+15551234567" className="flex items-center space-x-3 text-gray-600 hover:text-black transition-colors">
              <PhoneIcon className="w-5 h-5 flex-shrink-0" />
              <span>(+91) 97904 44744</span>
          </a>
          <a href="mailto:contact@architectstudio.com" className="flex items-center space-x-3 text-gray-600 hover:text-black transition-colors">
              <MailIcon className="w-5 h-5 flex-shrink-0" />
              <span>contact@architectstudio.com</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
