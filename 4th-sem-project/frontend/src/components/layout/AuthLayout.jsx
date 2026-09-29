import { Link } from "react-router-dom";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-blue-900 to-indigo-900 p-4">
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-800">
        {/* <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center bg-gray-800 h-full">
          <div className="relative w-full h-full">
            <img 
              src="/hero.jpg"
              className="w-full h-full object-cover drop-shadow-2xl rounded-lg transform"
              alt=""
            />
          </div>
        </div> */}
        {/* Form */}
        <div className="w-full p-8 lg:p-12 flex flex-col justify-center">
          
          {/* Logo & Header */}
          <div className="space-y-2 mb-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-slate-100 pb-2">Expense Tracker</h2>
              <h2 className="text-2xl font-semibold text-white">{title}</h2>
              {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
              <div className="h-1 w-24 bg-blue-500 rounded-full mt-2"></div>
            </div>
          </div>

          {children}

        </div>
      </div>
    </div>
  );
}