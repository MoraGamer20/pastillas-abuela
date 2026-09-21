import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import { FamilyView } from './pages/FamilyView';

import { AdminPanel } from './pages/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="app-container" style={{ flex: 1 }}>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<FamilyView />} />
          
          {/* Auth Route */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Routes>
      </main>
      <footer style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '1.25rem 1rem',
        textAlign: 'center',
        fontSize: '0.8125rem',
        color: 'var(--text-muted)'
      }}>
        <div className="app-container" style={{ padding: 0 }}>
          <p style={{ margin: 0 }}>
            Sistema Familiar de Control Farmacológico • Uso exclusivo de consulta y seguimiento asistencial.
          </p>
        </div>
      </footer>
    </BrowserRouter>
  );
}

export default App;
