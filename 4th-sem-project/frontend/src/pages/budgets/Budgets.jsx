import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calculator, Calendar } from "lucide-react";
import api from "@/api/axios";
import SetMonthlyBudgetModal from "@/components/dashboard/SetMonthlyBudgetModal";

const MONTH_NAMES = ["", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export default function Budgets() {
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [budgetData, setBudgetData] = useState([]);
  
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/budget/getYearlyPlan.php?year=${year}`);
      if (res.data.success) {
        setBudgetData(res.data.data);
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, [year]);

  const handleMonthClick = (monthItem) => {
    setSelectedMonth(monthItem);
    setIsModalOpen(true);
  };

  const totalYearly = budgetData.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header & Year Selector */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Budget Planner</h1>
                <p className="text-muted-foreground">Detailed weekly planning for {year}.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                <Button variant="ghost" size="icon" onClick={() => setYear(year - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold text-gray-800 w-16 text-center">{year}</span>
                <Button variant="ghost" size="icon" onClick={() => setYear(year + 1)}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>

        {/* Yearly Summary */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none shadow-lg">
            <CardContent className="flex items-center justify-between p-6">
                <div>
                    <p className="text-blue-100 font-medium mb-1">Total Yearly Budget</p>
                    <h2 className="text-4xl font-bold">NPR {totalYearly.toLocaleString()}</h2>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Calculator className="h-6 w-6 text-white" />
                </div>
            </CardContent>
        </Card>

        {/* 12-Month Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {budgetData.map((item) => {
                const isSet = item.amount > 0;
                
                // Get specific weekly data
                const weeks = [
                    { id: 1, val: item.week1 },
                    { id: 2, val: item.week2 },
                    { id: 3, val: item.week3 },
                    { id: 4, val: item.week4 }
                ];

                return (
                    <div 
                        key={item.month}
                        onClick={() => handleMonthClick(item)}
                        className={`
                            relative group cursor-pointer transition-all duration-300
                            border rounded-xl p-4 flex flex-col gap-3
                            ${isSet ? 'bg-white border-blue-200 shadow-sm hover:shadow-md hover:border-blue-400' : 'bg-gray-50/50 border-dashed border-gray-300 hover:bg-white hover:border-gray-400'}
                        `}
                    >
                        <div className="flex justify-between items-center">
                            <span className={`text-lg font-bold ${isSet ? 'text-gray-800' : 'text-gray-400'}`}>
                                {MONTH_NAMES[item.month]}
                            </span>
                            <Calendar className={`h-4 w-4 ${isSet ? 'text-blue-500' : 'text-gray-300'}`} />
                        </div>

                        <div className="pt-2">
                            {isSet ? (
                                <div className="text-2xl font-bold text-gray-900">
                                    <span className="text-sm text-gray-500 font-normal mr-1">NPR</span>
                                    {item.amount.toLocaleString()}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-400 font-medium py-2">Click to plan</div>
                            )}
                        </div>

                        {/* Specific Weekly Breakdown */}
                        {isSet && (
                            <div className="mt-2 pt-3 border-t border-gray-100 grid grid-cols-4 gap-1">
                                {weeks.map((w) => (
                                    <div key={w.id} className="flex flex-col items-center">
                                        <div className="text-[10px] text-gray-400 uppercase">W{w.id}</div>
                                        <div 
                                            className={`h-8 w-full rounded-md flex items-center justify-center text-[10px] font-semibold transition-colors
                                            ${w.val > 0 ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-400'}`} 
                                            title={`Week ${w.id}: ${w.val}`}
                                        >
                                            {w.val > 0 ? (w.val / 1000).toFixed(1) + 'k' : '-'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

        <SetMonthlyBudgetModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={fetchBudgets}
            monthData={selectedMonth}
            year={year}
        />

      </div>
    </DashboardLayout>
  );
}