import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../admin/components/ui/Card";
import { Button } from "../../admin/components/ui/Button";
import { Input } from "../../admin/components/ui/Input";
import Spinner from "../../admin/components/ui/Spinner";
import { Admin } from "../../admin/types";
import { useAuth } from "../../hooks/useAuth";
import {
  listAdmins,
  updateAdmin,
  deleteAdmin,
  createAdmin,
} from "../../services/adminService";
import toast from "react-hot-toast";
import { UserPlus, X, ShieldAlert } from "lucide-react";

const AdminManagementPage: React.FC = () => {
  // 1. Hooks
  const { admin: currentUser } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    location: "",
    role: "admin",
  });

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAdmins();
      setAdmins(data);
    } catch (error) {
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Helper: Check Role
  const isSuperAdmin = currentUser?.role === "super_admin";

  // --- 🛡️ SECURITY GUARD: PRIVILEGED ACCESS UI ---
  if (currentUser && !isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="p-6 bg-red-50 text-red-500 rounded-full mb-6 shadow-sm border border-red-100">
          <ShieldAlert size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Privileged Access Only</h2>
        <p className="text-slate-500 mt-3 max-w-md mx-auto leading-relaxed">
          Admin account management is restricted to the <span className="font-bold text-slate-800 underline decoration-red-200 underline-offset-4">Super Admin</span> role for platform security.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="mt-8 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95"
        >
          Go Back
        </button>
      </div>
    );
  }

  // --- HANDLERS ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdmin(formData);
      toast.success("New Admin created!");
      setIsFormOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        location: "",
        role: "admin",
      });
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.message || "Failed to create admin");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (id === currentUser?._id) {
      toast.error("You cannot deactivate yourself!");
      return;
    }
    try {
      await updateAdmin(id, { isActive: !currentStatus });
      toast.success("Status updated");
      fetchAdmins();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?._id) {
      toast.error("You cannot delete your own super admin account!");
      return;
    }
    if (!window.confirm("Are you sure you want to remove this administrator?")) return;
    try {
      await deleteAdmin(id);
      toast.success("Admin deleted");
      fetchAdmins();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // --- MAIN UI ---
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Management</h1>
        {!isFormOpen && (
          <Button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-black text-white hover:bg-gray-800 rounded-xl"
          >
            <UserPlus className="w-5 h-5" /> Add New Admin
          </Button>
        )}
      </div>

      {/* Form Section */}
      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 animate-in fade-in slide-in-from-top-4 relative">
          <button
            onClick={() => setIsFormOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-black"
          >
            <X size={24} />
          </button>
          <div className="mb-6 border-b pb-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
              <ShieldAlert className="w-5 h-5 text-blue-600" /> Create New Administrator
            </h3>
          </div>
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required />
            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            <Input label="Password" name="password" type="password" value={formData.password} onChange={handleInputChange} required />
            <Input label="Phone" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required />
            <Input label="Location" name="location" value={formData.location} onChange={handleInputChange} required />
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black outline-none bg-white"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div className="col-span-full flex gap-3 mt-4">
              <Button type="submit" className="bg-black text-white hover:bg-gray-800">Create Account</Button>
              <Button type="button" variant="danger" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* List Section */}
      <Card className="rounded-2xl border-slate-100 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg">All Platform Administrators</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center"><Spinner /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admins?.map((admin) => (
                    <tr key={admin._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 uppercase border border-slate-200">
                          {admin.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{admin.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{admin.location}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{admin.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-tighter border ${
                          admin.role === 'super_admin' 
                            ? 'bg-purple-50 text-purple-700 border-purple-100' 
                            : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {admin.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-[10px] font-black rounded-full uppercase ${
                            admin.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {admin.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {admin._id === currentUser?._id ? (
                          <span className="text-[10px] font-bold text-slate-400 italic">Current Session</span>
                        ) : (
                          <div className="flex justify-end gap-4">
                            <button
                              onClick={() => handleToggleActive(admin._id, admin.isActive)}
                              className="text-slate-500 hover:text-black font-bold text-xs transition-colors"
                            >
                              {admin.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={() => handleDelete(admin._id)}
                              className="text-red-500 hover:text-red-700 font-bold text-xs transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
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

export default AdminManagementPage;