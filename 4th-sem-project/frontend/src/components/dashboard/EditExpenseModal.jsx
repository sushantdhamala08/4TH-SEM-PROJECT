import { useState, useEffect } from "react";
import { X, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

export default function EditExpenseModal({ isOpen, onClose, onSuccess, expense }) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeSubCategories, setActiveSubCategories] = useState([]);
  
  // Files State
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [formData, setFormData] = useState({
    amount: "",
    category_id: "",
    sub_category_id: "",
    date: "",
    description: ""
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get("/category/getCategories.php");
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (e) { console.error(e); }
    };
    if (isOpen) {
        fetchCats();
        setSelectedFiles([]); // Reset files on open
    }
  }, [isOpen]);

  useEffect(() => {
    if (expense && categories.length > 0) {
      setFormData({
        amount: expense.amount,
        category_id: expense.category_id,
        sub_category_id: expense.sub_category_id || "",
        date: expense.date,
        description: expense.description || ""
      });
      
      const selectedCat = categories.find(c => c.id == expense.category_id);
      setActiveSubCategories(selectedCat?.sub_categories || []);
    }
  }, [expense, categories, isOpen]);

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const selectedCat = categories.find(c => c.id == catId);
    setFormData({ ...formData, category_id: catId, sub_category_id: "" });
    setActiveSubCategories(selectedCat?.sub_categories || []);
  };

  const handleFileChange = (e) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use FormData to support file uploads
      const submitData = new FormData();
      submitData.append('id', expense.id);
      submitData.append('amount', formData.amount);
      submitData.append('category_id', formData.category_id);
      submitData.append('sub_category_id', formData.sub_category_id);
      submitData.append('date', formData.date);
      submitData.append('description', formData.description);

      // Append selected files
      selectedFiles.forEach((file) => submitData.append('bills[]', file));

      await api.post("/expense/updateExpense.php", submitData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 z-50 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Edit Expense</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required className="text-lg font-semibold" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3" value={formData.category_id} onChange={handleCategoryChange}>
                 {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Sub Category</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3" value={formData.sub_category_id} onChange={e => setFormData({...formData, sub_category_id: e.target.value})}>
                 <option value="">-- None --</option>
                 {activeSubCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" 
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})} 
              onClick={(e) => e.target.showPicker()} 
              required
            />
          </div>

          {/* New Image Upload Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Update Receipt / Bill Photo</Label>
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
                    <span className="text-xs">Click to upload new photos (replaces old)</span>
                </div>
            </div>
            {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100">
                            <ImageIcon size={12} />
                            <span className="max-w-50 truncate">{file.name}</span>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
             <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
             <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
               {loading ? <Loader2 className="animate-spin" /> : "Update Expense"}
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
}