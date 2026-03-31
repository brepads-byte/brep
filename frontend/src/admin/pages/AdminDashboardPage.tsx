import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, PlusCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { listProjects } from '../../services/projectAdminService';
import { listAdmins } from '../../services/adminService';
import Spinner from '../components/ui/Spinner';
import { Project } from '../types';

const AdminDashboardPage: React.FC = () => {
  const [projectCount, setProjectCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projects, admins] = await Promise.all([listProjects(), listAdmins()]);
        setProjectCount(projects.length);
        setAdminCount(admins.length);
        setRecentProjects(projects.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
         <Card>
           <CardHeader>
             <CardTitle>Quick Actions</CardTitle>
           </CardHeader>
           <CardContent className="flex flex-col space-y-4">
             <Link to="/admin/projects/new" className="flex items-center p-3 -m-3 rounded-lg hover:bg-gray-100 transition-colors">
               <PlusCircle className="h-6 w-6 mr-4 text-admin-accent" />
               <div>
                 <p className="font-semibold">Create New Project</p>
                 <p className="text-sm text-gray-500">Add a new project to the portfolio.</p>
               </div>
             </Link>
           </CardContent>
         </Card>
         <Card>
          <CardHeader><CardTitle>Recent Projects</CardTitle></CardHeader>
          <CardContent>
            {recentProjects.length > 0 ? (
              <ul className="space-y-4">
                {recentProjects.map(p => (
                  <li key={p._id} className="flex items-center">
                    <img src={p.mainPhoto.url} alt={p.projectName} className="h-12 w-12 rounded-md object-cover mr-4" />
                    <div className="flex-1">
                      <p className="font-semibold">{p.projectName}</p>
                      <p className="text-sm text-gray-500">{p.location}</p>
                    </div>
                    <Link to={`/admin/projects/${p._id}/edit`} className="text-sm font-medium text-admin-accent hover:underline">Edit</Link>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-gray-500">No projects found.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
