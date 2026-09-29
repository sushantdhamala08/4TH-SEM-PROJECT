import { useState, useEffect } from "react";
import { X, Loader2, Check, Upload, Image as ImageIcon, Repeat } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Removed Switch import

import api from "@/api/axios";

export default function AddExpenseModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeSubCategories, setActiveSubCategories] = useState([]);
  
  // UI States
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [newSubCategoryName, setNewSubCategoryName] = useState("");

  // --- RECURRING STATE ---
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("Monthly");

  // Files State
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [formData, setFormData] = useState({
    amount: "",
    category_id: "", 
    sub_category_id: "", 
    date: new Date().toISOString().split('T')[0],
    source: "Cash",
    description: ""
  });

  useEffect(() => {
    if (isOpen) {
        fetchCategories();
        // Reset Recurring state on open
        setIsRecurring(false);
        setFrequency("Monthly");
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/category/getCategories.php");
      if (res.data.success) {
        setCategories(res.data.data);
        if (!formData.category_id && res.data.data.length > 0) {
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

  const handleSubCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "ADD_NEW_SUB") setIsAddingSubCategory(true);
    else setFormData({ ...formData, sub_category_id: value });
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
        setCategories(prevCats => prevCats.map(cat => {
            if (cat.id == formData.category_id) {
                return { ...cat, sub_categories: [...(cat.sub_categories || []), newSub] };
            }
            return cat;
        }));
        setIsAddingSubCategory(false);
        setNewSubCategoryName("");
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleFileChange = (e) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRecurring) {
        // --- RECURRING LOGIC ---
        await api.post("/expense/addRecurring.php", {
          amount: formData.amount,
          category_id: formData.category_id,
          sub_category_id: formData.sub_category_id,
          start_date: formData.date, // User selected date becomes start date
          frequency: frequency,
          source: formData.source,
          description: formData.description
        });
      } else {
        // --- NORMAL LOGIC ---
        const submitData = new FormData();
        submitData.append('amount', formData.amount);
        submitData.append('category_id', formData.category_id);
        submitData.append('sub_category_id', formData.sub_category_id);
        submitData.append('date', formData.date);
        submitData.append('source', formData.source);
        submitData.append('description', formData.description);

        selectedFiles.forEach((file) => submitData.append('bills[]', file));

        await api.post("/expense/addExpense.php", submitData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
      }

      onSuccess();
      onClose();
      // Reset form
      setFormData({ amount: "", category_id: "", sub_category_id: "", date: new Date().toISOString().split('T')[0], source: "Cash", description: "" });
      setSelectedFiles([]);
      setIsRecurring(false);
    } catch (error) {
      console.error("Failed to add expense", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 z-50 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Add New Expense</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
           {/* --- RECURRING TOGGLE --- */}
           <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                <div className="flex items-center gap-2">
                    <Repeat className="text-blue-600 h-5 w-5" />
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Recurring Payment?</p>
                        <p className="text-xs text-gray-500">e.g. Rent, Subscription, Salary</p>
                    </div>
                </div>
                {/* Standard Checkbox */}
                <input 
                    type="checkbox" 
                    className="h-5 w-5 accent-blue-600 cursor-pointer"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                />
           </div>

           {/* --- AMOUNT --- */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Amount (NPR)</Label>
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

          {/* --- CONDITIONAL DATE / FREQUENCY --- */}
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                    {isRecurring ? "Start Date" : "Date"}
                </Label>
                <Input 
                    type="date" 
                    required 
                    value={formData.date} 
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                    className="block w-full" 
                    onClick={(e) => e.target.showPicker()} 
                />
              </div>

              {isRecurring && (
                  <div className="space-y-2 animate-in slide-in-from-left-2">
                    <Label className="text-sm font-medium text-gray-700">Frequency</Label>
                    <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

          {/* --- CATEGORIES --- */}
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Category</Label>
                {!isAddingCategory ? (
                    <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.category_id} 
                        onChange={handleCategoryChange}
                    >
                        {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.category_name}</option>)}
                        <option disabled>──────────</option>
                        <option value="ADD_NEW_CAT" className="font-bold text-blue-600">+ New Category</option>
                    </select>
                ) : (
                    <div className="flex gap-1">
                        <Input placeholder="New..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} autoFocus className="h-10 text-xs" />
                        <Button type="button" size="icon" onClick={handleAddNewCategory} disabled={loading} className="h-10 w-10 bg-green-600"><Check size={14} /></Button>
                        <Button type="button" variant="ghost" size="icon" className="h-10 w-8" onClick={() => setIsAddingCategory(false)}><X size={14} /></Button>
                    </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Sub Category</Label>
                {!isAddingSubCategory ? (
                    <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.sub_category_id} 
                        onChange={handleSubCategoryChange}
                    >
                        <option value="">-- None --</option>
                        {activeSubCategories.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                        <option disabled>──────────</option>
                        <option value="ADD_NEW_SUB" className="font-bold text-purple-600">+ New Sub</option>
                    </select>
                ) : (
                     <div className="flex gap-1">
                        <Input placeholder="New..." value={newSubCategoryName} onChange={(e) => setNewSubCategoryName(e.target.value)} autoFocus className="h-10 text-xs border-purple-500" />
                        <Button type="button" size="icon" onClick={handleAddNewSubCategory} disabled={loading} className="h-10 w-10 bg-purple-600"><Check size={14} /></Button>
                        <Button type="button" variant="ghost" size="icon" className="h-10 w-8" onClick={() => setIsAddingSubCategory(false)}><X size={14} /></Button>
                    </div>
                )}
              </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Payment Source</Label>
            <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.source} 
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            >
                <option value="Cash">Cash</option>
                <option value="Online">Online / Digital</option>
                <option value="Cheque">Cheque</option>
            </select>
          </div>

          {/* Hide file upload for recurring templates */}
          {!isRecurring && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Receipt / Bill Photos</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                    <Input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        onChange={handleFileChange} 
                    />
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Upload className="h-6 w-6 text-gray-400" />
                        <span className="text-xs">Click to upload photos</span>
                    </div>
                </div>
                {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {selectedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100">
                                <ImageIcon size={12} />
                                <span className="max-w-[200px] truncate">{file.name}</span>
                            </div>
                        ))}
                    </div>
                )}
              </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Description</Label>
            <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Details about this expense..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
              {isRecurring ? "Set Recurring" : "Save Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}