import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export default function AdminLogin() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN ?? '';

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ADMIN_PIN) {
      setError('El PIN no está configurado en las variables de entorno.');
      return;
    }
    setLoading(true);
    setError('');

    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('adminAuth', 'true');
      navigate('/admin');
    } else {
      setError('El PIN introducido es incorrecto. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{
      maxWidth: '420px',
      margin: '3rem auto',
      width: '100%'
    }}>
      <div className="card-official">
        <div className="card-body-clean" style={{ padding: '2rem 1.75rem' }}>
          
          {/* Security Icon & Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--primary-subtle)',
              border: '1px solid var(--primary-border)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              marginBottom: '1rem'
            }}>
              <Lock size={26} />
            </div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, margin: '0 0 0.375rem 0' }}>
              Acceso Administrativo
            </h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Introduce el PIN de seguridad para gestionar recetas e inventario
            </p>
          </div>

          {!isSupabaseConfigured && (
            <div style={{
              backgroundColor: 'var(--primary-subtle)',
              border: '1px solid var(--primary-border)',
              color: 'var(--primary-text)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ShieldCheck size={16} style={{ flexShrink: 0 }} />
              <span>
                <strong>Modo Local Activo:</strong> Acceso autenticado mediante PIN maestro.
              </span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-pin-input">
                PIN Maestro de Acceso
              </label>
              <input
                id="admin-pin-input"
                type="password"
                className="form-input"
                placeholder="••••"
                value={pin}
                onChange={e => setPin(e.target.value)}
                required
                disabled={loading}
                autoFocus
                style={{
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  letterSpacing: '0.3em',
                  padding: '0.75rem'
                }}
              />
            </div>

            {error && (
              <div style={{
                backgroundColor: 'var(--status-danger-bg)',
                border: '1px solid var(--status-danger-border)',
                color: 'var(--status-danger-text)',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem'
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Acceder al Panel'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-ghost btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <ArrowLeft size={14} />
              <span>Volver a la vista familiar</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
