import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Plus, Wallet, Pencil, Filter, ChevronDown } from 'lucide-react';
import api from '@/api/axios';

// Modals
import AddExpenseModal from '@/components/dashboard/AddExpenseModal';
import AddBudgetModal from '@/components/dashboard/AddBudgetModal';
import SetCategoryBudgetModal from '@/components/dashboard/SetCategoryBudgetModal';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import DueExpenseModal from '@/components/dashboard/DueExpenseModal';
import FamilyRequestBanner from '@/components/dashboard/FamilyRequestBanner';

const StudentDashboard = () => {
  const [stats, setStats] = useState({ totalExpense: 0, budget: 0, budgetType: 'Monthly', remaining: 0 });
  const [chartData, setChartData] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [categoryBudgets, setCategoryBudgets] = useState({}); 
  const [dueExpenses, setDueExpenses] = useState([]);
  const [currentDueIndex, setCurrentDueIndex] = useState(0);

  const [period, setPeriod] = useState("Monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCatBudgetModalOpen, setIsCatBudgetModalOpen] = useState(false);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const MONTHS = [
    { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
    { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
    { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
  ];
  const currentYear = new Date().getFullYear();
  const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i);

  const fetchStudentData = useCallback(async () => {
    try {
      await api.post('/expense/processRecurring.php');
      const budgetRes = await api.get(`/budget/getBudget.php?type=${period}&month=${selectedMonth}&year=${selectedYear}`);
      const budgetAmount = parseFloat(budgetRes.data.data?.amount || 0);
      
      const analyticsRes = await api.get(`/analytics/getExpenseSummary.php?period=${period}&month=${selectedMonth}&year=${selectedYear}`);
      let categories = [];
      let totalSpent = 0;
      
      if (analyticsRes.data.status) {
        totalSpent = parseFloat(analyticsRes.data.totalExpense || 0);
        categories = analyticsRes.data.byCategory.map(item => ({
          name: item.category,
          value: parseFloat(item.total)
        }));
      }

      const txnRes = await api.get('/expense/getRecentExpenses.php');
      if (txnRes.data.status) { setRecentTxns(txnRes.data.data); }

      const catBudgetRes = await api.get('/budget/getCategoryBudgets.php');
      if (catBudgetRes.data.success) { setCategoryBudgets(catBudgetRes.data.data); }

      const dueRes = await api.get('/expense/getDueExpenses.php');
      if (dueRes.data.success) { setDueExpenses(dueRes.data.data); }

      setStats({
        totalExpense: totalSpent,
        budget: budgetAmount,
        budgetType: period,
        remaining: budgetAmount - totalSpent
      });
      setChartData(categories);
    } catch (error) { console.error(error); }
  }, [period, selectedMonth, selectedYear]);

  useEffect(() => {
    // 1. Create a flag to track if the component is still mounted
    let isMounted = true;

    const loadDashboardData = async () => {
      // 2. Only run the logic if the component is still active
      if (isMounted) {
        await fetchStudentData();
      }
    };

    loadDashboardData();

    // 3. Cleanup function: runs when the component unmounts or dependencies change
    return () => {
      isMounted = false;
    };
  }, [fetchStudentData]);

  const handleDueSuccess = () => {
    setDueExpenses(prev => prev.filter((_, idx) => idx !== currentDueIndex));
    fetchStudentData(); 
  };

  const isBudgetSet = stats.budget > 0;

  return (
    <div className="space-y-8 pb-10">
      <FamilyRequestBanner />
      <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                  <p className="text-muted-foreground">Overview of your finances</p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                  <Button variant="outline" onClick={() => setIsBudgetModalOpen(true)} className="border-blue-200 text-blue-700 bg-white">
                      {isBudgetSet ? <Pencil className="mr-2 h-4 w-4" /> : <Wallet className="mr-2 h-4 w-4" />}
                      {isBudgetSet ? `Edit ${period} Budget` : `Set ${period} Budget`}
                  </Button>
                  <Button onClick={() => setIsExpenseModalOpen(true)} className="bg-blue-600">
                      <Plus className="mr-2 h-4 w-4" /> Add Expense
                  </Button>
              </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 p-1">
              <select className="p-2.5 bg-white border border-gray-200 text-sm rounded-xl" value={period} onChange={(e) => setPeriod(e.target.value)}>
                  <option value="Weekly">Weekly View</option>
                  <option value="Monthly">Monthly View</option>
                  <option value="Yearly">Yearly View</option>
              </select>
              {period === "Monthly" && (
                  <div className="flex items-center gap-3 bg-white border border-gray-200 p-1 rounded-xl">
                      <select className="bg-transparent text-sm p-1.5" value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                          {MONTHS.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
                      </select>
                      <select className="bg-transparent text-sm p-1.5" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                          {YEARS.map(y => (<option key={y} value={y}>{y}</option>))}
                      </select>
                  </div>
              )}
          </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Total Spent</p><div className="text-2xl font-bold">NPR {stats.totalExpense.toLocaleString()}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Budget Limit</p><div className="text-2xl font-bold">NPR {stats.budget.toLocaleString()}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Remaining</p><div className={`text-2xl font-bold ${stats.remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>NPR {stats.remaining.toLocaleString()}</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <Card>
            <CardHeader><CardTitle>Spending Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {chartData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                      </Pie>
                      <Tooltip formatter={(value) => `NPR ${value.toLocaleString()}`} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-gray-400 py-10">No data available</p>}
              </div>
            </CardContent>
          </Card>
          <CategoryBreakdown categories={chartData} categoryBudgets={categoryBudgets} />
        </div>
        <RecentTransactions transactions={recentTxns} />
      </div>

      {/* Modals */}
      <AddBudgetModal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} onSuccess={fetchStudentData} currentAmount={stats.budget} currentType={period} month={selectedMonth} year={selectedYear} />
      <AddExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSuccess={fetchStudentData} />
      <SetCategoryBudgetModal isOpen={isCatBudgetModalOpen} onClose={() => setIsCatBudgetModalOpen(false)} onSuccess={fetchStudentData} />
      {dueExpenses.length > 0 && currentDueIndex < dueExpenses.length && (
         <DueExpenseModal isOpen={true} expense={dueExpenses[currentDueIndex]} onClose={() => setCurrentDueIndex(i => i + 1)} onSuccess={handleDueSuccess} />
      )}
    </div>
  );
};

export default StudentDashboard;