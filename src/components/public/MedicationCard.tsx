import { Clock, Pill, AlertTriangle, CheckCircle2, Package, AlertCircle } from 'lucide-react';
import type { Medication, Comment } from '../../types';
import { CommentsSection } from './CommentsSection';

interface PublicMedicationCardProps {
  medication: Medication;
  comments: Comment[];
  onAddComment: (medicationId: string, author: string, content: string) => void;
}

export function PublicMedicationCard({ medication, comments, onAddComment }: PublicMedicationCardProps) {
  const isAgotado = medication.inventory_current === 0;
  const isPocasUnidades = !isAgotado && medication.inventory_current <= medication.inventory_alert_threshold;

  // Percentage of stock left
  const stockPercentage = medication.inventory_initial > 0
    ? Math.min(100, Math.max(0, Math.round((medication.inventory_current / medication.inventory_initial) * 100)))
    : 0;

  // Status styling
  const statusBorderColor = isAgotado
    ? 'var(--status-danger-solid)'
    : isPocasUnidades
    ? 'var(--status-warning-solid)'
    : 'var(--status-ok-solid)';

  return (
    <article
      className="card-official animate-fade-in"
      style={{
        borderLeft: `5px solid ${statusBorderColor}`,
        marginBottom: '1rem'
      }}
    >
      <div className="card-body-clean" style={{ padding: '1.25rem' }}>
        {/* Header Top Row: Name, Dosage and Stock Badge */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.625rem',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', minWidth: 0 }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
              {medication.name}
            </h3>
            <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
              {medication.dosage}
            </span>
          </div>

          {/* Stock State Badge */}
          <div style={{ flexShrink: 0 }}>
            {isAgotado ? (
              <span className="badge badge-danger">
                <AlertTriangle size={13} />
                <span>Agotado</span>
              </span>
            ) : isPocasUnidades ? (
              <span className="badge badge-warning">
                <AlertTriangle size={13} />
                <span>Pocas Unidades</span>
              </span>
            ) : (
              <span className="badge badge-ok">
                <CheckCircle2 size={13} />
                <span>Disponible</span>
              </span>
            )}
          </div>
        </div>

        {/* Schedule & Timing Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          width: '100%'
        }}>
          {medication.is_as_needed ? (
            <span className="badge badge-warning">
              <AlertCircle size={13} />
              <span>Uso SOS / En caso de dolor de pecho</span>
            </span>
          ) : (
            <>
              <span className="badge badge-info" style={{ fontWeight: 700, flexShrink: 0 }}>
                <Clock size={13} />
                <span>{medication.schedule_time ? `Hora: ${medication.schedule_time}` : 'Pauta según comida'}</span>
              </span>
              {medication.timing_label && (
                <span style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  lineHeight: 1.35,
                  wordBreak: 'break-word',
                  maxWidth: '100%'
                }}>
                  {medication.timing_label}
                </span>
              )}
            </>
          )}
        </div>

        {/* Content Details: 1 column on mobile, 2 columns on tablet/desktop */}
        <div className="med-details-grid">
          {/* Dose Info */}
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.875rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '0.25rem'
            }}>
              <Pill size={14} color="var(--primary)" />
              Toma Indicada
            </span>
            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {medication.pills_per_dose} {medication.presentation || 'unidad(es)'}
            </p>
          </div>

          {/* Inventory Progress Box */}
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.875rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-muted)'
              }}>
                <Package size={14} color="var(--primary)" />
                Inventario
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {medication.inventory_current} / {medication.inventory_initial} ({stockPercentage}%)
              </span>
            </div>

            <div className="inventory-progress-track">
              <div
                className="inventory-progress-fill"
                style={{
                  width: `${stockPercentage}%`,
                  backgroundColor: isAgotado
                    ? 'var(--status-danger-solid)'
                    : isPocasUnidades
                    ? 'var(--status-warning-solid)'
                    : 'var(--status-ok-solid)'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>Alerta si ≤ {medication.inventory_alert_threshold}</span>
              <span>{medication.inventory_current} restantes</span>
            </div>
          </div>
        </div>

        {/* Medical Instruction Box */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          padding: '0.875rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: '0.25rem'
          }}>
            Pauta e Indicación Médica
          </span>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {medication.original_instruction}
          </p>
        </div>

        {/* Comments Section */}
        <CommentsSection
          medicationId={medication.id}
          comments={comments}
          onAddComment={onAddComment}
        />
      </div>
    </article>
  );
}
