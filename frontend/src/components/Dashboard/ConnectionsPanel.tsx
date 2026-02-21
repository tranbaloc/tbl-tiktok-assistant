import { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { FaPlug, FaTimes, FaCheckCircle } from 'react-icons/fa';

interface Connection {
  username: string;
  status: string;
  roomId?: string;
}

export const ConnectionsPanel = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchConnections();
    // Refresh every 10 seconds
    const interval = setInterval(fetchConnections, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchConnections = async () => {
    try {
      const data = await apiService.getConnections();
      setConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (username: string) => {
    if (!confirm(`Bạn có chắc muốn ngắt kết nối với @${username}?`)) {
      return;
    }

    setDisconnecting(username);
    try {
      await apiService.disconnect(username);
      await fetchConnections();
    } catch (error) {
      console.error('Error disconnecting:', error);
      alert('Không thể ngắt kết nối. Vui lòng thử lại.');
    } finally {
      setDisconnecting(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-dark-50 border border-primary-green-50/20 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-50 border border-primary-green-50/20 rounded-lg">
      <div className="p-6 border-b border-primary-green-50/20">
        <div className="flex items-center gap-3">
          <FaPlug className="text-primary-green-50 text-xl" />
          <div>
            <h2 className="text-xl font-bold text-white">Active Connections</h2>
            <p className="text-sm text-gray-400 mt-1">
              {connections.length} connection{connections.length !== 1 ? 's' : ''} active
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {connections.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FaPlug className="text-4xl mx-auto mb-4 opacity-50" />
            <p>No active connections</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((connection, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-dark-100 rounded-lg border border-primary-green-50/10 hover:border-primary-green-50/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-green-50/10 flex items-center justify-center border border-primary-green-50/30">
                    <FaPlug className="text-primary-green-50" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">@{connection.username}</span>
                      {connection.status === 'connected' && (
                        <FaCheckCircle className="text-primary-green-50 text-sm" />
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Status: <span className="text-primary-green-50">{connection.status}</span>
                    </div>
                    {connection.roomId && (
                      <div className="text-xs text-gray-500 mt-1">
                        Room ID: {connection.roomId}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDisconnect(connection.username)}
                  disabled={disconnecting === connection.username}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {disconnecting === connection.username ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Disconnecting...</span>
                    </>
                  ) : (
                    <>
                      <FaTimes />
                      <span>Disconnect</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
