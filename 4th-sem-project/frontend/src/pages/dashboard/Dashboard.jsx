import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ParentDashboard from '@/components/dashboard/ParentDashboard'; 
import StudentDashboard from '@/components/dashboard/StudentDashboard'; 
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  // Redirect admin to their specific dashboard
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      {user?.role === 'parent' ? (
        <ParentDashboard />
      ) : (
        <StudentDashboard />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;