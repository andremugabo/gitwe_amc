import { useState, useEffect } from 'react';
import { useAuth } from '../context';
import { Sidebar, Header, UnionAdminDashboard, FieldSecretaryDashboard, PastorDashboard, ElderDashboard } from '../components';
import { dashboardService } from '../services';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      setError('Failed to fetch dashboard metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  // Capitalize active tab title for header
  const getHeaderTitle = () => {
    if (activeTab === 'dashboard') return 'Overview Dashboard';
    return activeTab.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="flex bg-slate-50 min-h-screen overflow-hidden">
      {/* Dynamic Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main content body */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Header title={getHeaderTitle()} />

        <main className="p-8 flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Scoped Dashboard Sub-Components */}
          {user.role === 'UNION_ADMIN' && (
            <UnionAdminDashboard 
              activeTab={activeTab} 
              stats={stats} 
              refreshStats={fetchStats} 
            />
          )}

          {user.role === 'FIELD_SECRETARY' && (
            <FieldSecretaryDashboard 
              activeTab={activeTab} 
              stats={stats} 
              refreshStats={fetchStats} 
            />
          )}

          {user.role === 'PASTOR' && (
            <PastorDashboard 
              activeTab={activeTab} 
              stats={stats} 
              refreshStats={fetchStats} 
            />
          )}

          {user.role === 'ELDER' && (
            <ElderDashboard 
              activeTab={activeTab} 
              stats={stats} 
              refreshStats={fetchStats} 
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
