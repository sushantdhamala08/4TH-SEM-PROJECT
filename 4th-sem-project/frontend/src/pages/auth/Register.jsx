import { useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, User, Users } from "lucide-react";
import AuthLayout from "@/components/layout/AuthLayout";

export default function Register() {
  const [formData, setFormData] = useState({
    role: "student", // Default role
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    password: "",
    bank_name: "",       
    bank_account_no: ""  
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleRoleChange = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const nameRegex = /^[A-Za-z]+$/; 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const firstName = formData.first_name.trim();
    const lastName = formData.last_name.trim();

    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
        setMessage("Names should contain only letters.");
        return;
    }
    if (!emailRegex.test(formData.email)) {
        setMessage("Please enter a valid email.");
        return;
    }
    if (formData.password.length < 6) {
        setMessage("Password must be at least 6 characters.");
        return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) =>
        data.append(key, formData[key])
      );

      const res = await api.post("/auth/register.php", data);

      if (res.data.success) {
        navigate("/login");
      } else {
        setMessage(res.data.message || "Registration failed");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setMessage("An error occurred during registration.");
    }
  };

  const inputClasses = "bg-gray-800 border-gray-700 text-white h-12 placeholder:text-gray-500";

  return (
    <AuthLayout title="Create Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded-md">
            {message}
          </div>
        )}

        {/* --- ROLE SELECTOR TOGGLE --- */}
        <div className="flex bg-gray-800 p-1 rounded-lg mb-6 border border-gray-700">
            <button
                type="button"
                onClick={() => handleRoleChange("student")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                    formData.role === "student" 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "text-gray-400 hover:text-gray-200"
                }`}
            >
                <User size={18} /> Student (Personal)
            </button>
            <button
                type="button"
                onClick={() => handleRoleChange("parent")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                    formData.role === "parent" 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "text-gray-400 hover:text-gray-200"
                }`}
            >
                <Users size={18} /> Parent (Family)
            </button>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="text-gray-300 font-normal">First Name</Label>
            <Input id="first_name" onChange={handleChange} required className={inputClasses} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="middle_name" className="text-gray-300 font-normal">Middle Name</Label>
            <Input id="middle_name" onChange={handleChange} className={inputClasses} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name" className="text-gray-300 font-normal">Last Name</Label>
            <Input id="last_name" onChange={handleChange} required className={inputClasses} />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300 font-normal">Email</Label>
          <Input id="email" type="email" onChange={handleChange} required className={inputClasses} />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-300 font-normal">Password</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} onChange={handleChange} required className={`${inputClasses} pr-10`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white bg-transparent focus:outline-none">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Optional Bank Details (Only make sense if they want to fill them out) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="bank_name" className="text-gray-300 font-normal">Bank Name (Optional)</Label>
                <Input id="bank_name" onChange={handleChange} className={inputClasses} placeholder="e.g. NIC Asia" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="bank_account_no" className="text-gray-300 font-normal">Account No. (Optional)</Label>
                <Input id="bank_account_no" onChange={handleChange} className={inputClasses} placeholder="000..." />
            </div>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 mt-6 text-base">
          Create {formData.role === 'parent' ? 'Family' : 'Student'} Account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account? <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium">Login</Link>
      </p>
    </AuthLayout>
  );
}