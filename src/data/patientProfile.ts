export interface PatientProfile {
  name: string;
  prescriptionDate: string;
  nextAppointment: string;
  vitalSigns: {
    bloodPressure: string;
    pulse: string;
    weight: string;
  };
  diet: string;
  generalRecommendations: string[];
  medicalWarning: string;
}

export const patientProfile: PatientProfile = {
  name: 'Alicia Reyes Limas',
  prescriptionDate: '01 de septiembre de 2026',
  nextAppointment: 'A más tardar en 1 mes (01 de octubre de 2026)',
  vitalSigns: {
    bloodPressure: '136/68 mmHg',
    pulse: '78 /min',
    weight: '75.5 kg',
  },
  diet: 'Dieta para diabético: baja en sal, baja en grasas y de reducción.',
  generalRecommendations: [
    'Disminuir el peso corporal al ideal',
    'Dieta sana y equilibrada',
    'No fumar',
    'No consumir bebidas alcohólicas',
  ],
  medicalWarning: 'Los medicamentos no deben suspenderse sin orden médica; deberán continuarse hasta la próxima cita.',
};
