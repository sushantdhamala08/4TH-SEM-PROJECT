import { useState, useEffect } from "react";
import { X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

export default function ProcessFutureExpenseModal({ isOpen, onClose, onSuccess, expense }) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (expense) setAmount(expense.amount);
  }, [expense]);

  if (!isOpen || !expense) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Use the confirmFuture.php endpoint
      await api.post("/expense/confirmFuture.php", {
        id: expense.id,
        amount: amount, // Send updated amount if changed
        date: new Date().toISOString().split('T')[0] // Set to today
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm p-6 z-50">
        <h2 className="text-lg font-bold mb-4">Confirm & Add to Expenses</h2>
        <p className="text-sm text-gray-500 mb-4">You are moving <b>{expense.category_name}</b> to your actual expense list.</p>
        
        <div className="space-y-4">
          <div>
            <Label>Final Amount (NPR)</Label>
            <Input value={amount} onChange={e => setAmount(e.target.value)} type="number" />
          </div>
          
          <Button onClick={handleConfirm} className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Check size={18} className="mr-2"/>}
            Confirm & Add to List
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">Cancel</Button>
        </div>
      </div>
    </div>
  );
}