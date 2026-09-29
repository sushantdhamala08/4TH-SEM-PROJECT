import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Loader2, FileSpreadsheet, TrendingUp, TrendingDown } from "lucide-react";
import api from "@/api/axios";

export default function BalanceSheet() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("Monthly");
  const [data, setData] = useState({ incomeRows: [], expenseRows: [], summary: {} });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/analytics/getBalanceSheet.php?period=${period}`);
        if (res.data.status) setData(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [period]);

  const tdClass = "px-4 py-2 border border-gray-200 text-sm";
  const headerClass = "px-4 py-2 border border-gray-200 bg-gray-50 text-left text-xs font-bold uppercase text-gray-600";

  return (
    <Card className="border-gray-200 shadow-md overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-100 flex flex-row items-center justify-between py-4">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <FileSpreadsheet className="h-5 w-5 text-green-600" /> Financial Statement
        </CardTitle>
        <div className="flex bg-gray-100 p-1 rounded-md">
          {["Weekly", "Monthly", "Yearly"].map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 text-xs font-bold rounded ${period === p ? "bg-white shadow-sm text-green-600" : "text-gray-500"}`}>{p}</button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-green-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={headerClass}>Description</th>
                  <th className={`${headerClass} text-right`}>Credit (Income)</th>
                  <th className={`${headerClass} text-right`}>Debit (Expense)</th>
                </tr>
              </thead>
              <tbody>
                {/* Income Rows */}
                <tr className="bg-green-50/30"><td colSpan="3" className="px-4 py-1 text-[10px] font-black text-green-700 uppercase border border-gray-200">Income Sources</td></tr>
                {data.incomeRows.map((row, i) => (
                  <tr key={`inc-${i}`} className="hover:bg-gray-50">
                    <td className={tdClass}>{row.name}</td>
                    <td className={`${tdClass} text-right text-green-600 font-medium`}>{parseFloat(row.amount).toLocaleString()}</td>
                    <td className={`${tdClass} text-right text-gray-300`}>-</td>
                  </tr>
                ))}

                {/* Expense Rows */}
                <tr className="bg-red-50/30"><td colSpan="3" className="px-4 py-1 text-[10px] font-black text-red-700 uppercase border border-gray-200">Expense Categories</td></tr>
                {data.expenseRows.map((row, i) => (
                  <tr key={`exp-${i}`} className="hover:bg-gray-50">
                    <td className={tdClass}>{row.name}</td>
                    <td className={`${tdClass} text-right text-gray-300`}>-</td>
                    <td className={`${tdClass} text-right text-red-600 font-medium`}>({parseFloat(row.amount).toLocaleString()})</td>
                  </tr>
                ))}

                {/* Spacer */}
                <tr><td colSpan="3" className="h-4 border border-gray-200 bg-gray-50"></td></tr>

                {/* Sub-Totals */}
                <tr className="bg-gray-50 font-bold">
                  <td className={tdClass}>Sub-Totals</td>
                  <td className={`${tdClass} text-right text-green-700`}>NPR {data.summary.totalIncome.toLocaleString()}</td>
                  <td className={`${tdClass} text-right text-red-700`}>NPR {data.summary.totalExpense.toLocaleString()}</td>
                </tr>

                {/* Net Balance (Grand Total) */}
                <tr className={`${data.summary.netBalance >= 0 ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'} font-black`}>
                  <td className="px-4 py-3 border border-white/20">NET SURPLUS / (DEFICIT)</td>
                  <td colSpan="2" className="px-4 py-3 text-right border border-white/20 text-lg">
                    NPR {data.summary.netBalance.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}