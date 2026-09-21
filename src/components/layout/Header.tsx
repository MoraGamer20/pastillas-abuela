import { Link, useLocation } from 'react-router-dom';
import { LogOut, Settings, Moon, Sun, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export function Header() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = sessionStorage.getItem('adminAuth') === 'true';

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    window.location.href = '/';
  };

  const todayFormatted = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  // Capitalize first letter of weekday
  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <header style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-xs)'
    }}>
      <div className="app-container" style={{ padding: '0.875rem 1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          
          {/* Brand & Identity */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-subtle)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em'
                }}>
                  Control de Pastillas
                </span>
                <span className="badge badge-info" style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}>
                  Familiar
                </span>
              </div>
              <p style={{
                margin: 0,
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 500
              }}>
                <span className="hide-on-mobile">Paciente: </span>Alicia Reyes • <span className="hide-on-mobile">{capitalizedDate}</span><span className="hide-on-desktop">Hoy</span>
              </p>
            </div>
          </Link>

          {/* Right Controls: Theme Toggle & Admin Access */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-icon"
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label="Alternar modo oscuro"
              style={{ width: '36px', height: '36px' }}
            >
              {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} />}
            </button>

            {isAdmin ? (
              <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                {location.pathname !== '/admin' && (
                  <Link to="/admin" className="btn btn-secondary btn-sm" style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}>
                    <Settings size={14} />
                    <span className="hide-on-mobile">Panel</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--status-danger-text)', padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                  title="Cerrar Sesión"
                >
                  <LogOut size={14} />
                  <span className="hide-on-mobile">Salir</span>
                </button>
              </div>
            ) : (
              location.pathname !== '/admin/login' && (
                <Link to="/admin/login" className="btn btn-outline btn-sm" style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}>
                  <Settings size={14} />
                  <span className="hide-on-mobile">Administrar</span>
                </Link>
              )
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
