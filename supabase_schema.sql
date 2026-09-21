-- Supabase SQL Schema for Pastillas de la Abuela (Seguridad Mejorada)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: medications
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  presentation TEXT,
  original_instruction TEXT NOT NULL,
  schedule_time TEXT, -- Nullable, configurable by admin
  is_as_needed BOOLEAN DEFAULT false,
  inventory_initial INTEGER NOT NULL DEFAULT 0,
  inventory_current INTEGER NOT NULL DEFAULT 0,
  inventory_alert_threshold INTEGER NOT NULL DEFAULT 5,
  pills_per_dose INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table: comments (Public can insert, anyone can read)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table: medication_history (Admin only)
CREATE TABLE IF NOT EXISTS public.medication_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  action TEXT NOT NULL, 
  previous_value TEXT,
  new_value TEXT,
  author TEXT DEFAULT 'Administrador',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_history ENABLE ROW LEVEL SECURITY;

-- MEDICATIONS:
-- Familia (Público): Solo lectura
CREATE POLICY "Familia puede ver medicamentos" 
  ON public.medications FOR SELECT USING (true);

-- Administrador (Autenticado): Todo el acceso (Insert, Update, Delete)
CREATE POLICY "Admin puede modificar medicamentos" 
  ON public.medications FOR ALL 
  USING (auth.role() = 'authenticated');


-- COMMENTS:
-- Familia (Público): Puede leer y crear comentarios
CREATE POLICY "Familia puede ver comentarios" 
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "Familia puede crear comentarios" 
  ON public.comments FOR INSERT WITH CHECK (true);
  
-- Admin puede hacer todo con los comentarios (ej. borrar si es necesario)
CREATE POLICY "Admin puede gestionar comentarios" 
  ON public.comments FOR ALL 
  USING (auth.role() = 'authenticated');


-- MEDICATION_HISTORY:
-- Familia (Público): No puede ver ni modificar el historial (Opcional: si quieres que lo vean, cambia a SELECT USING (true))
-- Dejaremos que solo el Admin lo vea para mantener la vista familiar limpia.
CREATE POLICY "Solo Admin puede ver historial" 
  ON public.medication_history FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Solo Admin puede insertar historial" 
  ON public.medication_history FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- DATOS INICIALES: RECETA DE ALICIA REYES LIMAS
-- ==========================================

INSERT INTO public.medications 
  (name, dosage, presentation, original_instruction, schedule_time, is_as_needed, inventory_initial, inventory_current, inventory_alert_threshold, pills_per_dose)
VALUES
  ('RYBELSUS', '7 mg', 'tabletas', 'Tomar una tableta con poca agua cada 24 horas al levantarse y esperar al menos 30 minutos para desayunar.', NULL, false, 30, 30, 5, 1),
  ('SITAGLIPTINA', '100 mg', 'tabletas', 'Tomar una tableta cada 24 horas 30 minutos antes del almuerzo.', NULL, false, 30, 30, 5, 1),
  ('NEBIVOLOL', '5 mg', 'tabletas', 'Tomar una tableta cada 24 horas después del desayuno.', NULL, false, 30, 30, 5, 1),
  ('LOSARTAN/HIDROCLOROTIAZIDA', '50/12.5 mg', 'tabletas', 'Tomar una tableta cada 24 horas después del desayuno.', NULL, false, 30, 30, 5, 1),
  ('INSULINA NPH', '15 unidades', 'suspensión inyectable', 'Aplicar 15 unidades cada 24 horas vía subcutánea después del almuerzo.', NULL, false, 100, 100, 15, 15),
  ('INSULINA GLARGINA', '25 unidades', 'solución inyectable', 'Aplicar 25 unidades vía subcutánea cada 24 horas después de la cena.', NULL, false, 100, 100, 25, 25),
  ('ATORVASTATINA', '20 mg', 'tabletas', 'Tomar una tableta cada 24 horas después de la cena.', NULL, false, 30, 30, 5, 1),
  ('ÁCIDO ACETILSALICÍLICO', '100 mg', 'tabletas', 'Tomar una tableta cada 24 horas después de la cena.', NULL, false, 30, 30, 5, 1),
  ('ISOSORBID', '5 mg', 'tabletas sublinguales', 'Disolver una tableta bajo la lengua en caso de dolor de pecho.', NULL, true, 30, 30, 5, 1);

