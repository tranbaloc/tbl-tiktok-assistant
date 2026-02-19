import { Link, useLocation } from 'react-router-dom';
import { 
  FaChartLine, 
  FaVideo, 
  FaPlug, 
  FaUsers,
  FaBars,
  FaTimes 
} from 'react-icons/fa';
import { useState } from 'react';

const menuItems = [
  { path: '/dashboard', icon: FaChartLine, label: 'Dashboard' },
  { path: '/dashboard/sessions', icon: FaVideo, label: 'Sessions' },
  { path: '/dashboard/connections', icon: FaPlug, label: 'Connections' },
  { path: '/dashboard/channels', icon: FaUsers, label: 'Channels' },
];

export const Sidebar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-dark-50 border border-primary-green-50/20 rounded-lg text-white hover:bg-dark-100 transition-colors"
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-dark-50 border-r border-primary-green-50/20
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-primary-green-50/20">
            <h2 className="text-2xl font-bold text-primary-green-50">
              TikTok Live
            </h2>
            <p className="text-xs text-gray-400 mt-1">Admin Console</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-primary-green-50/10 text-primary-green-50 border border-primary-green-50/30'
                        : 'text-gray-400 hover:text-white hover:bg-dark-100'
                    }
                  `}
                >
                  <Icon className="text-lg" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-primary-green-50/20">
            <p className="text-xs text-gray-500 text-center">
              v1.0.0
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};
