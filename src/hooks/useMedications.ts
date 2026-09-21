import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Medication, Comment, MedicationHistory } from '../types';
import { initialPrescription } from '../data/initialPrescription';

const STORAGE_KEYS = {
  MEDICATIONS: 'pastillas_medications_v2',
  HISTORY: 'pastillas_history_v2',
  COMMENTS: 'pastillas_comments_v2',
  LAST_AUDIT: 'pastillas_last_audit_date'
};

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [history, setHistory] = useState<Record<string, MedicationHistory[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper: Get local date string YYYY-MM-DD
  const getTodayDateString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  // Helper: Get current HH:mm
  const getCurrentTimeString = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  // 1. Core Automated Schedule Audit Engine
  const executeAudit = useCallback((currentMeds: Medication[], currentHistory: Record<string, MedicationHistory[]>) => {
    const today = getTodayDateString();
    const currentTime = getCurrentTimeString();
    let hasChanges = false;
    const newHistory = { ...currentHistory };

    const updatedMeds = currentMeds.map(med => {
      // As-needed (SOS) meds are not auto-deducted
      if (med.is_as_needed || !med.active || !med.schedule_time) {
        return med;
      }

      // Check if already deducted today
      const alreadyDeductedToday = med.last_deduction_date === today;

      // Check if schedule time has arrived or passed today
      const isTimePassedToday = currentTime >= med.schedule_time;

      if (!alreadyDeductedToday && isTimePassedToday) {
        const oldStock = med.inventory_current;
        const newStock = Math.max(0, oldStock - med.pills_per_dose);

        hasChanges = true;

        // Log audit history entry
        const historyItem: MedicationHistory = {
          id: crypto.randomUUID(),
          medication_id: med.id,
          action: 'Descuento Automático',
          previous_value: `${oldStock}`,
          new_value: `${newStock}`,
          author: 'Sistema Receta (Automático)',
          created_at: new Date().toISOString()
        };

        if (!newHistory[med.id]) {
          newHistory[med.id] = [];
        }
        newHistory[med.id] = [historyItem, ...newHistory[med.id]];

        return {
          ...med,
          inventory_current: newStock,
          last_deduction_date: today
        };
      }

      return med;
    });

    if (hasChanges) {
      try {
        localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(updatedMeds));
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
        localStorage.setItem(STORAGE_KEYS.LAST_AUDIT, today);
      } catch (err) {
        console.error("Error saving to localStorage", err);
      }
      return { updatedMeds, updatedHistory: newHistory, changed: true };
    }

    return { updatedMeds: currentMeds, updatedHistory: currentHistory, changed: false };
  }, []);

  // 2. Initial Data Loading & Synchronization
  const fetchData = useCallback(async () => {
    setLoading(true);

    // If Supabase is not configured, load from localStorage with initialPrescription fallback
    if (!isSupabaseConfigured) {
      try {
        const savedMeds = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
        const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        const savedComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);

        let initialList = initialPrescription;
        if (savedMeds) {
          try {
            const parsed = JSON.parse(savedMeds);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Merge with initial prescription to ensure any new schedule_time is kept
              initialList = initialPrescription.map(p => {
                const existing = parsed.find((m: Medication) => m.id === p.id || m.name === p.name);
                if (existing) {
                  return {
                    ...p,
                    inventory_current: typeof existing.inventory_current === 'number' ? existing.inventory_current : p.inventory_current,
                    inventory_initial: typeof existing.inventory_initial === 'number' ? existing.inventory_initial : p.inventory_initial,
                    last_deduction_date: existing.last_deduction_date || undefined
                  };
                }
                return p;
              });
            }
          } catch {
            initialList = initialPrescription;
          }
        }

        let parsedHistory: Record<string, MedicationHistory[]> = {};
        if (savedHistory) {
          try {
            parsedHistory = JSON.parse(savedHistory);
          } catch {}
        }

        let parsedComments: Record<string, Comment[]> = {};
        if (savedComments) {
          try {
            parsedComments = JSON.parse(savedComments);
          } catch {}
        }

        // Run automated audit on load
        const auditResult = executeAudit(initialList, parsedHistory);

        setMedications(auditResult.updatedMeds);
        setHistory(auditResult.updatedHistory);
        setComments(parsedComments);

        // Save active state
        localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(auditResult.updatedMeds));
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(auditResult.updatedHistory));

      } catch (err: any) {
        console.error("Local data load error", err);
        setMedications(initialPrescription);
      } finally {
        setLoading(false);
      }
      return;
    }

    // If Supabase is configured
    try {
      const { data: medsData, error: medsError } = await supabase!
        .from('medications')
        .select('*')
        .order('schedule_time', { ascending: true, nullsFirst: false });

      if (medsError) throw medsError;

      const { data: commentsData, error: commentsError } = await supabase!
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      const { data: historyData } = await supabase!
        .from('medication_history')
        .select('*')
        .order('created_at', { ascending: false });

      const groupedComments: Record<string, Comment[]> = {};
      (commentsData || []).forEach(c => {
        if (!groupedComments[c.medication_id]) groupedComments[c.medication_id] = [];
        groupedComments[c.medication_id].push(c);
      });

      const groupedHistory: Record<string, MedicationHistory[]> = {};
      (historyData || []).forEach(h => {
        if (!groupedHistory[h.medication_id]) groupedHistory[h.medication_id] = [];
        groupedHistory[h.medication_id].push(h);
      });

      const listToUse = (medsData && medsData.length > 0) ? medsData : initialPrescription;
      const auditResult = executeAudit(listToUse, groupedHistory);

      setMedications(auditResult.updatedMeds);
      setComments(groupedComments);
      setHistory(auditResult.updatedHistory);

    } catch (err: any) {
      console.error("Error fetching data from Supabase:", err);
      setError(err.message);
      setMedications(initialPrescription);
    } finally {
      setLoading(false);
    }
  }, [executeAudit]);

  useEffect(() => {
    fetchData();

    // Re-check schedule every 60 seconds while the page is open
    const interval = setInterval(() => {
      setMedications(currentMeds => {
        setHistory(currentHist => {
          const res = executeAudit(currentMeds, currentHist);
          if (res.changed) {
            return res.updatedHistory;
          }
          return currentHist;
        });
        const res = executeAudit(currentMeds, {});
        return res.changed ? res.updatedMeds : currentMeds;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchData, executeAudit]);

  // 3. Comments Handler
  const addComment = async (medicationId: string, authorName: string, content: string) => {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      medication_id: medicationId,
      author_name: authorName,
      content,
      created_at: new Date().toISOString()
    };

    setComments(prev => {
      const updated = {
        ...prev,
        [medicationId]: [newComment, ...(prev[medicationId] || [])]
      };
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(updated));
      return updated;
    });

    if (isSupabaseConfigured) {
      try {
        await supabase!.from('comments').insert([{
          medication_id: medicationId,
          author_name: authorName,
          content
        }]);
      } catch (err) {
        console.error("Error saving comment to Supabase", err);
      }
    }
  };

  // 4. Log History Helper
  const logHistory = async (medicationId: string, action: string, previousValue: string | null, newValue: string | null, author = 'Administrador') => {
    const newEntry: MedicationHistory = {
      id: crypto.randomUUID(),
      medication_id: medicationId,
      action,
      previous_value: previousValue,
      new_value: newValue,
      author,
      created_at: new Date().toISOString()
    };

    setHistory(prev => {
      const updated = {
        ...prev,
        [medicationId]: [newEntry, ...(prev[medicationId] || [])]
      };
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    });

    if (isSupabaseConfigured) {
      try {
        await supabase!.from('medication_history').insert([{
          medication_id: medicationId,
          action,
          previous_value: previousValue,
          new_value: newValue,
          author
        }]);
      } catch (err) {
        console.error("Error logging history to Supabase", err);
      }
    }
  };

  // 5. Admin & Auditing Actions
  const updateMedication = async (id: string, updates: Partial<Medication>, logMessage?: string) => {
    const med = medications.find(m => m.id === id);
    if (!med) return;

    const oldStock = med.inventory_current;
    const updatedMeds = medications.map(m => m.id === id ? { ...m, ...updates } : m);
    setMedications(updatedMeds);
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(updatedMeds));

    if (logMessage) {
      await logHistory(id, 'Ajuste de Auditoría', `${oldStock}`, `${updates.inventory_current ?? oldStock}`, 'Administrador');
    }

    if (isSupabaseConfigured) {
      try {
        await supabase!.from('medications').update(updates).eq('id', id);
      } catch (err) {
        console.error("Error updating medication in Supabase", err);
      }
    }
  };

  // Quick action: Restore missed dose (e.g. Abuela skipped it)
  const markDoseSkipped = async (id: string) => {
    const med = medications.find(m => m.id === id);
    if (!med) return;
    const restoredStock = med.inventory_current + med.pills_per_dose;
    await updateMedication(
      id,
      { inventory_current: restoredStock },
      `Toma omitida por la abuela: se reincorporan +${med.pills_per_dose} al inventario`
    );
  };

  // Quick action: Extra dose taken
  const recordExtraDose = async (id: string) => {
    const med = medications.find(m => m.id === id);
    if (!med) return;
    const newStock = Math.max(0, med.inventory_current - med.pills_per_dose);
    await updateMedication(
      id,
      { inventory_current: newStock },
      `Toma extra registrada: -${med.pills_per_dose} de inventario`
    );
  };

  // Quick action: Register new box
  const registerNewBox = async (id: string, totalUnits: number) => {
    const med = medications.find(m => m.id === id);
    if (!med) return;
    await updateMedication(
      id,
      {
        inventory_current: totalUnits,
        inventory_initial: totalUnits
      },
      `Nueva caja de ${med.name}: ${totalUnits} ${med.presentation || 'unidades'}`
    );
  };

  const addMedication = async (med: Omit<Medication, 'id'>) => {
    const newId = crypto.randomUUID();
    const newMed: Medication = { ...med, id: newId };
    const updatedList = [...medications, newMed];
    setMedications(updatedList);
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(updatedList));
    await logHistory(newId, 'Creación', null, `Medicamento ${med.name} añadido`);

    if (isSupabaseConfigured) {
      try {
        await supabase!.from('medications').insert([med]);
      } catch (err) {
        console.error("Error creating medication in Supabase", err);
      }
    }
  };

  const deleteMedication = async (id: string) => {
    const updatedList = medications.filter(m => m.id !== id);
    setMedications(updatedList);
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(updatedList));

    if (isSupabaseConfigured) {
      try {
        await supabase!.from('medications').delete().eq('id', id);
      } catch (err) {
        console.error("Error deleting medication in Supabase", err);
      }
    }
  };

  const fetchHistory = async () => {
    if (!isSupabaseConfigured) {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
        if (saved) setHistory(JSON.parse(saved));
      } catch {}
      return;
    }

    try {
      const { data } = await supabase!.from('medication_history').select('*').order('created_at', { ascending: false });
      const grouped: Record<string, MedicationHistory[]> = {};
      (data || []).forEach(h => {
        if (!grouped[h.medication_id]) grouped[h.medication_id] = [];
        grouped[h.medication_id].push(h);
      });
      setHistory(grouped);
    } catch (err) {
      console.error("Error fetching history from Supabase", err);
    }
  };

  // Reset to initial prescription (Emergency tool for admin)
  const resetToPrescription = () => {
    localStorage.removeItem(STORAGE_KEYS.MEDICATIONS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.LAST_AUDIT);
    setMedications(initialPrescription);
    setHistory({});
  };

  return {
    medications,
    comments,
    history,
    loading,
    error,
    addComment,
    addMedication,
    updateMedication,
    deleteMedication,
    fetchData,
    fetchHistory,
    markDoseSkipped,
    recordExtraDose,
    registerNewBox,
    resetToPrescription
  };
}
