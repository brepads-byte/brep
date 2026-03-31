import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProject } from '../../services/projectAdminService';
import { Project } from '../types';
import Spinner from '../components/ui/Spinner';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '../components/ui/Button';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getProject(id)
        .then(setProject)
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  if (!project) return <div className="text-center">Project not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Link to="/admin/projects" className="p-2 rounded-full hover:bg-gray-200">
                <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold">{project.projectName}</h1>
        </div>
        <Link to={`/admin/projects/${id}/edit`}>
            <Button><Edit className="h-4 w-4 mr-2" />Edit Project</Button>
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <img src={project.mainPhoto.url} alt={project.projectName} className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-sm">
            <div><strong className="block text-gray-500">Category</strong> <span className="capitalize">{project.category}</span></div>
            <div><strong className="block text-gray-500">Location</strong> {project.location}</div>
            {project.sqft && <div><strong className="block text-gray-500">Area</strong> {project.sqft} sqft</div>}
        </div>

        <div className="prose max-w-none">
            <p>{project.description}</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.descriptionPhotos.map((photo, index) => (
                <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
                    <img src={photo.url} alt={photo.caption} className="w-full h-48 object-cover" />
                    <p className="p-3 text-sm text-gray-600">{photo.caption}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
