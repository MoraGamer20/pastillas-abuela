import { useEffect, useState, useMemo } from 'react';
import {
  Package,
  Edit,
  Clock,
  History,
  CheckCircle2,
  X,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ShieldCheck
} from 'lucide-react';
import { useMedications } from '../hooks/useMedications';
import { HistoryLog } from '../components/admin/HistoryLog';
import type { Medication } from '../types';

export function AdminPanel() {
  const { medications, history, loading, updateMedication, fetchHistory } = useMedications();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  // Modal States
  const [activeModal, setActiveModal] = useState<'refill' | 'adjust' | 'schedule' | null>(null);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);

  // Form Inputs for Modals
  const [modalCount, setModalCount] = useState<number>(0);
  const [modalScheduleTime, setModalScheduleTime] = useState<string>('');

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openRefillModal = (med: Medication) => {
    setSelectedMed(med);
    setModalCount(med.inventory_initial || 30);
    setActiveModal('refill');
  };

  const openAdjustModal = (med: Medication) => {
    setSelectedMed(med);
    setModalCount(med.inventory_current);
    setActiveModal('adjust');
  };

  const openScheduleModal = (med: Medication) => {
    setSelectedMed(med);
    setModalScheduleTime(med.schedule_time || '08:00');
    setActiveModal('schedule');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedMed(null);
  };

  const handleSaveRefill = () => {
    if (!selectedMed || modalCount <= 0) return;
    updateMedication(
      selectedMed.id,
      {
        inventory_current: modalCount,
        inventory_initial: modalCount
      },
      `Nueva caja registrada: ${selectedMed.inventory_current} → ${modalCount} unidades`
    );
    closeModal();
  };

  const handleSaveAdjust = () => {
    if (!selectedMed || modalCount < 0) return;
    updateMedication(
      selectedMed.id,
      { inventory_current: modalCount },
      `Ajuste manual de inventario: ${selectedMed.inventory_current} → ${modalCount}`
    );
    closeModal();
  };

  const handleSaveSchedule = () => {
    if (!selectedMed) return;
    updateMedication(
      selectedMed.id,
      { schedule_time: modalScheduleTime || null },
      `Horario pautado actualizado: ${selectedMed.schedule_time || 'Sin hora'} → ${modalScheduleTime || 'Sin hora'}`
    );
    closeModal();
  };

  const filteredMeds = useMemo(() => {
    return medications.filter(m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.dosage.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [medications, searchTerm]);

  if (loading) {
    return (
      <div className="card-official" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Admin Title Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800 }}>
              Gestión Farmacológica
            </h1>
            <span className="badge badge-info">Modo Administrador</span>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Control de lotes, ajustes de stock, asignación de horas exactas y auditoría de cambios.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Filtrar medicamento..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {/* Medications Table/Card List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredMeds.map(med => {
          const isAgotado = med.inventory_current === 0;
          const isPocasUnidades = !isAgotado && med.inventory_current <= med.inventory_alert_threshold;

          return (
            <div key={med.id} className="card-official">
              <div className="card-body-clean" style={{ padding: '1.25rem' }}>
                
                {/* Header Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.125rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {med.name}
                    </h3>
                    <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
                      {med.dosage}
                    </span>
                    {med.is_as_needed ? (
                      <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                        Según Necesidad (SOS)
                      </span>
                    ) : (
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                        <Clock size={12} />
                        {med.schedule_time ? med.schedule_time : 'Sin hora fija'}
                      </span>
                    )}
                  </div>

                  {/* Quick Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {!med.is_as_needed && (
                      <button
                        onClick={() => openScheduleModal(med)}
                        className="btn btn-secondary btn-sm"
                        title="Asignar o modificar horario"
                      >
                        <Clock size={14} />
                        <span>Horario</span>
                      </button>
                    )}
                    <button
                      onClick={() => openRefillModal(med)}
                      className="btn btn-secondary btn-sm"
                      title="Registrar nueva caja comprada"
                    >
                      <Package size={14} />
                      <span>Nueva Caja</span>
                    </button>
                    <button
                      onClick={() => openAdjustModal(med)}
                      className="btn btn-outline btn-sm"
                      title="Ajustar stock actual"
                    >
                      <Edit size={14} />
                      <span>Ajustar Stock</span>
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.875rem',
                  marginBottom: '0.875rem',
                  fontSize: '0.875rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Pauta Médica
                    </span>
                    <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)' }}>
                      {med.original_instruction}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Inventario Actual
                    </span>
                    <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600, color: isAgotado ? 'var(--status-danger-text)' : isPocasUnidades ? 'var(--status-warning-text)' : 'var(--text-primary)' }}>
                      {med.inventory_current} de {med.inventory_initial} unidades ({med.presentation})
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Umbral de Alerta
                    </span>
                    <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)' }}>
                      Avisar si quedan ≤ {med.inventory_alert_threshold} unidades
                    </p>
                  </div>
                </div>

                {/* Collapsible History */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setExpandedHistory(expandedHistory === med.id ? null : med.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      fontWeight: 600
                    }}
                  >
                    <History size={14} />
                    <span>Auditoría de Cambios</span>
                    {expandedHistory === med.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {expandedHistory === med.id && (
                    <div className="animate-fade-in" style={{ marginTop: '0.75rem' }}>
                      <HistoryLog history={history[med.id] || []} />
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: NUEVA CAJA */}
      {activeModal === 'refill' && selectedMed && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Registrar Nueva Caja</h3>
              </div>
              <button onClick={closeModal} className="btn-ghost btn-sm" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Medicamento: <strong>{selectedMed.name} ({selectedMed.dosage})</strong>
              </p>
              <div className="form-group">
                <label className="form-label">Unidades contenidas en la nueva caja</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={modalCount}
                  onChange={e => setModalCount(parseInt(e.target.value, 10) || 0)}
                  autoFocus
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem', display: 'block' }}>
                  El inventario actual y el total se reiniciarán a esta cantidad.
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="btn btn-outline btn-sm">
                Cancelar
              </button>
              <button onClick={handleSaveRefill} className="btn btn-primary btn-sm">
                <CheckCircle2 size={16} />
                <span>Confirmar Nueva Caja</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AJUSTAR INVENTARIO */}
      {activeModal === 'adjust' && selectedMed && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SlidersHorizontal size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Ajustar Inventario Manual</h3>
              </div>
              <button onClick={closeModal} className="btn-ghost btn-sm" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Medicamento: <strong>{selectedMed.name}</strong> (Actual: {selectedMed.inventory_current} pastillas)
              </p>
              <div className="form-group">
                <label className="form-label">Nuevo conteo físico de pastillas</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setModalCount(prev => Math.max(0, prev - 1))}
                  >
                    -1
                  </button>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={modalCount}
                    onChange={e => setModalCount(parseInt(e.target.value, 10) || 0)}
                    style={{ textAlign: 'center', fontWeight: 700 }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setModalCount(prev => prev + 1)}
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="btn btn-outline btn-sm">
                Cancelar
              </button>
              <button onClick={handleSaveAdjust} className="btn btn-primary btn-sm">
                <CheckCircle2 size={16} />
                <span>Guardar Ajuste</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CAMBIAR HORARIO */}
      {activeModal === 'schedule' && selectedMed && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Pautar Horario de Toma</h3>
              </div>
              <button onClick={closeModal} className="btn-ghost btn-sm" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Medicamento: <strong>{selectedMed.name}</strong>
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Pauta original de la receta: <em>"{selectedMed.original_instruction}"</em>
              </p>

              <div className="form-group">
                <label className="form-label">Hora exacta (formato 24h)</label>
                <input
                  type="time"
                  className="form-input"
                  value={modalScheduleTime}
                  onChange={e => setModalScheduleTime(e.target.value)}
                  style={{ fontSize: '1.125rem', padding: '0.625rem' }}
                />
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalScheduleTime('08:00')}>
                  08:00 (Desayuno)
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalScheduleTime('14:00')}>
                  14:00 (Comida)
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalScheduleTime('20:00')}>
                  20:00 (Cena)
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalScheduleTime('22:00')}>
                  22:00 (Noche)
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="btn btn-outline btn-sm">
                Cancelar
              </button>
              <button onClick={handleSaveSchedule} className="btn btn-primary btn-sm">
                <CheckCircle2 size={16} />
                <span>Guardar Horario</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety Notice Footer */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
          <ShieldCheck size={16} color="var(--primary)" />
          Todos los cambios realizados en el panel quedan registrados en el historial de auditoría clínica.
        </p>
      </div>
    </div>
  );
}
