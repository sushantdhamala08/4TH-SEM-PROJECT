import { useState } from "react";
import { X, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

export default function LinkStudentModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/family/linkStudent.php", { student_email: email });
      if (res.data.success) {
        onSuccess(res.data.message);
        setEmail("");
        onClose();
      } else {
        setError(res.data.message);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-50 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Link a Student</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Enter your child's email address. They will receive a request to link their account to yours.
        </p>

        {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentEmail">Student Email</Label>
            <Input 
                id="studentEmail"
                type="email" 
                required 
                placeholder="student@example.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="h-11"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Send size={16} className="mr-2" />}
                Send Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}