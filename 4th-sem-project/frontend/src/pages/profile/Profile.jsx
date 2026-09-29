import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Save, Loader2, CreditCard, Pencil, X, Activity, Users, Link as LinkIcon, Unlink } from "lucide-react";
import api from "@/api/axios";

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Profile Data
  const [formData, setFormData] = useState({
    first_name: "", middle_name: "", last_name: "", email: "", role: "", bank_name: "", bank_account_no: "", family_links: []
  });
  const [originalData, setOriginalData] = useState({});
  const [passData, setPassData] = useState({ current_password: "", new_password: "", confirm_password: "" });

  // Logs Data
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchLogs();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/user/getProfile.php");
      if (res.data.success) {
        setFormData(res.data.data);
        setOriginalData(res.data.data);
      }
    } catch (e) { console.error(e); }
  };

  const fetchLogs = async () => {
    try {
        const res = await api.get("/user/getLogs.php");
        if (res.data.success) {
            setLogs(res.data.data);
        }
    } catch (e) { console.error("Failed to load logs", e); }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/user/updateProfile.php", formData);
      setOriginalData(formData);
      setIsEditing(false);
      alert("Profile updated!");
    } catch (e) { 
        alert("Failed to update"); 
    } finally { 
        setLoading(false); 
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    if (passData.new_password !== passData.confirm_password) {
        alert("New passwords do not match!");
        return;
    }
    setPassLoading(true);
    try {
      const res = await api.post("/user/changePassword.php", passData);
      if(res.data.success) {
        alert("Password changed!");
        setPassData({ current_password: "", new_password: "", confirm_password: "" });
      } else {
        alert(res.data.message);
      }
    } catch (e) { alert("Error changing password"); } finally { setPassLoading(false); }
  };

  // --- NEW: Handle Unlinking a Parent ---
  const handleUnlinkParent = async (parentId, parentName) => {
    if (!window.confirm(`Are you sure you want to unlink ${parentName}? They will lose access to your financial data.`)) return;

    try {
        const res = await api.post("/family/unlinkParent.php", { parent_id: parentId });
        if (res.data.success) {
            fetchProfile(); // Refresh the profile to remove the parent from the UI
        } else {
            alert(res.data.message);
        }
    } catch (error) {
        console.error("Failed to unlink parent", error);
        alert("An error occurred while unlinking.");
    }
  };

  const renderField = (label, key, placeholder = "") => (
    <div>
        <Label className="text-gray-500 text-xs uppercase font-bold tracking-wider">{label}</Label>
        {isEditing ? (
            <Input 
                value={formData[key] || ""} 
                onChange={e => setFormData({...formData, [key]: e.target.value})} 
                placeholder={placeholder}
                className="mt-1"
            />
        ) : (
            <div className="mt-1 p-2 bg-gray-50 border border-gray-100 rounded-md text-gray-900 min-h-[40px] flex items-center">
                {formData[key] || <span className="text-gray-400 italic">Not provided</span>}
            </div>
        )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-10">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>

        {/* FAMILY CONNECTION CARD */}
        {formData.role === 'student' && (
            <Card className="border-l-4 border-l-purple-500 shadow-sm">
                <CardHeader className="pb-3 bg-purple-50/30">
                    <CardTitle className="flex items-center gap-2 text-lg text-purple-800">
                        <Users className="h-5 w-5"/> Family Connection
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {formData.family_links && formData.family_links.length > 0 ? (
                        <div className="space-y-3">
                            {formData.family_links.map((link, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                                            {link.first_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 flex items-center gap-2">
                                                {link.first_name} {link.last_name}
                                                <LinkIcon size={14} className="text-gray-400"/>
                                            </p>
                                            <p className="text-sm text-gray-500">{link.email} • Parent</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {link.status === 'ACTIVE' ? (
                                            <span className="bg-green-100 text-green-700 px-3 py-1 text-xs font-bold uppercase rounded-full border border-green-200">
                                                Active Link
                                            </span>
                                        ) : (
                                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 text-xs font-bold uppercase rounded-full border border-yellow-200">
                                                Pending Request
                                            </span>
                                        )}
                                        
                                        {/* --- NEW: UNLINK BUTTON --- */}
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleUnlinkParent(link.parent_id, link.first_name)}
                                            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                            title="Unlink Parent"
                                        >
                                            <Unlink size={18} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <Unlink className="h-8 w-8 text-gray-300 mb-2" />
                            <p className="text-gray-500 font-medium">Not Linked to any Family</p>
                            <p className="text-xs text-gray-400 mt-1">Ask your parent to send a link request using your email address.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
            
            {/* 1. PERSONAL INFO CARD */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5 text-blue-600"/> Personal Information
                    </CardTitle>
                    {!isEditing && (
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                            <Pencil size={16} className="mr-2" /> Edit Details
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleInfoSubmit} className="space-y-6">
                        {/* Name Section */}
                        <div className="grid grid-cols-3 gap-3">
                            {renderField("First Name", "first_name")}
                            {renderField("Middle Name", "middle_name")}
                            {renderField("Last Name", "last_name")}
                        </div>

                        <div>
                            <Label className="text-gray-500 text-xs uppercase font-bold tracking-wider">Email Address</Label>
                            <div className="mt-1 p-2 bg-blue-50/50 border border-blue-100 text-blue-800 rounded-md flex items-center">
                                {formData.email}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                        </div>
                        
                        {/* Bank Section */}
                        <div className="pt-4 border-t">
                            <Label className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
                                <CreditCard size={16} className="text-blue-600"/> Banking Details
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                                {renderField("Bank Name", "bank_name", "e.g. NIC Asia")}
                                {renderField("Account No", "bank_account_no", "0000...")}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex gap-3 pt-2 animate-in fade-in slide-in-from-top-2">
                                <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>
                                    <X size={16} className="mr-2"/> Cancel
                                </Button>
                                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin mr-2"/> : <Save size={16} className="mr-2"/>}
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* 2. SECURITY CARD */}
            <Card className="h-fit">
                <CardHeader className="border-b pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Lock className="h-5 w-5 text-orange-600"/> Security
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handlePassSubmit} className="space-y-4">
                        <div>
                            <Label>Current Password</Label>
                            <Input type="password" required value={passData.current_password} onChange={e=>setPassData({...passData, current_password:e.target.value})} className="mt-1"/>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>New Password</Label>
                                <Input type="password" required value={passData.new_password} onChange={e=>setPassData({...passData, new_password:e.target.value})} className="mt-1"/>
                            </div>
                            <div>
                                <Label>Confirm Password</Label>
                                <Input type="password" required value={passData.confirm_password} onChange={e=>setPassData({...passData, confirm_password:e.target.value})} className="mt-1"/>
                            </div>
                        </div>
                        
                        <div className="pt-2">
                            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={passLoading}>
                                {passLoading ? <Loader2 className="animate-spin mr-2"/> : "Update Password"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>

        {/* 3. SYSTEM ACTIVITY LOG */}
        <Card className="mt-6">
           <CardHeader className="border-b pb-4">
               <CardTitle className="flex items-center gap-2 text-lg">
                   <Activity className="h-5 w-5 text-gray-700"/> System Activity Log
               </CardTitle>
           </CardHeader>
           <CardContent className="pt-6">
               <div className="h-64 overflow-y-auto custom-scrollbar border rounded-lg bg-gray-50/50 p-3">
                   {logs.length > 0 ? (
                       <div className="space-y-3">
                           {logs.map((log, i) => (
                               <div key={i} className="flex justify-between items-center text-sm p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                   <div className="flex items-center gap-3">
                                       <div className={`w-2 h-2 rounded-full ${
                                           log.action.includes('ADDED') ? 'bg-green-500' : 
                                           log.action.includes('SCHEDULED') ? 'bg-yellow-500' :
                                           log.action.includes('CONFIRMED') ? 'bg-blue-500' : 'bg-gray-400'
                                       }`}></div>
                                       <div>
                                           <span className="font-semibold text-gray-800 block capitalize">{log.action.toLowerCase().replace('_', ' ')}</span>
                                           <span className="text-gray-500 text-xs">{log.details}</span>
                                       </div>
                                   </div>
                                   <span className="text-xs text-gray-400 font-medium whitespace-nowrap bg-gray-50 px-2 py-1 rounded">
                                       {new Date(log.created_at).toLocaleString()}
                                   </span>
                               </div>
                           ))}
                       </div>
                   ) : (
                       <div className="h-full flex flex-col items-center justify-center text-gray-400">
                           <Activity className="h-8 w-8 mb-2 opacity-20" />
                           <p>No system activity recorded yet.</p>
                       </div>
                   )}
               </div>
           </CardContent>
       </Card>

      </div>
    </DashboardLayout>
  );
}