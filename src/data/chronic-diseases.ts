import { ChronicDisease } from '@/types/chronic-disease';

export const chronicDiseases: ChronicDisease[] = [
  {
    id: 'diabetes',
    name: 'Diabetes',
    description: 'A metabolic disorder characterized by high blood sugar levels over a prolonged period.',
    icon: 'Droplet',
    category: 'metabolic',
    commonSymptoms: [
      'Increased thirst',
      'Frequent urination',
      'Extreme hunger',
      'Unexplained weight loss',
      'Fatigue',
      'Blurred vision',
      'Slow-healing sores',
      'Frequent infections',
      'Tingling in hands or feet'
    ],
    riskFactors: [
      'Family history',
      'Obesity',
      'Physical inactivity',
      'Age over 45',
      'High blood pressure',
      'Abnormal cholesterol levels'
    ]
  },
  {
    id: 'hypertension',
    name: 'Hypertension',
    description: 'High blood pressure that can lead to serious health complications if left untreated.',
    icon: 'Heart',
    category: 'cardiovascular',
    commonSymptoms: [
      'Headaches',
      'Shortness of breath',
      'Nosebleeds',
      'Dizziness',
      'Chest pain',
      'Visual changes',
      'Fatigue',
      'Irregular heartbeat'
    ],
    riskFactors: [
      'Age',
      'Family history',
      'Obesity',
      'High salt intake',
      'Lack of physical activity',
      'Tobacco use',
      'Excessive alcohol',
      'Stress'
    ]
  },
  {
    id: 'asthma',
    name: 'Asthma',
    description: 'A chronic respiratory condition causing inflammation and narrowing of the airways.',
    icon: 'Wind',
    category: 'respiratory',
    commonSymptoms: [
      'Shortness of breath',
      'Chest tightness',
      'Wheezing',
      'Coughing (especially at night)',
      'Difficulty sleeping',
      'Rapid breathing',
      'Fatigue',
      'Anxiety during attacks'
    ],
    riskFactors: [
      'Family history',
      'Allergies',
      'Respiratory infections',
      'Exposure to tobacco smoke',
      'Air pollution',
      'Occupational triggers',
      'Obesity'
    ]
  },
  {
    id: 'copd',
    name: 'COPD',
    description: 'Chronic Obstructive Pulmonary Disease - a progressive lung disease causing breathing difficulties.',
    icon: 'Waves',
    category: 'respiratory',
    commonSymptoms: [
      'Chronic cough',
      'Shortness of breath',
      'Wheezing',
      'Chest tightness',
      'Excess mucus production',
      'Fatigue',
      'Frequent respiratory infections',
      'Unintended weight loss',
      'Swelling in ankles or legs'
    ],
    riskFactors: [
      'Smoking',
      'Long-term exposure to air pollutants',
      'Occupational dust exposure',
      'Alpha-1 antitrypsin deficiency',
      'Age over 40',
      'Asthma history'
    ]
  },
  {
    id: 'heart-disease',
    name: 'Heart Disease',
    description: 'Various conditions affecting the heart, including coronary artery disease and heart failure.',
    icon: 'HeartPulse',
    category: 'cardiovascular',
    commonSymptoms: [
      'Chest pain or discomfort',
      'Shortness of breath',
      'Pain in neck, jaw, or back',
      'Weakness or dizziness',
      'Nausea',
      'Irregular heartbeat',
      'Swelling in legs or abdomen',
      'Fatigue',
      'Cold sweats'
    ],
    riskFactors: [
      'High blood pressure',
      'High cholesterol',
      'Smoking',
      'Diabetes',
      'Obesity',
      'Physical inactivity',
      'Family history',
      'Unhealthy diet',
      'Excessive alcohol',
      'Stress'
    ]
  },
  {
    id: 'arthritis',
    name: 'Arthritis',
    description: 'Inflammation of one or more joints causing pain, stiffness, and reduced mobility.',
    icon: 'Bone',
    category: 'musculoskeletal',
    commonSymptoms: [
      'Joint pain',
      'Stiffness',
      'Swelling',
      'Redness',
      'Decreased range of motion',
      'Warmth around joints',
      'Fatigue',
      'Morning stiffness',
      'Difficulty with daily activities'
    ],
    riskFactors: [
      'Age',
      'Family history',
      'Gender (more common in women)',
      'Previous joint injury',
      'Obesity',
      'Certain occupations',
      'Autoimmune disorders'
    ]
  },
  {
    id: 'thyroid-disorder',
    name: 'Thyroid Disorders',
    description: 'Conditions affecting thyroid function, including hypothyroidism and hyperthyroidism.',
    icon: 'Pill',
    category: 'endocrine',
    commonSymptoms: [
      'Fatigue',
      'Weight changes',
      'Mood changes',
      'Hair loss',
      'Dry skin',
      'Sensitivity to temperature',
      'Irregular heartbeat',
      'Muscle weakness',
      'Memory problems',
      'Changes in menstrual cycle'
    ],
    riskFactors: [
      'Family history',
      'Gender (more common in women)',
      'Age over 60',
      'Autoimmune diseases',
      'Radiation exposure',
      'Certain medications',
      'Pregnancy'
    ]
  },
  {
    id: 'kidney-disease',
    name: 'Chronic Kidney Disease',
    description: 'Progressive loss of kidney function over time, affecting waste filtration and fluid balance.',
    icon: 'Activity',
    category: 'renal',
    commonSymptoms: [
      'Fatigue',
      'Difficulty concentrating',
      'Poor appetite',
      'Trouble sleeping',
      'Muscle cramping',
      'Swollen feet and ankles',
      'Puffiness around eyes',
      'Dry, itchy skin',
      'Frequent urination',
      'Blood in urine'
    ],
    riskFactors: [
      'Diabetes',
      'High blood pressure',
      'Heart disease',
      'Family history',
      'Age over 60',
      'Obesity',
      'Smoking',
      'Prolonged use of certain medications'
    ]
  },
  {
    id: 'epilepsy',
    name: 'Epilepsy',
    description: 'A neurological disorder characterized by recurrent seizures due to abnormal brain activity.',
    icon: 'Brain',
    category: 'neurological',
    commonSymptoms: [
      'Temporary confusion',
      'Staring spells',
      'Uncontrollable jerking movements',
      'Loss of consciousness',
      'Psychic symptoms',
      'Anxiety',
      'Déjà vu',
      'Muscle stiffness',
      'Sudden falls'
    ],
    riskFactors: [
      'Family history',
      'Head trauma',
      'Stroke',
      'Brain infections',
      'Prenatal injury',
      'Developmental disorders',
      'Age (more common in children and older adults)'
    ]
  },
  {
    id: 'chronic-pain',
    name: 'Chronic Pain Syndrome',
    description: 'Persistent pain lasting more than 3 months, affecting daily activities and quality of life.',
    icon: 'Zap',
    category: 'other',
    commonSymptoms: [
      'Persistent aching',
      'Burning sensation',
      'Shooting or stabbing pain',
      'Stiffness',
      'Fatigue',
      'Sleep disturbances',
      'Mood changes',
      'Decreased appetite',
      'Weakness'
    ],
    riskFactors: [
      'Previous injury',
      'Surgery',
      'Infection',
      'Nerve damage',
      'Arthritis',
      'Fibromyalgia',
      'Age',
      'Obesity',
      'Smoking',
      'Stress'
    ]
  },
  {
    id: 'osteoporosis',
    name: 'Osteoporosis',
    description: 'A condition where bones become weak and brittle, increasing fracture risk.',
    icon: 'Bone',
    category: 'musculoskeletal',
    commonSymptoms: [
      'Back pain',
      'Loss of height',
      'Stooped posture',
      'Bone fractures',
      'Easily broken bones',
      'Neck pain',
      'Reduced grip strength'
    ],
    riskFactors: [
      'Age over 50',
      'Gender (more common in women)',
      'Family history',
      'Low body weight',
      'Smoking',
      'Excessive alcohol',
      'Sedentary lifestyle',
      'Low calcium intake',
      'Certain medications',
      'Hormonal changes'
    ]
  },
  {
    id: 'depression',
    name: 'Clinical Depression',
    description: 'A mental health disorder causing persistent feelings of sadness and loss of interest.',
    icon: 'CloudRain',
    category: 'neurological',
    commonSymptoms: [
      'Persistent sadness',
      'Loss of interest in activities',
      'Changes in appetite',
      'Sleep disturbances',
      'Fatigue',
      'Feelings of worthlessness',
      'Difficulty concentrating',
      'Thoughts of death or suicide',
      'Physical aches and pains'
    ],
    riskFactors: [
      'Family history',
      'Traumatic events',
      'Chronic stress',
      'Certain medications',
      'Chronic illness',
      'Substance abuse',
      'Low self-esteem',
      'Social isolation'
    ]
  }
];

export const getDiseaseById = (id: string): ChronicDisease | undefined => {
  return chronicDiseases.find(disease => disease.id === id);
};

export const getDiseasesByCategory = (category: string): ChronicDisease[] => {
  return chronicDiseases.filter(disease => disease.category === category);
};

export const searchDiseases = (query: string): ChronicDisease[] => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return chronicDiseases;
  
  return chronicDiseases.filter(disease => 
    disease.name.toLowerCase().includes(lowerQuery) ||
    disease.description.toLowerCase().includes(lowerQuery) ||
    disease.category.toLowerCase().includes(lowerQuery)
  );
};
