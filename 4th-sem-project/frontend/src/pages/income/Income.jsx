import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Loader2, 
} from "lucide-react";
import api from "@/api/axios";
import AddIncomeModal from "@/components/dashboard/AddIncomeModal";

export default function Income() {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch the actual income list
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/income/getAllIncomes.php");
      if (res.data.success) {
        setIncomes(res.data.data || []);
      }
    } catch (error) {
      console.error("Fetch history error", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Delete Action
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income?")) return;
    try {
      const res = await api.post("/income/deleteIncome.php", { id });
      if (res.data.success) {
        fetchHistory(); // Refresh the list
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  // Edit Action
  const handleEdit = (income) => {
    setEditData(income); // Put the data into the state
    setIsAddModalOpen(true); // Open the modal
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Income</h1>
                <p className="text-muted-foreground">Track your earnings history.</p>
            </div>
            
            <Button onClick={() => { setEditData(null); setIsAddModalOpen(true); }} className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" /> Add Income
            </Button>
        </div>

        {/* Income List Table */}
        <div className="space-y-4 animate-in fade-in duration-300">
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-green-600"/></div>
                    ) : incomes.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">No income records found. Add one above!</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr className="text-gray-500">
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold">Source</th>
                                    <th className="p-4 font-semibold">Description</th>
                                    <th className="p-4 font-semibold text-right">Amount</th>
                                    <th className="p-4 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomes.map((inc) => (
                                    <tr key={inc.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">{inc.date}</td>
                                        <td className="p-4 font-bold text-gray-800">{inc.source}</td>
                                        <td className="p-4 text-gray-500">{inc.description || "-"}</td>
                                        <td className="p-4 text-right font-bold text-green-600">NPR {parseFloat(inc.amount).toLocaleString()}</td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-3">
                                                <button 
                                                    onClick={() => handleEdit(inc)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(inc.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Add/Edit Modal */}
        <AddIncomeModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            onSuccess={fetchHistory} 
            editData={editData} 
        />
        
      </div>
    </DashboardLayout>
  );
}