import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function SetMonthlyBudgetModal({ isOpen, onClose, onSuccess, monthData, year }) {
  const [weeks, setWeeks] = useState({ w1: "", w2: "", w3: "", w4: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (monthData) {
        // If specific weeks exist, use them. If not, but total exists, distribute evenly (legacy support)
        if (monthData.amount > 0 && monthData.week1 === 0 && monthData.week2 === 0) {
            const avg = (monthData.amount / 4).toFixed(2);
            setWeeks({ w1: avg, w2: avg, w3: avg, w4: avg });
        } else {
            setWeeks({
                w1: monthData.week1 || "",
                w2: monthData.week2 || "",
                w3: monthData.week3 || "",
                w4: monthData.week4 || ""
            });
        }
    }
  }, [monthData, isOpen]);

  if (!isOpen || !monthData) return null;

  // Calculate total for display
  const total = [weeks.w1, weeks.w2, weeks.w3, weeks.w4].reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/budget/setMonthlyPlan.php", {
        year,
        month: monthData.month,
        week1: weeks.w1 || 0,
        week2: weeks.w2 || 0,
        week3: weeks.w3 || 0,
        week4: weeks.w4 || 0
      });
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setWeeks(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm p-6 z-50 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{MONTHS[monthData.month]} Plan</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <Label className="text-xs text-gray-500">Week 1</Label>
                <Input type="number" value={weeks.w1} onChange={e => handleChange('w1', e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1">
                <Label className="text-xs text-gray-500">Week 2</Label>
                <Input type="number" value={weeks.w2} onChange={e => handleChange('w2', e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1">
                <Label className="text-xs text-gray-500">Week 3</Label>
                <Input type="number" value={weeks.w3} onChange={e => handleChange('w3', e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1">
                <Label className="text-xs text-gray-500">Week 4</Label>
                <Input type="number" value={weeks.w4} onChange={e => handleChange('w4', e.target.value)} placeholder="0" />
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center border border-blue-100">
             <span className="text-sm font-medium text-blue-800">Total Monthly:</span>
             <span className="text-xl font-bold text-blue-700">NPR {total.toLocaleString()}</span>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Save Plan
          </Button>
        </form>
      </div>
    </div>
  );
}