import { useState, useEffect } from 'react';
import { api } from '../services/api';

const Navbar = ({ user, currentPage, onPageChange, setUser }) => {
  const [profile, setProfile] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (user) {
      setLoading(true);
      api.get(`/user/${user}`).then(res => {
        setProfile(res.data);
        setEditData({
          email: res.data.email || '',
          phone: res.data.phone || '',
          social_links: res.data.social_links || {}
        });
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [user]);

  const avatarColor = user ? `from-${['red', 'blue', 'green', 'purple', 'orange', 'pink'][user.charCodeAt(0) % 6]}-400` : 'from-gray-400';

  const handleSave = async () => {
    try {
      await api.put(`/user/${user}`, { profile: editData });
      const res = await api.get(`/user/${user}`);
      setProfile(res.data);
      setEditData(res.data);
      setEditing(false);
    } catch (err) {
      alert('Update failed');
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Clean Nav Bar */}
      <nav className="bg-gray-800/95 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50 shadow-xl p-4 h-20 flex items-center">
        <div className="max-w-6xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-lg hover:bg-gray-700 text-2xl text-gray-300 hover:text-white transition-all"
              aria-label="Menu"
            >
              ☰
            </button>
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              💰 MoneyApp
            </h1>
          </div>
        </div>
      </nav>

      {/* Left Sidebar */}
      <div className={`fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-gray-900 border-r border-gray-700 z-40 transform transition-transform duration-300 ease-in-out shadow-2xl ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          {/* Close button */}
          <button 
            onClick={() => setShowSidebar(false)}
            className="self-end mb-6 text-xl text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
          
          {/* Navigation Links */}
          <nav className="flex-1 space-y-2 mb-8">
            <button
              onClick={() => {
                onPageChange('dashboard');
                setShowSidebar(false);
              }}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-left transition-all shadow-md ${
                currentPage === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-blue-500/25'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
              }`}
            >
              📊 Dashboard
            </button>
            
            <button
              onClick={() => {
                onPageChange('rank');
                setShowSidebar(false);
              }}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-left transition-all shadow-md ${
                currentPage === 'rank'
                  ? 'bg-purple-600 text-white shadow-purple-500/25'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
              }`}
            >
              🏆 Rankings
            </button>
            
            <button
              onClick={() => {
                onPageChange('friends');
                setShowSidebar(false);
              }}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-left transition-all shadow-md ${
                currentPage === 'friends'
                  ? 'bg-indigo-600 text-white shadow-indigo-500/25'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
              }`}
            >
              👥 Friends
            </button>
            
            <button
              onClick={() => {
                onPageChange('challenges');
                setShowSidebar(false);
              }}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-left transition-all shadow-md ${
                currentPage === 'challenges'
                  ? 'bg-amber-600 text-white shadow-amber-500/25'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
              }`}
            >
              🔔 Challenge Invitations
            </button>
          </nav>

          {/* Profile Section - BOTTOM */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className={`w-12 h-12 ${avatarColor} to-${avatarColor.replace('from-', '')}-600 rounded-xl shadow-lg flex items-center justify-center text-xl font-bold`}>
                {user.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{profile?.username || user}</h3>
                <p className="text-gray-400 text-sm">R$ {profile?.total_saved?.toLocaleString('en-US', {minimumFractionDigits: 2}) || '0.00'} saved</p>
              </div>
            </div>

            <button 
              onClick={() => setEditing(!editing)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all mb-4"
            >
              {editing ? 'Cancel Edit' : 'Edit Profile'}
            </button>

            {editing && (
              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Email</label>
                  <input 
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Phone</label>
                  <input 
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="phone"
                  />
                </div>
                <button 
                  onClick={handleSave}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  disabled={loading}
                >
                  Save Changes
                </button>
              </div>
            )}

            <button
              onClick={() => setUser(null)}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-red-600 transition-all flex items-center justify-center"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30" 
          onClick={() => setShowSidebar(false)}
        />
      )}
    </>
  );
};

export default Navbar;

