import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { updateAdminProfile, changeAdminPassword } from '../../services/adminService'; // 👈 Import password service
import { Lock, User, ShieldCheck } from 'lucide-react';

const AdminProfilePage: React.FC = () => {
  const { admin, setAdmin } = useAuth();
  
  // --- STATE 1: Profile Info ---
  const [formData, setFormData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    phoneNumber: admin?.phoneNumber || '',
    location: admin?.location || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // --- STATE 2: Password Change ---
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passLoading, setPassLoading] = useState(false);

  // --- HANDLERS: Profile ---
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const updatedAdmin = await updateAdminProfile(formData);
      setAdmin(updatedAdmin);
      toast.success("Profile updated successfully!");
    } catch(error: any) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  // --- HANDLERS: Password ---
  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
  };

  const handlePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 1. Check if New matches Confirm
    if (passData.newPassword !== passData.confirmPassword) {
        return toast.error("New passwords do not match!");
    }

    // 2. Check: Prevent using the same password immediately
    if (passData.currentPassword === passData.newPassword) {
        return toast.error("New password cannot be the same as the current password.");
    }

    // 3. 🔒 COMPLEXITY CHECK (Regex)
    // At least 1 Uppercase, 1 Lowercase, 1 Number, 1 Special Char, Min 8 Chars
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPasswordRegex.test(passData.newPassword)) {
        return toast.error(
            "Password must contain:\n- 1 Uppercase Letter\n- 1 Lowercase Letter\n- 1 Number\n- 1 Special Character (@$!%*?&)\n- At least 8 characters"
        );
    }

    setPassLoading(true);
    try {
      await changeAdminPassword({
          currentPassword: passData.currentPassword,
          newPassword: passData.newPassword
      });
      
      toast.success("Password changed successfully!");
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch(error: any) {
      toast.error(error.message || "Failed to change password.");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: Avatar Card --- */}
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <div className="relative mx-auto w-32 h-32">
                        <img 
                            src={admin?.avatar || `https://ui-avatars.com/api/?name=${admin?.name}&background=0D8ABC&color=fff`} 
                            alt={admin?.name} 
                            className="w-full h-full rounded-full object-cover border-4 border-gray-100 shadow-sm" 
                        />
                        <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white" title="Active"></div>
                    </div>
                </CardHeader>
                <CardContent className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">{admin?.name}</h2>
                    <p className="text-sm text-gray-500 font-medium capitalize flex items-center justify-center gap-1 mt-1">
                        <ShieldCheck size={16} className="text-blue-600"/>
                        {admin?.role.replace('_', ' ')}
                    </p>
                    <div className="mt-4 text-xs text-gray-400">
                        Member since {new Date().getFullYear()}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* --- RIGHT COLUMN: Forms --- */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Profile Information Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5"/> Profile Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Full Name" name="name" value={formData.name} onChange={handleProfileChange} />
                            <Input label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleProfileChange} />
                        </div>
                        <Input label="Email Address" name="email" value={formData.email} onChange={handleProfileChange} disabled className="bg-gray-50 cursor-not-allowed" />
                        <Input label="Location" name="location" value={formData.location} onChange={handleProfileChange} />
                        
                        <div className="pt-2 flex justify-end">
                            <Button type="submit" disabled={profileLoading} className="w-full md:w-auto">
                                {profileLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* 2. Change Password Form (NEW) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Lock className="w-5 h-5"/> Security
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePassSubmit} className="space-y-4">
                        <Input 
                            label="Current Password" 
                            name="currentPassword" 
                            type="password" 
                            value={passData.currentPassword} 
                            onChange={handlePassChange} 
                            required 
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                label="New Password" 
                                name="newPassword" 
                                type="password" 
                                value={passData.newPassword} 
                                onChange={handlePassChange} 
                                required 
                                placeholder="Min 6 chars"
                            />
                            <Input 
                                label="Confirm New Password" 
                                name="confirmPassword" 
                                type="password" 
                                value={passData.confirmPassword} 
                                onChange={handlePassChange} 
                                required 
                            />
                        </div>
                        
                        <div className="pt-2 flex justify-end">
                            <Button type="submit" variant="secondary" disabled={passLoading} className="w-full md:w-auto">
                                {passLoading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;