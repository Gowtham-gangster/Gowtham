export interface DiseaseKeywordMap {
  [diseaseId: string]: {
    keywords: string[];
    abbreviations: string[];
    relatedTerms: string[];
  };
}

export const diseaseKeywords: DiseaseKeywordMap = {
  diabetes: {
    keywords: ['diabetes', 'diabetic', 'hyperglycemia', 'blood sugar', 'glucose'],
    abbreviations: ['dm', 't1d', 't2d', 'iddm', 'niddm'],
    relatedTerms: ['insulin resistance', 'high blood sugar', 'elevated glucose', 'type 1', 'type 2', 'type i', 'type ii'],
  },
  hypertension: {
    keywords: ['hypertension', 'high blood pressure', 'elevated blood pressure'],
    abbreviations: ['htn', 'bp', 'hbp'],
    relatedTerms: ['systolic', 'diastolic', 'blood pressure control', 'elevated bp'],
  },
  asthma: {
    keywords: ['asthma', 'asthmatic', 'bronchial asthma'],
    abbreviations: [],
    relatedTerms: ['wheezing', 'bronchospasm', 'reactive airway', 'airway inflammation'],
  },
  copd: {
    keywords: ['copd', 'chronic obstructive pulmonary disease', 'emphysema', 'chronic bronchitis'],
    abbreviations: ['copd', 'coad'],
    relatedTerms: ['obstructive lung disease', 'chronic airway obstruction'],
  },
  'heart-disease': {
    keywords: ['heart disease', 'coronary artery disease', 'cardiac disease', 'cardiovascular disease', 'heart failure', 'chf'],
    abbreviations: ['cad', 'cvd', 'chf', 'ihd'],
    relatedTerms: ['coronary', 'myocardial', 'angina', 'cardiac', 'congestive heart failure'],
  },
  arthritis: {
    keywords: ['arthritis', 'osteoarthritis', 'rheumatoid arthritis', 'joint inflammation'],
    abbreviations: ['oa', 'ra'],
    relatedTerms: ['joint pain', 'arthritic', 'inflammatory arthritis', 'degenerative joint'],
  },
  'thyroid-disorder': {
    keywords: ['thyroid disorder', 'hypothyroidism', 'hyperthyroidism', 'thyroid disease'],
    abbreviations: ['hypo', 'hyper'],
    relatedTerms: ['thyroid', 'tsh', 'thyroid hormone', 'goiter', 'thyroiditis'],
  },
  'kidney-disease': {
    keywords: ['kidney disease', 'chronic kidney disease', 'renal disease', 'renal failure', 'nephropathy'],
    abbreviations: ['ckd', 'esrd', 'arf'],
    relatedTerms: ['renal', 'kidney function', 'creatinine', 'dialysis', 'nephrotic'],
  },
  epilepsy: {
    keywords: ['epilepsy', 'seizure disorder', 'convulsions'],
    abbreviations: [],
    relatedTerms: ['seizure', 'epileptic', 'convulsive', 'anticonvulsant'],
  },
  'chronic-pain': {
    keywords: ['chronic pain', 'persistent pain', 'pain syndrome'],
    abbreviations: [],
    relatedTerms: ['chronic pain management', 'pain control', 'neuropathic pain', 'fibromyalgia'],
  },
  osteoporosis: {
    keywords: ['osteoporosis', 'bone loss', 'low bone density'],
    abbreviations: [],
    relatedTerms: ['osteopenia', 'bone mineral density', 'fracture risk', 'bone health'],
  },
  depression: {
    keywords: ['depression', 'major depressive disorder', 'clinical depression'],
    abbreviations: ['mdd'],
    relatedTerms: ['depressive', 'mood disorder', 'antidepressant', 'mental health'],
  },
};
