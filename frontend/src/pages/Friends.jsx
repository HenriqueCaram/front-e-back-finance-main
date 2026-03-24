import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Friends({ user }) {
  const [userSavings, setUserSavings] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [activeChallenges, setActiveChallenges] = useState([]);

  // API-powered search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.length > 0) {
        try {
          const response = await api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
          setSearchResults(response.data);
        } catch (err) {
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fetch active challenges + user savings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [savingsRes, challengesRes] = await Promise.all([
          api.get(`/savings/${user}`),
          api.get(`/challenges/${user}`)
        ]);
        setUserSavings(savingsRes.data.total_saved || 0);
        setActiveChallenges(challengesRes.data);
      } catch (err) {
        console.error('Data error:', err);
      }
    };
    fetchData();
  }, [user]);

  const sendChallenge = async (toUser) => {
    try {
      await api.post('/challenge', { from: user, to: toUser });
      alert('Challenge sent!');
      setSelectedUser('');
      setSearchQuery('');
    } catch (err) {
      alert('Failed to send challenge');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 shadow-xl rounded-lg p-8 mb-8 border border-gray-700">
          <h1 className="text-3xl font-bold mb-8">Friends & Challenges</h1>
          
          {/* Your Rank */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-8 rounded-2xl shadow-2xl mb-8">
            <h2 className="text-2xl font-bold mb-4">Your Rank</h2>
            <p className="text-4xl font-black">R$ {userSavings.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>

          {/* Challenge Leaderboard Chart */}
          {activeChallenges.length > 0 ? (
            <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 p-8 rounded-2xl mb-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-amber-300">
                ⚔️ Challenge Invitations Leaderboard
              </h3>
              <div style={{ height: '400px' }}>
                <Bar 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { 
                        display: true,
                        text: 'You vs Challenge Opponents',
                        font: { size: 18 }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: value => `R$ ${value.toLocaleString('pt-BR')}`
                        }
                      }
                    }
                  }}
                  data={{
                    labels: ['Você', ...activeChallenges.map(c => c.opponent)],
                    datasets: [{
                      label: 'Total Saved',
                      data: [userSavings, ...activeChallenges.map(c => c.opponent_savings)],
                      backgroundColor: [
                        'rgba(34, 197, 94, 0.9)', 
                        ...activeChallenges.map(() => 'rgba(239, 68, 68, 0.8)')
                      ]
                    }]
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-gray-700 p-8 rounded-2xl text-center mb-8">
              <div className="text-6xl mb-4">⚔️</div>
No active challenge invitations
              <p className="text-gray-400">Send a challenge below to start competing!</p>
            </div>
          )}

          {/* Challenge Search */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4">Send Challenge</h3>
            <p className="text-gray-300 mb-4">Challenge friends to savings goals!</p>
            <div className="space-y-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search users (maria)..." 
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 pl-12 pr-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchResults.length > 0 && (
                <ul className="max-h-48 overflow-y-auto bg-gray-700 rounded-xl border border-gray-600">
                  {searchResults.map((friend) => (
                    <li key={friend.username} className="p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0" onClick={() => {
                      setSelectedUser(friend.username);
                      setSearchQuery('');
                    }}>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{friend.username}</span>
                        <span className="text-sm text-green-400">R$ {friend.savings.toLocaleString('pt-BR')}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {selectedUser && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500 rounded-xl">
                  <h4 className="font-bold mb-2 text-lg">Challenge {selectedUser}</h4>
                  <p className="text-sm text-gray-400 mb-4">Start competing on savings!</p>
                  <button 
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-lg font-bold text-lg hover:shadow-2xl transition-all hover:scale-[1.02]"
                    onClick={() => sendChallenge(selectedUser)}
                  >
                    Send Challenge ⚔️
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Friends;

