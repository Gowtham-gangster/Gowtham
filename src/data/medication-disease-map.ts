export interface DiseaseMapping {
  diseaseId: string;
  diseaseName: string;
  likelihood: number;
  medicationClass: string;
}

export interface MedicationDiseaseMap {
  [medication: string]: DiseaseMapping[];
}

export const medicationDiseaseMap: MedicationDiseaseMap = {
  // Diabetes medications
  metformin: [{ diseaseId: 'diabetes', diseaseName: 'Diabetes', likelihood: 0.95, medicationClass: 'Biguanide' }],
  insulin: [{ diseaseId: 'diabetes', diseaseName: 'Diabetes', likelihood: 0.98, medicationClass: 'Insulin' }],
  glipizide: [{ diseaseId: 'diabetes', diseaseName: 'Diabetes', likelihood: 0.90, medicationClass: 'Sulfonylurea' }],
  glyburide: [{ diseaseId: 'diabetes', diseaseName: 'Diabetes', likelihood: 0.90, medicationClass: 'Sulfonylurea' }],
  glimepiride: [{ diseaseId: 'diabetes', diseaseName: 'Diabetes', likelihood: 0.90, medicationClass: 'Sulfonylurea' }],
  sitagliptin: [{ diseaseId: 'diabetes', diseaseName: 'Diabetes', likelihood: 0.92, medicationClass: 'DPP-4 Inhibitor' }],
  empagliflozin: [{ diseaseId: 'diabetes', diseaseName: 'Diabetes', likelihood: 0.93, medicationClass: 'SGLT2 Inhibitor' }],
  
  // Hypertension medications
  lisinopril: [{ diseaseId: 'hypertension', diseaseName: 'Hypertension', likelihood: 0.90, medicationClass: 'ACE Inhibitor' }],
  enalapril: [{ diseaseId: 'hypertension', diseaseName: 'Hypertension', likelihood: 0.90, medicationClass: 'ACE Inhibitor' }],
  ramipril: [{ diseaseId: 'hypertension', diseaseName: 'Hypertension', likelihood: 0.90, medicationClass: 'ACE Inhibitor' }],
  losartan: [{ diseaseId: 'hypertension', diseaseName: 'Hypertension', likelihood: 0.88, medicationClass: 'ARB' }],
  valsartan: [{ diseaseId: 'hypertension', diseaseName: 'Hypertension', likelihood: 0.88, medicationClass: 'ARB' }],
  amlodipine: [{ diseaseId: 'hypertension', diseaseName: 'Hypertension', likelihood: 0.85, medicationClass: 'Calcium Channel Blocker' }],
  nifedipine: [{ diseaseId: 'hypertension', diseaseName: 'Hypertension', likelihood: 0.85, medicationClass: 'Calcium Channel Blocker' }],
  hydrochlorothiazide: [{ diseaseId: 'hypertension', diseaseName: 'Hypertension', likelihood: 0.80, medicationClass: 'Diuretic' }],
  furosemide: [{ diseaseId: 'hypertension', diseaseName: 'Hypertension', likelihood: 0.70, medicationClass: 'Diuretic' }],
  
  // Asthma medications
  albuterol: [{ diseaseId: 'asthma', diseaseName: 'Asthma', likelihood: 0.95, medicationClass: 'Bronchodilator' }],
  salbutamol: [{ diseaseId: 'asthma', diseaseName: 'Asthma', likelihood: 0.95, medicationClass: 'Bronchodilator' }],
  fluticasone: [
    { diseaseId: 'asthma', diseaseName: 'Asthma', likelihood: 0.80, medicationClass: 'Corticosteroid' },
    { diseaseId: 'copd', diseaseName: 'COPD', likelihood: 0.60, medicationClass: 'Corticosteroid' }
  ],
  budesonide: [
    { diseaseId: 'asthma', diseaseName: 'Asthma', likelihood: 0.80, medicationClass: 'Corticosteroid' },
    { diseaseId: 'copd', diseaseName: 'COPD', likelihood: 0.60, medicationClass: 'Corticosteroid' }
  ],
  montelukast: [{ diseaseId: 'asthma', diseaseName: 'Asthma', likelihood: 0.90, medicationClass: 'Leukotriene Modifier' }],
  
  // COPD medications
  tiotropium: [{ diseaseId: 'copd', diseaseName: 'COPD', likelihood: 0.95, medicationClass: 'Anticholinergic' }],
  ipratropium: [{ diseaseId: 'copd', diseaseName: 'COPD', likelihood: 0.90, medicationClass: 'Anticholinergic' }],
  
  // Heart disease medications
  atorvastatin: [{ diseaseId: 'heart-disease', diseaseName: 'Heart Disease', likelihood: 0.85, medicationClass: 'Statin' }],
  simvastatin: [{ diseaseId: 'heart-disease', diseaseName: 'Heart Disease', likelihood: 0.85, medicationClass: 'Statin' }],
  rosuvastatin: [{ diseaseId: 'heart-disease', diseaseName: 'Heart Disease', likelihood: 0.85, medicationClass: 'Statin' }],
  aspirin: [{ diseaseId: 'heart-disease', diseaseName: 'Heart Disease', likelihood: 0.70, medicationClass: 'Antiplatelet' }],
  clopidogrel: [{ diseaseId: 'heart-disease', diseaseName: 'Heart Disease', likelihood: 0.85, medicationClass: 'Antiplatelet' }],
  metoprolol: [{ diseaseId: 'heart-disease', diseaseName: 'Heart Disease', likelihood: 0.75, medicationClass: 'Beta Blocker' }],
  carvedilol: [{ diseaseId: 'heart-disease', diseaseName: 'Heart Disease', likelihood: 0.80, medicationClass: 'Beta Blocker' }],
  
  // Arthritis medications
  ibuprofen: [{ diseaseId: 'arthritis', diseaseName: 'Arthritis', likelihood: 0.70, medicationClass: 'NSAID' }],
  naproxen: [{ diseaseId: 'arthritis', diseaseName: 'Arthritis', likelihood: 0.75, medicationClass: 'NSAID' }],
  celecoxib: [{ diseaseId: 'arthritis', diseaseName: 'Arthritis', likelihood: 0.85, medicationClass: 'COX-2 Inhibitor' }],
  methotrexate: [{ diseaseId: 'arthritis', diseaseName: 'Arthritis', likelihood: 0.90, medicationClass: 'DMARD' }],
  
  // Thyroid medications
  levothyroxine: [{ diseaseId: 'thyroid-disorder', diseaseName: 'Thyroid Disorders', likelihood: 0.95, medicationClass: 'Thyroid Hormone' }],
  liothyronine: [{ diseaseId: 'thyroid-disorder', diseaseName: 'Thyroid Disorders', likelihood: 0.95, medicationClass: 'Thyroid Hormone' }],
  methimazole: [{ diseaseId: 'thyroid-disorder', diseaseName: 'Thyroid Disorders', likelihood: 0.90, medicationClass: 'Antithyroid' }],
  
  // Kidney disease medications
  erythropoietin: [{ diseaseId: 'kidney-disease', diseaseName: 'Chronic Kidney Disease', likelihood: 0.90, medicationClass: 'ESA' }],
  sevelamer: [{ diseaseId: 'kidney-disease', diseaseName: 'Chronic Kidney Disease', likelihood: 0.85, medicationClass: 'Phosphate Binder' }],
  
  // Epilepsy medications
  levetiracetam: [{ diseaseId: 'epilepsy', diseaseName: 'Epilepsy', likelihood: 0.95, medicationClass: 'Anticonvulsant' }],
  valproate: [{ diseaseId: 'epilepsy', diseaseName: 'Epilepsy', likelihood: 0.90, medicationClass: 'Anticonvulsant' }],
  carbamazepine: [{ diseaseId: 'epilepsy', diseaseName: 'Epilepsy', likelihood: 0.90, medicationClass: 'Anticonvulsant' }],
  phenytoin: [{ diseaseId: 'epilepsy', diseaseName: 'Epilepsy', likelihood: 0.90, medicationClass: 'Anticonvulsant' }],
  lamotrigine: [{ diseaseId: 'epilepsy', diseaseName: 'Epilepsy', likelihood: 0.88, medicationClass: 'Anticonvulsant' }],
  
  // Chronic pain medications
  gabapentin: [{ diseaseId: 'chronic-pain', diseaseName: 'Chronic Pain Syndrome', likelihood: 0.80, medicationClass: 'Neuropathic Pain' }],
  pregabalin: [{ diseaseId: 'chronic-pain', diseaseName: 'Chronic Pain Syndrome', likelihood: 0.85, medicationClass: 'Neuropathic Pain' }],
  tramadol: [{ diseaseId: 'chronic-pain', diseaseName: 'Chronic Pain Syndrome', likelihood: 0.75, medicationClass: 'Opioid' }],
  
  // Osteoporosis medications
  alendronate: [{ diseaseId: 'osteoporosis', diseaseName: 'Osteoporosis', likelihood: 0.95, medicationClass: 'Bisphosphonate' }],
  risedronate: [{ diseaseId: 'osteoporosis', diseaseName: 'Osteoporosis', likelihood: 0.95, medicationClass: 'Bisphosphonate' }],
  ibandronate: [{ diseaseId: 'osteoporosis', diseaseName: 'Osteoporosis', likelihood: 0.95, medicationClass: 'Bisphosphonate' }],
  
  // Depression medications
  sertraline: [{ diseaseId: 'depression', diseaseName: 'Clinical Depression', likelihood: 0.90, medicationClass: 'SSRI' }],
  fluoxetine: [{ diseaseId: 'depression', diseaseName: 'Clinical Depression', likelihood: 0.90, medicationClass: 'SSRI' }],
  escitalopram: [{ diseaseId: 'depression', diseaseName: 'Clinical Depression', likelihood: 0.90, medicationClass: 'SSRI' }],
  venlafaxine: [{ diseaseId: 'depression', diseaseName: 'Clinical Depression', likelihood: 0.88, medicationClass: 'SNRI' }],
  duloxetine: [{ diseaseId: 'depression', diseaseName: 'Clinical Depression', likelihood: 0.88, medicationClass: 'SNRI' }],
  bupropion: [{ diseaseId: 'depression', diseaseName: 'Clinical Depression', likelihood: 0.85, medicationClass: 'NDRI' }],
};
