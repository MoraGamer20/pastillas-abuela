import { useMemo } from 'react';
import {
  Pill,
  AlertTriangle,
  ShieldCheck,
  HeartPulse,
  ShoppingBag,
  FileText,
  Activity,
  Calendar,
  Apple,
  AlertCircle
} from 'lucide-react';
import { useMedications } from '../hooks/useMedications';
import { MedicationList } from '../components/public/MedicationList';
import { patientProfile } from '../data/patientProfile';

export function FamilyView() {
  const { medications } = useMedications();

  const totalMeds = medications.length;
  const lowStockMeds = useMemo(() => {
    return medications.filter(m => m.inventory_current <= m.inventory_alert_threshold);
  }, [medications]);

  const sosCount = useMemo(() => {
    return medications.filter(m => m.is_as_needed).length;
  }, [medications]);

  return (
    <div className="animate-fade-in">
      {/* Patient Consultation Banner */}
      <div
        className="card-official"
        style={{
          marginBottom: '1.5rem',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '5px solid var(--primary)'
        }}
      >
        <div className="card-body-clean" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 800, margin: 0 }}>
                  {patientProfile.name}
                </h1>
                <span className="badge badge-info">Expediente Clínico</span>
              </div>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Receta emitida: <strong>{patientProfile.prescriptionDate}</strong> • Próxima cita médica: <strong>{patientProfile.nextAppointment}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-ok">
                <ShieldCheck size={13} />
                <span>Pauta Activa</span>
              </span>
            </div>
          </div>

          {/* Vital Signs Grid from Prescription */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '0.625rem',
            padding: '0.875rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Activity size={18} color="var(--primary)" />
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Tensión Arterial
                </span>
                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {patientProfile.vitalSigns.bloodPressure}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <HeartPulse size={18} color="var(--status-danger-solid)" />
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Frecuencia Cardíaca
                </span>
                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {patientProfile.vitalSigns.pulse}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Calendar size={18} color="var(--status-warning-solid)" />
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Peso Corporal
                </span>
                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {patientProfile.vitalSigns.weight}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Clinical KPIs / Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            <Pill size={22} />
          </div>
          <div>
            <div className="metric-value">{totalMeds}</div>
            <div className="metric-label">Medicamentos en Pauta</div>
          </div>
        </div>

        <div className="metric-card">
          <div
            className="metric-icon-box"
            style={{
              backgroundColor: lowStockMeds.length > 0 ? 'var(--status-warning-bg)' : 'var(--status-ok-bg)',
              color: lowStockMeds.length > 0 ? 'var(--status-warning-solid)' : 'var(--status-ok-solid)'
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="metric-value">{lowStockMeds.length}</div>
            <div className="metric-label">
              {lowStockMeds.length > 0 ? 'Requieren Reposición' : 'Stock Completo'}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ backgroundColor: 'var(--status-info-bg)', color: 'var(--status-info-solid)' }}>
            <HeartPulse size={22} />
          </div>
          <div>
            <div className="metric-value">{sosCount}</div>
            <div className="metric-label">Uso Según Necesidad (SOS)</div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Responsive Grid (Content + Clinical Sidebar) */}
      <div className="dashboard-grid">
        
        {/* Main Column: Medication Feed */}
        <div>
          <MedicationList />
        </div>

        {/* Sidebar Column: Patient info & Farmacia alerts */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Medical Notice from Prescription */}
          <div className="card-official" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div className="card-body-clean" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertCircle size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '0.9375rem', margin: 0, color: 'var(--text-primary)' }}>
                  Indicación Médica Estricta
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {patientProfile.medicalWarning}
              </p>
            </div>
          </div>

          {/* Dieta y Estilo de Vida */}
          <div className="card-official">
            <div className="card-body-clean" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                <Apple size={18} color="var(--status-ok-solid)" />
                <h3 style={{ fontSize: '0.9375rem', margin: 0, color: 'var(--text-primary)' }}>
                  Prescripción Dietética
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.625rem' }}>
                {patientProfile.diet}
              </p>
              <ul style={{
                paddingLeft: '1.2rem',
                margin: 0,
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6
              }}>
                {patientProfile.generalRecommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stock Alerts Notice for Family */}
          {lowStockMeds.length > 0 ? (
            <div className="card-official" style={{ borderLeft: '4px solid var(--status-warning-solid)' }}>
              <div className="card-body-clean" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <ShoppingBag size={18} color="var(--status-warning-solid)" />
                  <h3 style={{ fontSize: '0.9375rem', margin: 0, color: 'var(--status-warning-text)' }}>
                    Aviso de Compra en Farmacia
                  </h3>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Los siguientes medicamentos están por debajo del umbral mínimo de seguridad:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {lowStockMeds.map(m => (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8125rem',
                        padding: '0.375rem 0.5rem',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-xs)'
                      }}
                    >
                      <strong style={{ color: 'var(--text-primary)' }}>{m.name}</strong>
                      <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                        Quedan {m.inventory_current}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card-official">
              <div className="card-body-clean" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <ShieldCheck size={18} color="var(--status-ok-solid)" />
                  <h3 style={{ fontSize: '0.9375rem', margin: 0, color: 'var(--status-ok-text)' }}>
                    Inventario en Orden
                  </h3>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                  Todos los medicamentos cuentan con unidades suficientes para las tomas habituales.
                </p>
              </div>
            </div>
          )}

          {/* Quick Care Guidelines */}
          <div className="card-official">
            <div className="card-body-clean" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <FileText size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '0.9375rem', margin: 0, color: 'var(--text-primary)' }}>
                  Pautas de Cuidado Asistencial
                </h3>
              </div>
              <ul style={{
                paddingLeft: '1.2rem',
                margin: 0,
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6
              }}>
                <li>Administrar Rybelsus con poca agua al despertar (esperar al menos 30 min para desayunar).</li>
                <li>Nebivolol y Losartán/Hidroclorotiazida se administran después del desayuno.</li>
                <li>Sitagliptina se administra 30 min antes del almuerzo e Insulina NPH después del almuerzo.</li>
                <li>Insulina Glargina, Atorvastatina y Ácido Acetilsalicílico después de la cena.</li>
                <li>Isosorbid únicamente en caso de dolor de pecho (sublingual).</li>
              </ul>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
