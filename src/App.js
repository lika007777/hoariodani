import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Dashboard from './pages/Dashboard';
import Disciplinas from './pages/Disciplinas';
import Horarios from './pages/Horarios';
import Testes from './pages/Testes';
import Notas from './pages/Notas';
import Navbar from './components/Navbar';
import './App.css';

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
    return <div>Carregando...</div>;
  }

  return (
    <BrowserRouter>
      {session ? (
        <>
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/disciplinas" element={<Disciplinas />} />
              <Route path="/horarios" element={<Horarios />} />
              <Route path="/testes" element={<Testes />} />
              <Route path="/notas" element={<Notas />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </>
      ) : (
        <Routes>
          <Route path="*" element={<Auth />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
