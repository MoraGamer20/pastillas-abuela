export interface Medication {
  id: string;
  name: string;
  dosage: string;
  presentation?: string; // e.g. "tabletas", "suspensión inyectable"
  original_instruction: string; // e.g. "después del desayuno"
  schedule_time: string | null; // e.g. "08:00"
  is_as_needed: boolean;
  inventory_initial: number;
  inventory_current: number;
  inventory_alert_threshold: number;
  pills_per_dose: number;
  active: boolean;
}

export interface Comment {
  id: string;
  medication_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface MedicationHistory {
  id: string;
  medication_id: string;
  action: string;
  previous_value: string | null;
  new_value: string | null;
  author: string;
  created_at: string;
}
