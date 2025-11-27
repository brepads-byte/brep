import React, { useState, useEffect, useRef } from "react";
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../../services/teamService";
import { TeamMember } from "../types";
import { Trash2, Edit2, Plus, X, Upload, User } from "lucide-react";
import toast from "react-hot-toast";

const TeamManager: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 1. Fetch Members
  const fetchMembers = async () => {
    try {
      const data = await getTeamMembers();
      setMembers(data);
    } catch (err) {
      toast.error("Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // 2. Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Show local preview immediately
    }
  };

  // 3. Reset Form
  const resetForm = () => {
    setEditId(null);
    setName("");
    setRole("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsFormOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 4. Open Edit Mode
  const handleEditClick = (member: TeamMember) => {
    setEditId(member._id);
    setName(member.name);
    setRole(member.role);
    setPreviewUrl(member.photo.url); // Show existing Cloudinary image
    setIsFormOpen(true);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 5. Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editId ? "Updating..." : "Adding...");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("role", role);
      if (selectedFile) {
        formData.append("photo", selectedFile);
      }

      if (editId) {
        // Update
        await updateTeamMember(editId, formData);
        toast.success("Member updated successfully!", { id: loadingToast });
      } else {
        // Create
        if (!selectedFile) throw new Error("Image is required for new members");
        await createTeamMember(formData);
        toast.success("Member added successfully!", { id: loadingToast });
      }

      resetForm();
      fetchMembers();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Operation failed", { id: loadingToast });
    }
  };

  // 6. Delete
  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure? This will delete the member and their photo."
      )
    )
      return;

    try {
      await deleteTeamMember(id);
      toast.success("Member deleted");
      setMembers((prev) => prev.filter((m) => m._id !== id));
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            <Plus size={20} /> Add Member
          </button>
        )}
      </div>

      {/* --- FORM SECTION --- */}
      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-10 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {editId ? "Edit Team Member" : "Add New Member"}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-black"
            >
              <X size={24} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-8"
          >
            {/* Image Upload Area */}
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition relative overflow-hidden"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Click to upload image
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Text Fields */}
            <div className="w-full md:w-2/3 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role / Job Title
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                  placeholder="e.g. Lead Architect"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition font-medium"
                >
                  {editId ? "Update Member" : "Save Member"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* --- LIST SECTION --- */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">
          Loading team members...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.map((member) => (
            <div
              key={member._id}
              className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
            >
              {/* Image */}
              <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                <img
                  src={member.photo.url}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                {/* Overlay Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleEditClick(member)}
                    className="bg-white p-2 rounded-full text-gray-900 hover:text-blue-600 hover:scale-110 transition"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="bg-white p-2 rounded-full text-gray-900 hover:text-red-600 hover:scale-110 transition"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 text-center">
                <h3 className="font-bold text-lg text-gray-900">
                  {member.name}
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  {member.role}
                </p>
              </div>
            </div>
          ))}

          {members.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <User size={48} className="mx-auto mb-4 opacity-20" />
              <p>No team members found.</p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="text-black font-semibold mt-2 underline"
              >
                Add your first member
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamManager;
