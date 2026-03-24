import { useState, useEffect } from 'react';
import { api } from '../services/api';

const Navbar = ({ user, currentPage, onPageChange, setUser }) => {
  const [profile, setProfile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
    <nav className="bg-gray-800/95 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50 shadow-xl dark:bg-gray-900/95 dark:border-gray-600 dark:shadow-2xl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent dark:from-blue-300 dark:to-purple-400">
              💰 MoneyApp
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg hover:bg-gray-700 text-2xl text-gray-300 hover:text-white transition-all md:text-3xl"
                aria-label="Menu"
              >
                ☰
              </button>



            <div className="w-px h-6 bg-gray-600 mx-4" />


              <div className="flex items-center space-x-3 relative">
                <div 
                  className={`w-10 h-10 ${avatarColor} to-${avatarColor.replace('from-', '')}-600 rounded-full shadow-lg flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:scale-105 transition-all group relative overflow-hidden`}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {loading ? '...' : user.charAt(0).toUpperCase()}
                  <div className="absolute inset-0 bg-black/20 scale-0 group-hover:scale-100 transition-all rounded-full"></div>
                </div>
                {showDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-600/50 z-50">

                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className={`w-16 h-16 ${avatarColor} to-${avatarColor.replace('from-', '')}-600 rounded-2xl shadow-xl flex items-center justify-center text-2xl font-bold`}>
                        {user.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{profile?.username || user}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Saved: R$ {profile?.total_saved?.toLocaleString('en-US', {minimumFractionDigits: 2}) || '0.00'}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <button 
                        onClick={() => setEditing(!editing)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all mb-4"
                      >
                        {editing ? 'Cancel Edit' : 'Edit Profile'}
                      </button>
                    </div>

                    {editing && (
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                          <input 
                            type="email"
                            value={editData.email}
                            onChange={(e) => setEditData({...editData, email: e.target.value})}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500"
                            placeholder="your@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                          <input 
                            type="tel"
                            value={editData.phone}
                            onChange={(e) => setEditData({...editData, phone: e.target.value})}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500"
                            placeholder="phone"
                          />
                        </div>
                        <button 
                          onClick={handleSave}
                          className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                          disabled={loading}
                        >
                          Save Changes
                        </button>
                      </div>
                    )}

                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <button
                        onClick={() => setUser(null)}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-red-600 transition-all flex items-center justify-center"
                      >
                        Logout
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
          {showMobileMenu && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" 
                onClick={() => setShowMobileMenu(false)}
              />
              
              {/* Hamburger Menu Overlay - All devices */}
              <div className="fixed top-20 left-0 w-full bg-gray-900/95 backdrop-blur-xl z-50 p-6 md:p-8 flex flex-col items-start shadow-2xl border-b border-gray-700 animate-in slide-in-from-top-2 duration-200 md:max-w-md md:right-4 md:left-auto md:ml-auto md:w-80 md:rounded-2xl md:mt-2 md:border md:shadow-2xl md:max-h-[80vh] md:overflow-y-auto">
                <button 
                  onClick={() => setShowMobileMenu(false)}
                  className="self-end mb-4 text-xl text-gray-400 hover:text-white md:text-2xl"
                >
                  ✕
                </button>
                
                <div className="space-y-3 w-full">
                  <div className="space-y-2 w-full">
                    <button
                      onClick={() => {
                        onPageChange('dashboard');
                        setShowMobileMenu(false);
                      }}
                      className={`w-full py-4 px-6 rounded-2xl font-bold text-xl shadow-xl transition-all ${
                        currentPage === 'dashboard'
                          ? 'bg-blue-600 text-white shadow-blue-500/50'
                          : 'bg-gray-800/50 hover:bg-gray-700 text-gray-200 hover:text-white border border-gray-700'
                      }`}
                    >
                      📊 Dashboard
                    </button>
                    
                    <button
                      onClick={() => {
                        onPageChange('rank');
                        setShowMobileMenu(false);
                      }}
                      className={`w-full py-4 px-6 rounded-2xl font-bold text-xl shadow-xl transition-all ${
                        currentPage === 'rank'
                          ? 'bg-purple-600 text-white shadow-purple-500/50'
                          : 'bg-gray-800/50 hover:bg-gray-700 text-gray-200 hover:text-white border border-gray-700'
                      }`}
                    >
                      🏆 Rankings
                    </button>
                    
                    <button
                      onClick={() => {
                        onPageChange('friends');
                        setShowMobileMenu(false);
                      }}
                      className={`w-full py-4 px-6 rounded-2xl font-bold text-xl shadow-xl transition-all ${
                        currentPage === 'friends'
                          ? 'bg-indigo-600 text-white shadow-indigo-500/50'
                          : 'bg-gray-800/50 hover:bg-gray-700 text-gray-200 hover:text-white border border-gray-700'
                      }`}
                    >
                      👥 Friends
                    </button>
                    
                    <button
                      onClick={() => {
                        onPageChange('challenges');
                        setShowMobileMenu(false);
                      }}
                      className={`w-full py-4 px-6 rounded-2xl font-bold text-xl shadow-xl transition-all ${
                        currentPage === 'challenges'
                          ? 'bg-amber-600 text-white shadow-amber-500/50'
                          : 'bg-gray-800/50 hover:bg-gray-700 text-gray-200 hover:text-white border border-gray-700'
                      }`}
                    >
                      🔔 Challenge Invitations
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </nav>
      );
};

export default Navbar;

