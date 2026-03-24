import { useState, useEffect } from 'react';
import { api } from '../services/api';

function Challenges({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get(`/notifications/${user}?accepted=false`);
      setNotifications(response.data);
    } catch (err) {
      console.error('Notifications error:', err);
    } finally {
      setLoading(false);
    }
  };


  const updateStatus = async (notifId, status) => {
    try {
      await api.put(`/notification/${user}/${notifId}`, { status });
      fetchNotifications();
    } catch (err) {
      alert('Update failed');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20 flex items-center justify-center">
Loading challenge invitations...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 shadow-xl rounded-lg p-8 mb-8 border border-gray-700">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              🔔 Challenges & Invitations ({notifications.length})
            </h1>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">✨</div>
No challenge invitations yet
              <p className="text-gray-400 mb-8">Challenge friends from Friends page to get started!</p>
              <a href="/friends" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold">
                Find Friends →
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div key={notif.id} className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 shadow-xl group hover:shadow-2xl transition-all">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg ${notif.status === 'accepted' ? 'bg-emerald-500' : notif.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`}>
                      {notif.type === 'challenge' ? '⚔️' : '📧'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">{notif.from}</span>
                        <span className="text-sm text-gray-400">→ You</span>
                      </div>
                      <p className="text-gray-300 mb-2">{notif.message}</p>
                      <p className="text-sm text-gray-500">{formatDate(notif.date)}</p>
                    </div>
                  </div>

                  <div className={`flex gap-3 ${notif.status !== 'pending' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <button
                      onClick={() => updateStatus(notif.id, 'accepted')}
                      disabled={notif.status !== 'pending'}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">✅</span>
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(notif.id, 'rejected')}
                      disabled={notif.status !== 'pending'}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">❌</span>
                      Reject
                    </button>
                  </div>

                  {notif.status === 'accepted' && (
                    <div className="mt-4 pt-4 border-t border-gray-700 bg-emerald-500/10 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 text-lg">🎯</span>
                        <span className="font-semibold text-emerald-300">Challenge Accepted! Track progress in Dashboard.</span>
                      </div>
                    </div>
                  )}

                  {notif.status === 'rejected' && (
                    <div className="mt-4 pt-4 border-t border-gray-700 bg-red-500/10 p-4 rounded-xl">
                      <span className="text-red-400 font-semibold">Challenge declined</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Challenges;

