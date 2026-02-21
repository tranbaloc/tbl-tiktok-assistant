import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { StatsCards } from '../components/Dashboard/StatsCards';
import { SessionsTable } from '../components/Dashboard/SessionsTable';
import { ConnectionsPanel } from '../components/Dashboard/ConnectionsPanel';
import { ChannelsPanel } from '../components/Dashboard/ChannelsPanel';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
  const location = useLocation();

  return (
    <DashboardLayout>
      <div className="w-full">
        {location.pathname === '/dashboard' && (
          <>
            <StatsCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <ConnectionsPanel />
              <ChannelsPanel />
            </div>
            <div className="mt-6">
              <SessionsTable />
            </div>
          </>
        )}
        {location.pathname === '/dashboard/sessions' && <SessionsTable />}
        {location.pathname === '/dashboard/connections' && <ConnectionsPanel />}
        {location.pathname === '/dashboard/channels' && <ChannelsPanel />}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
