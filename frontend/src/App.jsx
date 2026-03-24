import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Rank from './pages/Rank';
import Friends from './pages/Friends';
import Challenges from './pages/Challenges';
import Navbar from './components/Navbar';



function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');




  if (!user) {
    return showRegister ? (
      <Register setUser={setUser} setShowRegister={setShowRegister} />
    ) : (
      <Login setUser={setUser} setShowRegister={setShowRegister} />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} setUser={setUser} />;
      case 'rank':
        return <Rank user={user} />;
      case 'friends':
        return <Friends user={user} />;
      case 'challenges':
        return <Challenges user={user} />;
      default:
        return <Dashboard user={user} setUser={setUser} />;


    }
  };

  return (
    <div className="dark">
      <Navbar 
        user={user} 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        setUser={setUser}
      />

      {renderPage()}
    </div>
  );


}

export default App;
