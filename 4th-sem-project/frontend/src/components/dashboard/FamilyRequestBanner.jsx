import { useState, useEffect } from "react";
import { Check, X, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";

export default function FamilyRequestBanner() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/family/getRequests.php");
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch family requests", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleResponse = async (linkId, action) => {
    setLoading(true);
    try {
      const res = await api.post("/family/respondRequest.php", {
        link_id: linkId,
        action: action, // 'ACCEPT' or 'REJECT'
      });

      if (res.data.success) {
        // Remove the responded request from UI
        setRequests((prev) => prev.filter((r) => r.link_id !== linkId));
      }
    } catch (error) {
      console.error("Error responding to request", error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching || requests.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {requests.map((req) => (
        <div 
          key={req.link_id} 
          className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Parent Connection Request</p>
              <p className="text-xs text-indigo-100">
                <span className="font-semibold">{req.first_name} {req.last_name}</span> ({req.email}) wants to link to your account as a parent.
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              size="sm" 
              onClick={() => handleResponse(req.link_id, 'ACCEPT')}
              className="bg-white text-indigo-600 hover:bg-indigo-50 flex-1 sm:flex-none"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => handleResponse(req.link_id, 'REJECT')}
              className="text-white hover:bg-white/10 flex-1 sm:flex-none border border-white/30"
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" />
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}