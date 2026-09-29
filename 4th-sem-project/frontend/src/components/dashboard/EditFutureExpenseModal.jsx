import { useState, useEffect } from "react";
import { X, Save, Loader2, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

export default function EditFutureExpenseModal({ isOpen, onClose, onSuccess, expense }) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Recurring logic
  const [makeRecurring, setMakeRecurring] = useState(false);
  const [frequency, setFrequency] = useState("Monthly");
  
  const [formData, setFormData] = useState({
    amount: "",
    category_id: "",
    date: "",
    description: ""
  });

  useEffect(() => {
    if (isOpen) {
        // Load categories
        api.get("/category/getCategories.php").then(res => {
            if(res.data.success) setCategories(res.data.data);
        });
        
        // Load expense data
        if (expense) {
            setFormData({
                amount: expense.amount,
                category_id: expense.category_id,
                date: expense.date,
                description: expense.description || ""
            });
            // Reset Recurring toggles
            setMakeRecurring(false);
            setFrequency("Monthly");
        }
    }
  }, [isOpen, expense]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/expense/updateFutureExpense.php", {
        id: expense.id,
        ...formData,
        // Send recurring data to backend
        create_recurring_rule: makeRecurring,
        frequency: frequency
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm p-6 z-50 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Edit Scheduled Expense</h2>
            <button onClick={onClose}><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Category</Label>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                    value={formData.category_id}
                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                </select>
            </div>
            
            <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
            </div>

            <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </div>

            {/* --- RECURRING CONVERSION UI --- */}
            <div className="border border-blue-100 bg-blue-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Repeat className="h-4 w-4 text-blue-600" />
                        <Label className="cursor-pointer" htmlFor="recurring-switch">Convert to Recurring?</Label>
                    </div>
                    <input 
                        id="recurring-switch"
                        type="checkbox" 
                        className="h-4 w-4 accent-blue-600"
                        checked={makeRecurring}
                        onChange={(e) => setMakeRecurring(e.target.checked)}
                    />
                </div>
                
                {makeRecurring && (
                    <div className="animate-in slide-in-from-top-2 pt-2">
                        <Label className="text-xs text-gray-500 mb-1 block">Frequency</Label>
                        <select 
                            className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-xs"
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                        >
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Yearly">Yearly</option>
                        </select>
                        <p className="text-[10px] text-gray-500 mt-1">
                            This will create a new recurring rule starting from this date.
                        </p>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label>Description</Label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={16} className="mr-2"/> Save Changes</>}
            </Button>
        </form>
      </div>
    </div>
  );
}