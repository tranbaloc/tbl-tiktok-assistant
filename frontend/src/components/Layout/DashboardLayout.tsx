import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6 min-h-screen">{children}</main>
      </div>
    </div>
  );
};
