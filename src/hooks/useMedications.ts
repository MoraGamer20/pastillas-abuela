import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Medication, Comment, MedicationHistory } from '../types';
import { initialPrescription } from '../data/initialPrescription';

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [history, setHistory] = useState<Record<string, MedicationHistory[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      console.warn("Supabase no está configurado. Usando datos de prueba locales.");
      setMedications(initialPrescription);
      setComments({});
      setLoading(false);
      return;
    }

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

      setMedications(medsData || []);
      
      // Group comments by medication_id
      const groupedComments: Record<string, Comment[]> = {};
      (commentsData || []).forEach(comment => {
        if (!groupedComments[comment.medication_id]) {
          groupedComments[comment.medication_id] = [];
        }
        groupedComments[comment.medication_id].push(comment);
      });
      setComments(groupedComments);

    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (medicationId: string, authorName: string, content: string) => {
    if (!isSupabaseConfigured) {
      // Local fallback for testing
      const newComment: Comment = {
        id: crypto.randomUUID(),
        medication_id: medicationId,
        author_name: authorName,
        content,
        created_at: new Date().toISOString()
      };
      setComments(prev => ({
        ...prev,
        [medicationId]: [newComment, ...(prev[medicationId] || [])]
      }));
      return;
    }

    const { error } = await supabase!.from('comments').insert([{
      medication_id: medicationId,
      author_name: authorName,
      content
    }]);

    if (error) {
      console.error("Error adding comment", error);
      alert("Hubo un error al guardar el comentario.");
    } else {
      fetchData(); // Refresh comments
    }
  };

  // Admin Functions
  const addMedication = async (med: Omit<Medication, 'id'>) => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase!.from('medications').insert([med]).select();
    if (data && data[0]) {
      await logHistory(data[0].id, 'Creación', null, 'Medicamento creado');
    }
    fetchData();
  };

  const updateMedication = async (id: string, updates: Partial<Medication>, logMessage?: string) => {
    if (!isSupabaseConfigured) return;
    const oldMed = medications.find(m => m.id === id);
    await supabase!.from('medications').update(updates).eq('id', id);
    
    if (logMessage && oldMed) {
      await logHistory(id, 'Edición', null, logMessage);
    }
    fetchData();
  };

  const deleteMedication = async (id: string) => {
    if (!isSupabaseConfigured) return;
    await supabase!.from('medications').delete().eq('id', id);
    fetchData();
  };

  const fetchHistory = async () => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase!.from('medication_history').select('*').order('created_at', { ascending: false });
    
    const groupedHistory: Record<string, MedicationHistory[]> = {};
    (data || []).forEach(item => {
      if (!groupedHistory[item.medication_id]) groupedHistory[item.medication_id] = [];
      groupedHistory[item.medication_id].push(item);
    });
    setHistory(groupedHistory);
  };

  const logHistory = async (medicationId: string, action: string, previousValue: string | null, newValue: string | null) => {
    if (!isSupabaseConfigured) return;
    await supabase!.from('medication_history').insert([{
      medication_id: medicationId,
      action,
      previous_value: previousValue,
      new_value: newValue,
      author: 'Administrador'
    }]);
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
    fetchHistory
  };
}
