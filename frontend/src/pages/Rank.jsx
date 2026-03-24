import { useState, useEffect } from 'react';
import { api } from '../services/api';



const Rank = ({ user }) => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      const response = await api.get('/rankings');
      setRankings(response.data);
    } catch (err) {
      console.error('Failed to fetch rankings', err);
    } finally {
      setLoading(false);
    }
  };

  const getLeague = (totalSaved) => {
    if (totalSaved >= 50000) return '🏆 Diamond';
    if (totalSaved >= 25000) return '🥈 Gold';
    if (totalSaved >= 10000) return '🥉 Silver';
    if (totalSaved >= 1000) return '⚫ Bronze';
    return '🌱 Wood';
  };

  const getPositionColor = (position) => {
    if (position === 1) return 'text-yellow-400';
    if (position === 2) return 'text-gray-400';
    if (position === 3) return 'text-amber-600';
    return 'text-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl">Loading rankings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-12">

        <div className="text-center mb-12">
          <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
            💰 Money League
          </h1>
          <p className="text-xl text-gray-300 mb-8">Ranked by total money saved</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-700 to-gray-600 border-b border-gray-600">
                  <th className="p-6 text-left text-lg font-bold text-white">#</th>
                  <th className="p-6 text-left text-lg font-bold text-white">User</th>
                  <th className="p-6 text-right text-lg font-bold text-white">Saved</th>
                  <th className="p-6 text-right text-lg font-bold text-white">League</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((rank, index) => (
                  <tr key={index} className="hover:bg-gray-700/50 transition-colors border-b border-gray-700 last:border-b-0">
                    <td className="p-6 font-bold text-2xl">
                      <span className={getPositionColor(index + 1)}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </span>
                    </td>
                    <td className="p-6 font-semibold text-xl">{rank.user}</td>
                    <td className="p-6 text-right font-bold text-2xl text-green-400">
                      R$ {rank.total_saved.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </td>
                    <td className="p-6 text-right">
                      <span className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full text-sm font-bold shadow-lg">
                        {getLeague(rank.total_saved)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-16 space-y-4">
          <p className="text-gray-400">New users start at Wood League 🌱</p>
          <div className="text-sm text-gray-500 space-y-1">
            <div>{`🥇 Diamond: 50k+ | 🥈 Gold: 25k+ | 🥉 Silver: 10k+ | ⚫ Bronze: 1k+ | 🌱 Wood: <1k`}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rank;

