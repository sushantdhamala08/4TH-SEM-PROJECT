import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Loader2, ArrowRight, ArrowLeft, Filter, List, Unlink } from "lucide-react";
import api from "@/api/axios";
import LinkStudentModal from "./LinkStudentModal";
import CategoryBreakdown from "./CategoryBreakdown";

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i);

export default function ParentDashboard() {
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  
  // Drill-down states
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Filter states
  const [period, setPeriod] = useState("Monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/family/getStudents.php');
      if (res.data.success) setLinkedStudents(res.data.data);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const fetchStudentDetails = useCallback(async (studentId) => {
    setIsDetailLoading(true);
    try {
      const res = await api.get(`/family/getStudentDashboard.php?student_id=${studentId}&period=${period}&month=${selectedMonth}&year=${selectedYear}`);
      if (res.data.success) setStudentDetail(res.data.data);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsDetailLoading(false); 
    }
  }, [period, selectedMonth, selectedYear]);

  const handleViewFinances = (stu) => {
    setSelectedStudent(stu);
    fetchStudentDetails(stu.id);
  };

  // UNLINK STUDENT HANDLER
  const handleUnlink = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to unlink ${studentName}? You will lose access to their financial data.`)) return;
    
    try {
      const res = await api.post('/family/unlinkStudent.php', { student_id: studentId });
      if (res.data.success) {
        fetchStudents(); // Refresh the list
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Failed to unlink", error);
      alert("Failed to unlink student due to server error.");
    }
  };

  useEffect(() => {
    if (selectedStudent) {
        fetchStudentDetails(selectedStudent.id);
    }
  }, [period, selectedMonth, selectedYear, fetchStudentDetails]);

  // STUDENT DRILL-DOWN VIEW
  if (selectedStudent && studentDetail) {
    const isOverBudget = studentDetail.stats.budget > 0 && studentDetail.stats.totalSpent > studentDetail.stats.budget;

    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-10">
        <Button variant="ghost" onClick={() => { setSelectedStudent(null); setStudentDetail(null); }} className="hover:bg-gray-100">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Family List
        </Button>
        
        {/* Header & Filters */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md">
                    {selectedStudent.first_name.charAt(0)}
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{selectedStudent.first_name}'s Finances</h1>
                    <p className="text-gray-500">{selectedStudent.email} • Read-only</p>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 pl-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select className="bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer" value={period} onChange={(e) => setPeriod(e.target.value)}>
                        <option value="Weekly">Weekly View</option>
                        <option value="Monthly">Monthly View</option>
                        <option value="Yearly">Yearly View</option>
                    </select>
                </div>
                
                {period === "Monthly" && (
                    <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
                        <select className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer" value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                            {MONTHS.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
                        </select>
                        <select className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                            {YEARS.map(y => (<option key={y} value={y}>{y}</option>))}
                        </select>
                    </div>
                )}
            </div>
        </div>

        {isDetailLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>
        ) : (
            <>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-l-4 border-l-gray-800 shadow-sm">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Total Spent</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-gray-900">NPR {studentDetail.stats.totalSpent.toLocaleString()}</div></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">{period} Budget Limit</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700">
                                {studentDetail.stats.budget > 0 ? `NPR ${studentDetail.stats.budget.toLocaleString()}` : 'Not Set'}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className={`border-l-4 shadow-sm ${isOverBudget ? 'border-l-red-500 bg-red-50/30' : 'border-l-green-500'}`}>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Status</CardTitle></CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                                {studentDetail.stats.budget === 0 ? 'No Limit' : isOverBudget ? 'Over Budget' : 'Within Budget'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <CategoryBreakdown categories={studentDetail.categories.map(c => ({ name: c.name, value: parseFloat(c.value) }))} categoryBudgets={{}} />
                    </div>
                    
                    <div className="lg:col-span-2">
                        <Card className="h-full shadow-sm border-gray-200">
                            <CardHeader className="border-b bg-gray-50/50 py-4">
                                <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                                    <List className="h-5 w-5 text-blue-600" /> Transaction History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {studentDetail.expenses.length > 0 ? (
                                    <div className="max-h-100 overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-sm text-left border-collapse">
                                            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold border-b">Date</th>
                                                    <th className="px-4 py-3 font-semibold border-b">Category</th>
                                                    <th className="px-4 py-3 font-semibold border-b">Description</th>
                                                    <th className="px-4 py-3 font-semibold border-b text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {studentDetail.expenses.map((txn) => (
                                                    <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">{txn.date}</td>
                                                        <td className="px-4 py-3 font-medium text-blue-600">{txn.category_name}</td>
                                                        <td className="px-4 py-3 text-gray-600 max-w-50 truncate" title={txn.description}>{txn.description || '-'}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-red-600 whitespace-nowrap">
                                                            - NPR {parseFloat(txn.amount).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-gray-400">
                                        No expenses recorded for this period.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </>
        )}
      </div>
    );
  }

  // MAIN PARENT DASHBOARD
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Family Overview</h1>
        <Button onClick={() => setIsLinkModalOpen(true)} className="bg-blue-600">
            <LinkIcon className="mr-2 h-4 w-4" /> Link Student
        </Button>
      </div>

      {isLoading ? <Loader2 className="animate-spin mx-auto h-8 w-8 text-blue-600 mt-20" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {linkedStudents.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white border border-dashed rounded-xl text-gray-400">
                You have not linked any students yet. Click "Link Student" above.
            </div>
          ) : (
            linkedStudents.map((stu) => (
              <Card key={stu.id} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow relative">
                <CardContent className="pt-6">
                  {/* Top row: Info + Unlink button */}
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                            {stu.first_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{stu.first_name} {stu.last_name}</h3>
                          <p className="text-xs text-gray-500">{stu.email}</p>
                        </div>
                      </div>
                      
                      {/* UNLINK BUTTON */}
                      <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleUnlink(stu.id, stu.first_name)} 
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 -mt-2 -mr-2"
                          title="Unlink Student"
                      >
                          <Unlink size={16} />
                      </Button>
                  </div>

                  <Button onClick={() => handleViewFinances(stu)} variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                    {isDetailLoading && selectedStudent?.id === stu.id ? <Loader2 className="animate-spin h-4 w-4" /> : "View Finances"}
                    <ArrowRight size={14} className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
      
      <LinkStudentModal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} onSuccess={fetchStudents} />
    </div>
  );
}