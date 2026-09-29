import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, ArrowUpRight } from "lucide-react";

export default function RecentTransactions({ transactions }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-gray-800">Recent Transactions</CardTitle>
        <History className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0 divide-y divide-gray-100">
          {transactions.length > 0 ? (
            transactions.map((txn, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-gray-900">{txn.category_name}</span>
                  <span className="text-xs text-gray-500">{txn.date} • {txn.description || "No description"}</span>
                </div>
                <div className="font-bold text-red-600">
                  - NPR {parseFloat(txn.amount).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm">
              No recent transactions
            </div>
          )}
        </div>
        
        {/* Footer Link */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 w-full justify-center">
            View All History <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}