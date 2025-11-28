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
import { Navigate } from "react-router-dom";

const AdminManagementPage: React.FC = () => {
  // 1. ⚠️ RULES OF HOOKS: All hooks must be at the top level
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

  // ... Handlers (Submit, InputChange, Toggle, Delete) ...
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateAdmin(id, { isActive: !currentStatus });
      toast.success("Status updated");
      fetchAdmins();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteAdmin(id);
      toast.success("Admin deleted");
      fetchAdmins();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // Helper: Check Role
  const isSuperAdmin = currentUser?.role === "super_admin";

  // 2. 🛡️ SECURITY CHECK (SAFE ZONE)
  // We place this AFTER all hooks are declared but BEFORE the UI renders.
  // This prevents the "White Screen" / "Rendered fewer hooks" error.
  if (currentUser && !isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // 3. Render UI (Only reaches here if user IS super_admin)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Management</h1>
        {!isFormOpen && (
          <Button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-black text-white hover:bg-gray-800"
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
              <ShieldAlert className="w-5 h-5 text-blue-600" /> Create New
              Administrator
            </h3>
          </div>
          <form
            onSubmit={handleFormSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Phone"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
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
              <Button
                type="submit"
                className="bg-black text-white hover:bg-gray-800"
              >
                Create Account
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List Section */}
      <Card>
        <CardHeader>
          <CardTitle>All Administrators</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins?.map((admin) => (
                    <tr key={admin._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 uppercase">
                          {admin.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {admin.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {admin.location}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{admin.email}</td>
                      <td className="px-6 py-4 capitalize">
                        {admin.role.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            admin.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {admin.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() =>
                            handleToggleActive(admin._id, admin.isActive)
                          }
                          className="text-gray-500 hover:text-black font-medium text-xs"
                        >
                          {admin.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(admin._id)}
                          className="text-red-500 hover:text-red-700 font-medium text-xs"
                        >
                          Delete
                        </button>
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
