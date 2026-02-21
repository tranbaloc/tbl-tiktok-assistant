import { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { FaVideo, FaPlug, FaComment, FaUsers } from 'react-icons/fa';

interface Stats {
  totalSessions: number;
  activeConnections: number;
  totalMessages: number;
  activeChannels: number;
}

export const StatsCards = () => {
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    activeConnections: 0,
    totalMessages: 0,
    activeChannels: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sessions, connections, channels] = await Promise.all([
          apiService.getSessions(),
          apiService.getConnections(),
          apiService.getChannels(),
        ]);

        // Calculate total messages from sessions
        let totalMessages = 0;
        for (const session of sessions) {
          try {
            const chats = await apiService.getSessionChats(session.id);
            totalMessages += chats.length;
          } catch (e) {
            // Ignore errors for individual session chats
          }
        }

        setStats({
          totalSessions: sessions.length,
          activeConnections: connections.length,
          totalMessages,
          activeChannels: channels.filter((c: any) => c.enabled).length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set default values on error
        setStats({
          totalSessions: 0,
          activeConnections: 0,
          totalMessages: 0,
          activeChannels: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      icon: FaVideo,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Active Connections',
      value: stats.activeConnections,
      icon: FaPlug,
      color: 'text-primary-green-50',
      bgColor: 'bg-primary-green-50/10',
      borderColor: 'border-primary-green-50/30',
    },
    {
      title: 'Total Messages',
      value: stats.totalMessages,
      icon: FaComment,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
    {
      title: 'Active Channels',
      value: stats.activeChannels,
      icon: FaUsers,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-dark-50 border border-primary-green-50/20 rounded-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`bg-dark-50 border ${card.borderColor} rounded-lg p-6 hover:bg-dark-100 transition-colors`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={`${card.color} text-xl`} />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-white">{card.value.toLocaleString()}</p>
          </div>
        );
      })}
    </div>
  );
};
