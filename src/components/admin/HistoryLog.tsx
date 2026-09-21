import { ArrowRight, Clock, User } from 'lucide-react';
import type { MedicationHistory } from '../../types';

interface HistoryLogProps {
  history: MedicationHistory[];
}

export function HistoryLog({ history }: HistoryLogProps) {
  if (history.length === 0) {
    return (
      <div style={{
        padding: '0.875rem',
        color: 'var(--text-muted)',
        fontStyle: 'italic',
        fontSize: '0.8125rem',
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-sm)',
        textAlign: 'center'
      }}>
        No se registran cambios previos en este medicamento.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {history.map(entry => (
        <div
          key={entry.id}
          style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.75rem 0.875rem',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '3px solid var(--primary)',
            fontSize: '0.8125rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.375rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{entry.action}</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} />
              {new Date(entry.created_at).toLocaleString('es-ES', {
                dateStyle: 'short',
                timeStyle: 'short'
              })}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{entry.previous_value || 'Inicial'}</span>
            <ArrowRight size={12} color="var(--primary)" />
            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{entry.new_value || 'Actual'}</strong>
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <User size={11} />
            <span>Registrado por: {entry.author}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
