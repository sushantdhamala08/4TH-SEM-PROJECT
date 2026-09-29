import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function SetMonthlyIncomeModal({ isOpen, onClose, onSuccess, monthData, year }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (monthData) {
        setAmount(monthData.amount > 0 ? monthData.amount : "");
    }
  }, [monthData, isOpen]);

  if (!isOpen || !monthData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/income/setMonthlyPlan.php", {
        year,
        month: monthData.month,
        amount: amount || 0
      });
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm p-6 z-50 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{MONTHS[monthData.month]} Goal</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Monthly Goal (NPR)</Label>
            <Input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                placeholder="0.00" 
                autoFocus
                className="text-lg font-medium"
            />
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
             <p className="text-sm text-green-800">
                This amount contributes to your <strong>Yearly Total</strong>.
             </p>
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Save Goal
          </Button>
        </form>
      </div>
    </div>
  );
}