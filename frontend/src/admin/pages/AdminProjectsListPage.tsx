import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { listProjects, deleteProject } from '../../services/projectAdminService';
import type { Project } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import toast from 'react-hot-toast';

const AdminProjectsListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProjects = async () => {
    try {
      const data = await listProjects();
      setProjects(data);
    } catch (error) {
      toast.error('Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        toast.success('Project deleted successfully.');
        fetchProjects(); // Refresh list
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete project.');
      }
    }
  };
  
  const filteredProjects = useMemo(() => {
    return projects.filter(p =>
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link to="/admin/projects/new">
          <Button>Add New Project</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
           <div className="mt-4">
                <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Thumbnail</th>
                    <th scope="col" className="px-6 py-3">Project Name</th>
                    <th scope="col" className="px-6 py-3">Category</th>
                    <th scope="col" className="px-6 py-3">Created At</th>
                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map(project => (
                    <tr key={project._id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <img src={project.mainPhoto.url} alt={project.projectName} className="h-10 w-16 object-cover rounded-md" />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{project.projectName}</td>
                      <td className="px-6 py-4 capitalize">{project.category}</td>
                      <td className="px-6 py-4">{new Date(project.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link to={`/admin/projects/${project._id}`} className="font-medium text-gray-600 hover:underline">View</Link>
                        <Link to={`/admin/projects/${project._id}/edit`} className="font-medium text-admin-accent hover:underline">Edit</Link>
                        <button onClick={() => handleDelete(project._id)} className="font-medium text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProjectsListPage;
