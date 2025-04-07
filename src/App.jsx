import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import supabase from './helper/supabaseClient';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Goals from './pages/Goals';
import GoalDetail from './pages/GoalDetail';
import Settings from './pages/Settings';
import Navigation from './components/Navigation';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router basename="/daility">
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/goals" />} />
        <Route path="/register" element={!session ? <Register /> : <Navigate to="/goals" />} />
        <Route path="/goals" element={session ? <Goals /> : <Navigate to="/" />} />
        <Route path="/goals/:id" element={session ? <GoalDetail /> : <Navigate to="/" />} />
        <Route path="/settings" element={session ? <Settings /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;