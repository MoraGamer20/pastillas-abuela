import { useState, useMemo } from 'react';
import { Search, Filter, AlertTriangle, Pill, Clock } from 'lucide-react';
import { useMedications } from '../../hooks/useMedications';
import { PublicMedicationCard } from './MedicationCard';

type FilterTab = 'all' | 'scheduled' | 'as_needed' | 'low_stock';

export function MedicationList() {
  const { medications, comments, loading, addComment } = useMedications();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const lowStockCount = useMemo(() => {
    return medications.filter(m => m.inventory_current <= m.inventory_alert_threshold).length;
  }, [medications]);

  const filteredMeds = useMemo(() => {
    return medications.filter(med => {
      // Search filter
      const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.dosage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.original_instruction.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Tab filter
      if (activeFilter === 'scheduled') return !med.is_as_needed;
      if (activeFilter === 'as_needed') return med.is_as_needed;
      if (activeFilter === 'low_stock') return med.inventory_current <= med.inventory_alert_threshold;

      return true;
    });
  }, [medications, searchTerm, activeFilter]);

  if (loading) {
    return (
      <div className="card-official" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
        <div style={{
          display: 'inline-block',
          width: '32px',
          height: '32px',
          border: '3px solid var(--border-medium)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '1rem'
        }} />
        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 500 }}>
          Cargando expediente farmacológico...
        </p>
      </div>
    );
  }

  if (medications.length === 0) {
    return (
      <div className="card-official" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <Pill size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No hay medicamentos registrados</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
          El administrador debe inicializar o dar de alta las prescripciones.
        </p>
      </div>
    );
  }

  const regularMeds = filteredMeds.filter(m => !m.is_as_needed);
  const asNeededMeds = filteredMeds.filter(m => m.is_as_needed);

  return (
    <div>
      {/* Controls Bar: Search & Filter Chips */}
      <div style={{ marginBottom: '1.5rem' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre, dosis o indicación..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Filter Chips */}
        <div className="filter-bar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
          >
            <Filter size={14} />
            <span>Todos ({medications.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('scheduled')}
            className={`filter-chip ${activeFilter === 'scheduled' ? 'active' : ''}`}
          >
            <Clock size={14} />
            <span>Pautados ({medications.filter(m => !m.is_as_needed).length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('as_needed')}
            className={`filter-chip ${activeFilter === 'as_needed' ? 'active' : ''}`}
          >
            <Pill size={14} />
            <span>Según Necesidad (SOS)</span>
          </button>

          <button
            onClick={() => setActiveFilter('low_stock')}
            className={`filter-chip ${activeFilter === 'low_stock' ? 'active' : ''}`}
            style={lowStockCount > 0 && activeFilter !== 'low_stock' ? { borderColor: 'var(--status-warning-border)', color: 'var(--status-warning-text)' } : {}}
          >
            <AlertTriangle size={14} />
            <span>Stock Bajo ({lowStockCount})</span>
          </button>
        </div>
      </div>

      {/* Results Rendering */}
      {filteredMeds.length === 0 ? (
        <div className="card-official" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            No se encontraron medicamentos que coincidan con la búsqueda o filtro seleccionado.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Regular Scheduled Medications */}
          {regularMeds.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} color="var(--primary)" />
                  Tomas Pautadas Diarias
                </h2>
                <span className="badge badge-neutral">{regularMeds.length}</span>
              </div>
              <div>
                {regularMeds.map(med => (
                  <PublicMedicationCard
                    key={med.id}
                    medication={med}
                    comments={comments[med.id] || []}
                    onAddComment={addComment}
                  />
                ))}
              </div>
            </section>
          )}

          {/* As-Needed / Rescue Medications */}
          {asNeededMeds.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-warning-text)' }}>
                  <AlertTriangle size={18} color="var(--status-warning-solid)" />
                  Medicamentos de Rescate / Según Necesidad
                </h2>
                <span className="badge badge-warning">{asNeededMeds.length}</span>
              </div>
              <div>
                {asNeededMeds.map(med => (
                  <PublicMedicationCard
                    key={med.id}
                    medication={med}
                    comments={comments[med.id] || []}
                    onAddComment={addComment}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
