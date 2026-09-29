import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Wallet, Search, X, Filter, Eye } from "lucide-react"; // <-- Added Eye
import api from "@/api/axios";
import AddExpenseModal from "@/components/dashboard/AddExpenseModal";
import EditExpenseModal from "@/components/dashboard/EditExpenseModal";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // --- NEW: Image Viewer States ---
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewingBills, setViewingBills] = useState([]);

  const fetchExpenses = useCallback(async (start = "", end = "") => {
    setLoading(true);
    try {
      let url = "/expense/getAllExpenses.php";
      if (start && end) url += `?start_date=${start}&end_date=${end}`;
      const res = await api.get(url);
      if (res.data.status) setExpenses(res.data.data);
    } catch (error) {
      console.error("Failed to load expenses", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleFilter = () => {
    if (startDate && endDate) fetchExpenses(startDate, endDate);
    else alert("Please select both Start and End dates");
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    fetchExpenses();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await api.post("/expense/deleteExpense.php", { id });
      fetchExpenses(startDate, endDate);
    } catch (error) { console.error(error); }
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setIsEditOpen(true);
  };

  // --- NEW: Open Image Viewer ---
  const handleViewImage = (bills) => {
    setViewingBills(bills);
    setIsViewerOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Expenses</h1>
                <p className="text-muted-foreground">Manage and filter your transactions.</p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-end sm:items-center">
            <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">From</span>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} onClick={(e) => e.target.showPicker()} className="bg-gray-50 border-gray-200 cursor-pointer" />
                </div>
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To</span>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} onClick={(e) => e.target.showPicker()} className="bg-gray-50 border-gray-200 cursor-pointer" />
                </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-5">
                <Button onClick={handleFilter} className="flex-1 sm:flex-none text-white hover:bg-blue-700"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
                {(startDate || endDate) && (
                    <Button variant="outline" onClick={handleReset} className="flex-1 sm:flex-none text-red-600 hover:text-red-700 border-red-100 hover:bg-red-50"><X className="mr-2 h-4 w-4" /> Reset</Button>
                )}
            </div>
        </div>

        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-gray-500" /> Transaction History</CardTitle></CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mb-2 mx-auto"></div><p className="text-gray-400">Loading expenses...</p></div>
                ) : expenses.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                        <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No expenses found.</p>
                    </div>
                ) : (
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="bg-gray-50/50 border-b">
                                <tr>
                                    <th className="h-12 px-4 font-medium text-gray-500">Date</th>
                                    <th className="h-12 px-4 font-medium text-gray-500">Category</th>
                                    <th className="h-12 px-4 font-medium text-gray-500">Description</th>
                                    <th className="h-12 px-4 font-medium text-gray-500 text-right">Amount</th>
                                    <th className="h-12 px-4 font-medium text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((txn) => (
                                    <tr key={txn.id} className="border-b transition-colors hover:bg-gray-50">
                                        <td className="p-4 align-middle whitespace-nowrap">{txn.date}</td>
                                        <td className="p-4 align-middle font-medium text-blue-600">{txn.category_name}</td>
                                        <td className="p-4 align-middle text-gray-500 max-w-50 truncate">{txn.description}</td>
                                        <td className="p-4 align-middle text-right font-bold text-red-600 whitespace-nowrap">- NPR {parseFloat(txn.amount).toLocaleString()}</td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* --- NEW: Image Viewer Icon --- */}
                                                {txn.bills && txn.bills.length > 0 && (
                                                    <Button variant="ghost" size="icon" onClick={() => handleViewImage(txn.bills)} title="View Receipt">
                                                        <Eye className="h-4 w-4 text-green-600" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(txn)}>
                                                    <Pencil className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(txn.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* --- NEW: Image Viewer Modal Overlay --- */}
        {isViewerOpen && viewingBills.length > 0 && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsViewerOpen(false)} />
            <div className="relative z-120 w-full max-w-4xl flex flex-col items-center animate-in zoom-in-95 duration-200">
               <button onClick={() => setIsViewerOpen(false)} className="absolute -top-12 right-0 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors">
                  <X size={20} />
               </button>
               <div className="flex gap-4 overflow-x-auto p-4 snap-x w-full justify-center">
                  {viewingBills.map((billPath, idx) => (
                      <img 
                          key={idx} 
                          // Appends your backend URL to the filepath from the DB
                          src={`http://localhost:8000/${billPath}`} 
                          alt="Receipt" 
                          className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl snap-center" 
                      />
                  ))}
               </div>
            </div>
          </div>
        )}

        <AddExpenseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={() => fetchExpenses(startDate, endDate)} />
        <EditExpenseModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSuccess={() => fetchExpenses(startDate, endDate)} expense={selectedExpense} />
      </div>
    </DashboardLayout>
  );
}