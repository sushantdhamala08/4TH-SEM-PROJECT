import { useState, useEffect } from "react";
import { X, Loader2, Check, Calendar, Repeat } from "lucide-react"; // Added Repeat
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

export default function ScheduleExpenseModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeSubCategories, setActiveSubCategories] = useState([]);
  
  // UI States
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [newSubCategoryName, setNewSubCategoryName] = useState("");

  // --- NEW: Recurring State ---
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("Monthly");

  const [formData, setFormData] = useState({
    amount: "",
    category_id: "", 
    sub_category_id: "", 
    date: "", 
    source: "Cash",
    description: ""
  });

  useEffect(() => {
    if (isOpen) {
        fetchCategories();
        // Default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setFormData(prev => ({ ...prev, date: tomorrow.toISOString().split('T')[0] }));
        
        // Reset Recurring
        setIsRecurring(false);
        setFrequency("Monthly");
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/category/getCategories.php");
      if (res.data.success) {
        setCategories(res.data.data);
        if (res.data.data.length > 0) {
            handleMainCategorySelect(res.data.data[0].id, res.data.data);
        }
      }
    } catch (error) { console.error(error); }
  };

  const handleMainCategorySelect = (catId, allCategories = categories) => {
    const selectedCat = allCategories.find(c => c.id == catId);
    setFormData(prev => ({ ...prev, category_id: catId, sub_category_id: "" }));
    setActiveSubCategories(selectedCat?.sub_categories || []);
    setIsAddingSubCategory(false);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "ADD_NEW_CAT") setIsAddingCategory(true);
    else handleMainCategorySelect(value);
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/category/addCategory.php", { name: newCategoryName });
      if (res.data.success) {
        const newCat = { id: res.data.data.id, category_name: res.data.data.name, sub_categories: [] };
        const updatedList = [...categories, newCat];
        setCategories(updatedList);
        handleMainCategorySelect(newCat.id, updatedList);
        setIsAddingCategory(false);
        setNewCategoryName("");
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleAddNewSubCategory = async () => {
    if (!newSubCategoryName.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/category/addSubCategory.php", { 
        category_id: formData.category_id,
        name: newSubCategoryName 
      });
      if (res.data.success) {
        const newSub = { id: res.data.data.id, name: res.data.data.name };
        setActiveSubCategories(prev => [...prev, newSub]);
        setFormData(prev => ({...prev, sub_category_id: newSub.id}));
        setIsAddingSubCategory(false);
        setNewSubCategoryName("");
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Date Validation
    if (new Date(formData.date) <= new Date().setHours(0,0,0,0)) {
        alert("Please select a future date.");
        return;
    }

    setLoading(true);
    try {
      if (isRecurring) {
        // --- 1. Call Add Recurring Endpoint ---
        await api.post("/expense/addRecurring.php", {
           ...formData,
           start_date: formData.date,
           frequency: frequency
        });
      } else {
        // --- 2. Call Standard Add Endpoint (which handles future logic internally) ---
        await api.post("/expense/addExpense.php", formData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Scheduling failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-50 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="text-blue-600" size={22} /> Schedule Future Expense
          </h2>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
           {/* --- RECURRING TOGGLE --- */}
           <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                <div className="flex items-center gap-2">
                    <Repeat className="text-blue-600 h-5 w-5" />
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Recurring Schedule?</p>
                        <p className="text-xs text-gray-500">Auto-generate this bill every cycle</p>
                    </div>
                </div>
                <input 
                    type="checkbox" 
                    className="h-5 w-5 accent-blue-600 cursor-pointer"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                />
           </div>

          <div className="space-y-2">
            <Label>Amount (NPR)</Label>
            <Input 
                type="number" 
                step="0.01" 
                required 
                value={formData.amount} 
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                placeholder="0.00" 
                className="text-lg font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>{isRecurring ? "Start Date" : "Future Date"}</Label>
                <Input 
                    type="date" 
                    required 
                    value={formData.date} 
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                    onClick={(e) => e.target.showPicker()} 
                />
            </div>

            {isRecurring && (
                  <div className="space-y-2 animate-in slide-in-from-left-2">
                    <Label>Frequency</Label>
                    <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                    >
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                    </select>
                  </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                {!isAddingCategory ? (
                    <select 
                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                        value={formData.category_id} 
                        onChange={handleCategoryChange}
                    >
                        {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.category_name}</option>)}
                        <option value="ADD_NEW_CAT" className="font-bold text-blue-600">+ New Category</option>
                    </select>
                ) : (
                    <div className="flex gap-1">
                        <Input placeholder="New..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="h-10" />
                        <Button type="button" size="icon" onClick={handleAddNewCategory} className="bg-green-600"><Check size={14} /></Button>
                    </div>
                )}
              </div>

              {/* Sub-Category */}
              <div className="space-y-2">
                <Label>Sub Category</Label>
                {!isAddingSubCategory ? (
                    <select 
                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                        value={formData.sub_category_id} 
                        onChange={(e) => {
                            if(e.target.value === "ADD_NEW_SUB") setIsAddingSubCategory(true);
                            else setFormData({ ...formData, sub_category_id: e.target.value });
                        }}
                    >
                        <option value="">-- None --</option>
                        {activeSubCategories.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                        <option value="ADD_NEW_SUB" className="font-bold text-purple-600">+ New Sub</option>
                    </select>
                ) : (
                     <div className="flex gap-1">
                        <Input placeholder="New..." value={newSubCategoryName} onChange={(e) => setNewSubCategoryName(e.target.value)} className="h-10" />
                        <Button type="button" size="icon" onClick={handleAddNewSubCategory} className="bg-purple-600"><Check size={14} /></Button>
                    </div>
                )}
              </div>
          </div>

          <div className="space-y-2">
            <Label>Planned Payment Source</Label>
            <select 
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                value={formData.source} 
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            >
                <option value="Cash">Cash</option>
                <option value="Online">Online / Digital</option>
                <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Description / Notes</Label>
            <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="What is this future payment for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} 
              {isRecurring ? "Set Recurring Schedule" : "Schedule Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}