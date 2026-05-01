import { useState } from 'react';
import Login from './pages/login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    console.log('Logged in:', userData);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Welcome to Smart Health Care Dashboard</h1>
      <p>You are now logged in!</p>
    </div>
  );
}

export default App;