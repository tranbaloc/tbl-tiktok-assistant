import { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { FaUsers, FaToggleOn, FaToggleOff, FaPlug, FaPowerOff } from 'react-icons/fa';
import { format } from 'date-fns';

interface Channel {
  id: string;
  username: string;
  enabled: boolean;
  isAlwaysActive: boolean;
  lastStatus: string | null;
  lastConnectedAt: string | null;
  lastDisconnectedAt: string | null;
  expiredDate: string | null;
}

export const ChannelsPanel = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchChannels();
    // Refresh every 15 seconds
    const interval = setInterval(fetchChannels, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchChannels = async () => {
    try {
      const data = await apiService.getChannels();
      setChannels(data);
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (username: string) => {
    setConnecting(username);
    try {
      await apiService.connect(username);
      await fetchChannels();
    } catch (error: any) {
      console.error('Error connecting:', error);
      alert(error.response?.data?.message || 'Không thể kết nối. Vui lòng thử lại.');
    } finally {
      setConnecting(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;

    const statusMap: Record<string, { label: string; color: string }> = {
      connected: { label: 'Connected', color: 'bg-primary-green-50/20 text-primary-green-50' },
      disconnected: { label: 'Disconnected', color: 'bg-gray-500/20 text-gray-400' },
      waiting_retry: { label: 'Retrying', color: 'bg-yellow-500/20 text-yellow-400' },
      never_connected: { label: 'Never Connected', color: 'bg-gray-600/20 text-gray-500' },
    };

    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-500/20 text-gray-400' };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-dark-50 border border-primary-green-50/20 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-50 border border-primary-green-50/20 rounded-lg">
      <div className="p-6 border-b border-primary-green-50/20">
        <div className="flex items-center gap-3">
          <FaUsers className="text-primary-green-50 text-xl" />
          <div>
            <h2 className="text-xl font-bold text-white">Channels Management</h2>
            <p className="text-sm text-gray-400 mt-1">
              {channels.length} channel{channels.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {channels.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FaUsers className="text-4xl mx-auto mb-4 opacity-50" />
            <p>No channels found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="p-4 bg-dark-100 rounded-lg border border-primary-green-50/10 hover:border-primary-green-50/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-white text-lg">@{channel.username}</span>
                      {getStatusBadge(channel.lastStatus)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Enabled:</span>
                        {channel.enabled ? (
                          <FaToggleOn className="text-primary-green-50 text-xl" />
                        ) : (
                          <FaToggleOff className="text-gray-600 text-xl" />
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Always Active:</span>
                        {channel.isAlwaysActive ? (
                          <FaToggleOn className="text-primary-green-50 text-xl" />
                        ) : (
                          <FaToggleOff className="text-gray-600 text-xl" />
                        )}
                      </div>

                      {channel.lastConnectedAt && (
                        <div>
                          <span className="text-sm text-gray-400">Last Connected:</span>
                          <div className="text-sm text-gray-300">
                            {format(new Date(channel.lastConnectedAt), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                      )}

                      {channel.lastDisconnectedAt && (
                        <div>
                          <span className="text-sm text-gray-400">Last Disconnected:</span>
                          <div className="text-sm text-gray-300">
                            {format(new Date(channel.lastDisconnectedAt), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                      )}

                      {channel.expiredDate && (
                        <div className="md:col-span-2">
                          <span className="text-sm text-gray-400">Expires:</span>
                          <div className="text-sm text-gray-300">
                            {format(new Date(channel.expiredDate), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    {channel.enabled && channel.lastStatus !== 'connected' && (
                      <button
                        onClick={() => handleConnect(channel.username)}
                        disabled={connecting === channel.username}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-green-50/10 hover:bg-primary-green-50/20 text-primary-green-50 rounded-lg transition-colors border border-primary-green-50/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {connecting === channel.username ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-green-50 border-t-transparent rounded-full animate-spin"></div>
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <FaPlug />
                            <span>Connect</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
