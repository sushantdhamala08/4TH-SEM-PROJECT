import { useState, useEffect } from "react";
import { X, Loader2, Calendar, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/api/axios";

export default function AddIncomeModal({ isOpen, onClose, onSuccess, editData }) {
  const [loading, setLoading] = useState(false);
  
  // UI Mode: 'monthly' or 'specific'
  const [dateMode, setDateMode] = useState("monthly");

  // Form States
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  
  // Date States
  const [specificDate, setSpecificDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Constants
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);
  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
    { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
    { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
  ];

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setSource(editData.source);
        setAmount(editData.amount);
        setDescription(editData.description || "");
        
        // Handle Date Logic for Edit
        const dateObj = new Date(editData.date);
        setSpecificDate(editData.date); // Set specific date input
        setSelectedMonth(dateObj.getMonth() + 1); // Set dropdowns
        setSelectedYear(dateObj.getFullYear());

        // Auto-detect mode: If it's the 1st of the month, guess "Monthly", else "Specific"
        // You can change this logic to always default to one or the other if preferred.
        if (dateObj.getDate() === 1) {
            setDateMode("monthly");
        } else {
            setDateMode("specific");
        }

      } else {
        // Reset to defaults
        setSource("");
        setAmount("");
        setDescription("");
        setDateMode("monthly");
        const today = new Date();
        setSpecificDate(today.toISOString().split('T')[0]);
        setSelectedMonth(today.getMonth() + 1);
        setSelectedYear(today.getFullYear());
      }
    }
  }, [editData, isOpen]);

  // Sync Dropdowns when Specific Date changes
  const handleSpecificDateChange = (e) => {
    const val = e.target.value;
    setSpecificDate(val);
    if(val) {
        const d = new Date(val);
        setSelectedMonth(d.getMonth() + 1);
        setSelectedYear(d.getFullYear());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let finalDate = "";

    if (dateMode === "specific") {
        // Use the exact date picker value
        finalDate = specificDate;
    } else {
        // Construct date as YYYY-MM-01
        finalDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
    }

    try {
      const url = editData ? "/income/updateIncome.php" : "/income/addIncome.php";
      const payload = {
        id: editData?.id, 
        source,
        amount,
        date: finalDate, 
        description
      };

      const res = await api.post(url, payload);
      if (res.data.success) {
        onSuccess();
        onClose();
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Submit error", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {editData ? "Edit Income" : "Add Income"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* --- MODE TOGGLE --- */}
          <div className="bg-gray-100 p-1 rounded-lg flex mb-4">
            <button
                type="button"
                onClick={() => setDateMode("monthly")}
                className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-1.5 rounded-md transition-all ${
                    dateMode === "monthly" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
                <CalendarDays size={16} /> Monthly
            </button>
            <button
                type="button"
                onClick={() => setDateMode("specific")}
                className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-1.5 rounded-md transition-all ${
                    dateMode === "specific" 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
                <Calendar size={16} /> Specific Date
            </button>
          </div>

          {/* --- DATE INPUTS --- */}
          {dateMode === "monthly" ? (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  >
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Year</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
          ) : (
              <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                <Label>Specific Date</Label>
                <Input 
                    type="date" 
                    required 
                    value={specificDate} 
                    onChange={handleSpecificDateChange} 
                    onClick={(e) => e.target.showPicker()}
                />
              </div>
          )}

          <div className="space-y-2">
            <Label>Source</Label>
            <Input 
                required 
                placeholder="e.g. Salary, Freelance, Gift" 
                value={source} 
                onChange={e => setSource(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label>Amount (NPR)</Label>
            <Input 
                type="number" 
                step="0.01" 
                required 
                placeholder="0.00" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                className="font-semibold text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Notes about this income..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                {editData ? "Update" : "Save Income"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}