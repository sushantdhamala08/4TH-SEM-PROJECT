import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

export default function AddBudgetModal({ isOpen, onClose, onSuccess, currentAmount, currentType, month, year }) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Monthly");
  
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      if (currentAmount && currentAmount > 0) {
        setAmount(currentAmount);
        setType(currentType || "Monthly");
      } else {
        setAmount("");
        setType("Monthly");
      }
    }
  }, [isOpen, currentAmount, currentType]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/budget/setbudget.php", { 
        amount: amount,
        type: type,
        month: month, // Pass the selected month from the dashboard
        year: year    // Pass the selected year from the dashboard
      });
      
      // Check success flag from backend
      if (res.data.success) {
        onSuccess();
        onClose();
        // FORCE PAGE REFRESH HERE
        window.location.reload();
      } else {
        setError(res.data.message);
      }
    } catch (error) {
      console.error("Failed to set budget", error);
      setError("An unexpected server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {currentAmount > 0 ? "Edit Budget" : "Set Budget"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Error Message Display */}
        {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="leading-5">{error}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budgetAmount">Amount (NPR)</Label>
            <Input
              id="budgetAmount"
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-50"
              placeholder="e.g. 50000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetType">Frequency</Label>
            <select
              id="budgetType"
              className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentAmount > 0 ? "Update Budget" : "Set Budget"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}