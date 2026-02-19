import { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { format, formatDistanceToNow } from 'date-fns';
import { FaEye, FaComment } from 'react-icons/fa';

interface LiveSession {
  id: string;
  hostUsername: string;
  startedAt: string;
  endedAt: string | null;
  messages?: any[];
}

export const SessionsTable = () => {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);

  useEffect(() => {
    fetchSessions();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await apiService.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChats = async (sessionId: string) => {
    if (selectedSession === sessionId) {
      setSelectedSession(null);
      setChats([]);
      return;
    }

    setSelectedSession(sessionId);
    setLoadingChats(true);
    try {
      const data = await apiService.getSessionChats(sessionId);
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  const getDuration = (startedAt: string, endedAt: string | null) => {
    const start = new Date(startedAt);
    const end = endedAt ? new Date(endedAt) : new Date();
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="bg-dark-50 border border-primary-green-50/20 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-50 border border-primary-green-50/20 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-primary-green-50/20">
        <h2 className="text-xl font-bold text-white">Live Sessions</h2>
        <p className="text-sm text-gray-400 mt-1">Danh sách các phiên livestream</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-100 border-b border-primary-green-50/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Host Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Started At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Ended At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-green-50/10">
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No sessions found
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <>
                  <tr
                    key={session.id}
                    className="hover:bg-dark-100 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        @{session.hostUsername}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {format(new Date(session.startedAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {session.endedAt ? (
                        <>
                          <div className="text-sm text-gray-300">
                            {format(new Date(session.endedAt), 'MMM dd, yyyy HH:mm')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(session.endedAt), { addSuffix: true })}
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-primary-green-50">Live</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {getDuration(session.startedAt, session.endedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {session.endedAt ? (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-500/20 text-gray-400 rounded">
                          Ended
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-primary-green-50/20 text-primary-green-50 rounded">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewChats(session.id)}
                        className="flex items-center gap-2 px-3 py-1 bg-primary-green-50/10 hover:bg-primary-green-50/20 text-primary-green-50 rounded transition-colors border border-primary-green-50/30"
                      >
                        <FaComment />
                        <span>View Chats</span>
                      </button>
                    </td>
                  </tr>
                  {selectedSession === session.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-dark-100">
                        <div className="max-h-64 overflow-y-auto">
                          {loadingChats ? (
                            <div className="text-center text-gray-400 py-4">Loading chats...</div>
                          ) : chats.length === 0 ? (
                            <div className="text-center text-gray-400 py-4">No chats found</div>
                          ) : (
                            <div className="space-y-2">
                              {chats.map((chat) => (
                                <div
                                  key={chat.id}
                                  className="p-2 bg-dark-50 rounded border border-primary-green-50/10"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-primary-green-50">
                                      {chat.user?.username || 'Anonymous'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {format(new Date(chat.sentAt), 'HH:mm:ss')}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-300">{chat.message}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
