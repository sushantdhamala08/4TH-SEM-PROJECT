import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

export default function EditBudgetRowModal({ isOpen, onClose, onSuccess, budget }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ amount: "", type: "Monthly" });

  useEffect(() => {
    if (budget) {
      setFormData({ amount: budget.amount, type: budget.type });
    }
  }, [budget]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/budget/updateBudget.php", {
        id: budget.id,
        amount: formData.amount,
        type: formData.type
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 z-50 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Edit Budget</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
            </select>
          </div>
          <Button type="submit" className="w-full bg-blue-600" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Update Budget"}
          </Button>
        </form>
      </div>
    </div>
  );
}