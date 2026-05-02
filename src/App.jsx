import { useState } from 'react';
import Login from './pages/login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUserRole(localStorage.getItem('userRole') || 'Doctor');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole('');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold">Welcome to Smart Health Care Dashboard</h1>
      <p className="mt-4">You are now logged in as {userRole}!</p>
      <button 
        onClick={handleLogout}
        className="mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-[#333]"
      >
        Logout
      </button>
    </div>
  );
}

export default App;