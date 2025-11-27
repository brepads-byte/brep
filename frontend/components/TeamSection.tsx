import React, { useEffect, useState } from 'react';
import { getTeamMembers } from '../services/teamService';
import { TeamMember } from '../types';

const TeamSection: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTeamMembers();
        setMembers(data);
      } catch (error) {
        console.error("Failed to fetch team", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20">Loading team...</div>;
  
  // If no members exist, hide the section entirely
  if (members.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-12">Our Team</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {members.map((member) => (
            <div key={member._id} className="group">
              {/* Image Card */}
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 mb-4">
                <img 
                  src={member.photo.url} 
                  alt={member.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" 
                />
              </div>
              
              {/* Text Info */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-1">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;