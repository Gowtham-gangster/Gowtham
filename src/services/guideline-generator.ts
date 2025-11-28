import { DiseaseProfile, Guideline, Precaution } from '@/types/chronic-disease';
import { getDiseaseById } from '@/data/chronic-diseases';

export class GuidelineGenerator {
  generateGuidelines(profile: DiseaseProfile): Guideline[] {
    const disease = getDiseaseById(profile.diseaseId);
    if (!disease) return [];

    const guidelines: Guideline[] = [];
    const age = profile.personalInfo.age;
    const lifestyle = profile.lifestyle;

    // Diet Guidelines
    guidelines.push(this.generateDietGuideline(profile.diseaseId, age, lifestyle.diet));

    // Exercise Guidelines
    guidelines.push(this.generateExerciseGuideline(profile.diseaseId, age, lifestyle.exerciseFrequency));

    // Medication Guidelines
    guidelines.push(this.generateMedicationGuideline(profile.diseaseId, profile.medicationHistory));

    // Monitoring Guidelines
    guidelines.push(this.generateMonitoringGuideline(profile.diseaseId, age));

    // Lifestyle Guidelines
    guidelines.push(this.generateLifestyleGuideline(profile.diseaseId, lifestyle));

    // Add additional disease-specific guidelines
    const additionalGuidelines = this.generateDiseaseSpecificGuidelines(profile);
    guidelines.push(...additionalGuidelines);

    return guidelines;
  }

  generatePrecautions(profile: DiseaseProfile): Precaution[] {
    const precautions: Precaution[] = [];
    const disease = getDiseaseById(profile.diseaseId);
    if (!disease) return [];

    // General precautions based on disease
    precautions.push(...this.getDiseasePrecautions(profile.diseaseId));

    // Age-specific precautions
    if (profile.personalInfo.age > 65) {
      precautions.push({
        id: `${profile.diseaseId}-age-precaution`,
        type: 'warning',
        title: 'Age-Related Considerations',
        description: 'Older adults may require adjusted medication dosages and more frequent monitoring. Consult your healthcare provider regularly.',
      });
    }

    // Lifestyle-related precautions
    if (profile.lifestyle.smokingStatus === 'current') {
      precautions.push({
        id: `${profile.diseaseId}-smoking-precaution`,
        type: 'danger',
        title: 'Smoking Warning',
        description: 'Smoking significantly worsens your condition and increases complications. Seek smoking cessation support immediately.',
      });
    }

    if (profile.lifestyle.alcoholConsumption === 'heavy') {
      precautions.push({
        id: `${profile.diseaseId}-alcohol-precaution`,
        type: 'warning',
        title: 'Alcohol Consumption',
        description: 'Heavy alcohol consumption can interfere with medications and worsen your condition. Consider reducing intake.',
        relatedMedications: ['Blood pressure medications', 'Diabetes medications', 'Pain relievers'],
      });
    }

    return precautions;
  }

  private generateDietGuideline(diseaseId: string, age: number, dietQuality: string): Guideline {
    const dietRecommendations: Record<string, string> = {
      diabetes: 'Follow a balanced diet with controlled carbohydrate intake. Focus on whole grains, lean proteins, and plenty of vegetables. Monitor portion sizes and meal timing.',
      hypertension: 'Adopt the DASH diet: reduce sodium intake to less than 2,300mg daily, increase potassium-rich foods, and limit saturated fats.',
      'heart-disease': 'Follow a heart-healthy diet low in saturated fats, trans fats, and cholesterol. Include omega-3 fatty acids from fish and nuts.',
      asthma: 'Maintain a balanced diet rich in fruits, vegetables, and omega-3 fatty acids. Avoid foods that trigger allergic reactions.',
      copd: 'Eat smaller, frequent meals to avoid breathlessness. Focus on protein-rich foods and stay hydrated.',
      arthritis: 'Include anti-inflammatory foods like fatty fish, nuts, and colorful fruits and vegetables. Maintain a healthy weight to reduce joint stress.',
      'thyroid-disorder': 'Ensure adequate iodine intake if hypothyroid. Avoid excessive soy and cruciferous vegetables if they affect medication absorption.',
      'kidney-disease': 'Limit sodium, potassium, and phosphorus intake. Control protein consumption based on disease stage. Stay hydrated appropriately.',
      epilepsy: 'Maintain regular meal times to stabilize blood sugar. Some may benefit from a ketogenic diet under medical supervision.',
      'chronic-pain': 'Follow an anti-inflammatory diet rich in omega-3s, fruits, and vegetables. Avoid processed foods and excessive sugar.',
      osteoporosis: 'Ensure adequate calcium (1,200mg daily for adults over 50) and vitamin D intake. Include dairy, leafy greens, and fortified foods.',
      depression: 'Eat a balanced diet rich in omega-3 fatty acids, whole grains, and lean proteins. Limit caffeine and alcohol.',
    };

    const ageModifier = age > 65 ? ' Consider smaller, more frequent meals if appetite is reduced.' : '';
    const qualityModifier = dietQuality === 'poor' ? ' Work with a nutritionist to improve your dietary habits gradually.' : '';

    return {
      id: `${diseaseId}-diet`,
      category: 'diet',
      title: 'Dietary Recommendations',
      description: (dietRecommendations[diseaseId] || 'Maintain a balanced, nutritious diet.') + ageModifier + qualityModifier,
      priority: 'high',
      icon: 'Apple',
    };
  }

  private generateExerciseGuideline(diseaseId: string, age: number, frequency: string): Guideline {
    const exerciseRecommendations: Record<string, string> = {
      diabetes: 'Aim for 150 minutes of moderate aerobic activity weekly. Include resistance training 2-3 times per week. Monitor blood sugar before and after exercise.',
      hypertension: 'Engage in 30 minutes of moderate aerobic exercise most days. Include activities like brisk walking, swimming, or cycling.',
      'heart-disease': 'Start with cardiac rehabilitation if recommended. Gradually build to 30 minutes of moderate exercise 5 days a week.',
      asthma: 'Exercise regularly but warm up properly. Swimming is often well-tolerated. Keep rescue inhaler nearby.',
      copd: 'Practice pulmonary rehabilitation exercises. Start with short sessions and gradually increase duration. Focus on breathing techniques.',
      arthritis: 'Include low-impact exercises like swimming, walking, or tai chi. Aim for 30 minutes daily. Avoid high-impact activities.',
      'thyroid-disorder': 'Regular moderate exercise helps manage weight and energy levels. Adjust intensity based on thyroid function.',
      'kidney-disease': 'Engage in moderate exercise as tolerated. Walking, cycling, and swimming are good options. Stay hydrated.',
      epilepsy: 'Exercise regularly but avoid activities where a seizure could be dangerous. Swim with supervision and wear protective gear for cycling.',
      'chronic-pain': 'Start with gentle exercises like walking, swimming, or yoga. Gradually increase activity. Physical therapy may help.',
      osteoporosis: 'Include weight-bearing exercises like walking and resistance training. Avoid high-impact activities that increase fracture risk.',
      depression: 'Aim for 30 minutes of moderate exercise most days. Physical activity boosts mood and energy levels.',
    };

    const frequencyModifier = frequency === 'none' ? ' Start slowly with just 10 minutes daily and gradually increase.' : '';
    const ageModifier = age > 70 ? ' Consult your doctor before starting new exercises. Consider balance training to prevent falls.' : '';

    return {
      id: `${diseaseId}-exercise`,
      category: 'exercise',
      title: 'Physical Activity Guidelines',
      description: (exerciseRecommendations[diseaseId] || 'Engage in regular physical activity as tolerated.') + frequencyModifier + ageModifier,
      priority: 'high',
      icon: 'Dumbbell',
    };
  }

  private generateMedicationGuideline(diseaseId: string, medicationHistory: string): Guideline {
    const hasHistory = medicationHistory && medicationHistory.length >= 10;
    
    const medicationRecommendations: Record<string, string> = {
      diabetes: 'Take medications as prescribed. Monitor blood sugar regularly. Never skip doses. Report any side effects to your doctor.',
      hypertension: 'Take blood pressure medications consistently, even when feeling well. Monitor blood pressure at home regularly.',
      'heart-disease': 'Take all cardiac medications as prescribed. Keep nitroglycerin accessible if prescribed. Never stop medications without consulting your doctor.',
      asthma: 'Use controller medications daily as prescribed. Keep rescue inhaler accessible. Rinse mouth after using corticosteroid inhalers.',
      copd: 'Use inhalers correctly. Take medications on schedule. Keep rescue medications accessible at all times.',
      arthritis: 'Take pain medications as directed. Report any stomach upset or unusual symptoms. Consider timing doses with meals if recommended.',
      'thyroid-disorder': 'Take thyroid medication on an empty stomach, 30-60 minutes before breakfast. Avoid taking with calcium or iron supplements.',
      'kidney-disease': 'Take medications exactly as prescribed. Avoid NSAIDs unless approved by your doctor. Report any new medications to your nephrologist.',
      epilepsy: 'Never miss seizure medication doses. Maintain consistent blood levels. Report any side effects or breakthrough seizures immediately.',
      'chronic-pain': 'Use pain medications as prescribed. Explore non-medication pain management techniques. Avoid long-term opioid use if possible.',
      osteoporosis: 'Take calcium and vitamin D supplements as recommended. If on bisphosphonates, follow specific timing instructions.',
      depression: 'Take antidepressants consistently. It may take 4-6 weeks to see full effects. Never stop suddenly without medical guidance.',
    };

    const historyModifier = hasHistory ? ' Keep an updated list of all medications and share with all healthcare providers.' : ' Maintain a medication list and inform all healthcare providers of your condition.';

    return {
      id: `${diseaseId}-medication`,
      category: 'medication',
      title: 'Medication Management',
      description: (medicationRecommendations[diseaseId] || 'Follow your prescribed medication regimen carefully.') + historyModifier,
      priority: 'high',
      icon: 'Pill',
    };
  }

  private generateMonitoringGuideline(diseaseId: string, age: number): Guideline {
    const monitoringRecommendations: Record<string, string> = {
      diabetes: 'Monitor blood glucose as directed. Check HbA1c every 3 months. Annual eye and foot exams. Regular kidney function tests.',
      hypertension: 'Check blood pressure at home daily. Keep a log. Visit doctor every 3-6 months for monitoring and medication adjustment.',
      'heart-disease': 'Monitor blood pressure and heart rate daily. Watch for chest pain, shortness of breath, or swelling. Regular cardiac check-ups.',
      asthma: 'Use peak flow meter daily if recommended. Track symptoms and triggers. Regular spirometry tests.',
      copd: 'Monitor breathing patterns and oxygen levels if prescribed. Track symptom changes. Regular pulmonary function tests.',
      arthritis: 'Track pain levels and joint function. Monitor for increased swelling or warmth. Regular check-ups to assess disease progression.',
      'thyroid-disorder': 'Check thyroid function (TSH, T3, T4) every 6-12 months or as directed. Monitor symptoms of hypo/hyperthyroidism.',
      'kidney-disease': 'Regular blood tests for creatinine and GFR. Monitor blood pressure daily. Track fluid intake and urine output.',
      epilepsy: 'Keep a seizure diary. Monitor medication levels periodically. Regular neurological assessments.',
      'chronic-pain': 'Keep a pain diary tracking intensity, triggers, and relief measures. Regular assessments with pain specialist.',
      osteoporosis: 'Bone density scans every 1-2 years. Monitor height annually. Report any fractures or severe back pain immediately.',
      depression: 'Regular mental health check-ins. Monitor mood, sleep, and appetite. Use mood tracking apps if helpful.',
    };

    const ageModifier = age > 65 ? ' More frequent monitoring may be needed due to age-related changes.' : '';

    return {
      id: `${diseaseId}-monitoring`,
      category: 'monitoring',
      title: 'Health Monitoring',
      description: (monitoringRecommendations[diseaseId] || 'Regular monitoring and check-ups are essential.') + ageModifier,
      priority: 'medium',
      icon: 'Activity',
    };
  }

  private generateLifestyleGuideline(diseaseId: string, lifestyle: DiseaseProfile['lifestyle']): Guideline {
    const lifestyleRecommendations: Record<string, string> = {
      diabetes: 'Maintain consistent sleep schedule. Manage stress through relaxation techniques. Avoid smoking and limit alcohol.',
      hypertension: 'Reduce stress through meditation or yoga. Ensure 7-8 hours of quality sleep. Limit caffeine intake.',
      'heart-disease': 'Prioritize stress management and adequate sleep. Avoid smoking and secondhand smoke. Limit alcohol to moderate levels.',
      asthma: 'Identify and avoid triggers. Maintain clean indoor air. Use air purifiers if needed. Avoid smoking and smoke exposure.',
      copd: 'Quit smoking immediately if current smoker. Avoid air pollutants and irritants. Practice breathing exercises daily.',
      arthritis: 'Use joint protection techniques. Apply heat or cold as needed. Maintain healthy weight. Get adequate rest.',
      'thyroid-disorder': 'Manage stress levels. Ensure adequate sleep. Avoid excessive iodine if hyperthyroid.',
      'kidney-disease': 'Stay hydrated appropriately. Avoid nephrotoxic substances. Manage underlying conditions like diabetes and hypertension.',
      epilepsy: 'Maintain regular sleep schedule. Avoid known triggers. Limit alcohol. Manage stress effectively.',
      'chronic-pain': 'Practice stress management and relaxation techniques. Maintain good sleep hygiene. Consider mindfulness or meditation.',
      osteoporosis: 'Ensure home safety to prevent falls. Wear proper footwear. Avoid smoking and excessive alcohol.',
      depression: 'Maintain social connections. Establish daily routines. Practice good sleep hygiene. Limit alcohol and avoid recreational drugs.',
    };

    let modifiers = '';
    if (lifestyle.smokingStatus === 'current') {
      modifiers += ' Smoking cessation is critical for your condition.';
    }
    if (lifestyle.exerciseFrequency === 'none') {
      modifiers += ' Gradually incorporate physical activity into your daily routine.';
    }

    return {
      id: `${diseaseId}-lifestyle`,
      category: 'lifestyle',
      title: 'Lifestyle Modifications',
      description: (lifestyleRecommendations[diseaseId] || 'Adopt healthy lifestyle habits to manage your condition.') + modifiers,
      priority: 'medium',
      icon: 'Heart',
    };
  }

  private generateDiseaseSpecificGuidelines(profile: DiseaseProfile): Guideline[] {
    const guidelines: Guideline[] = [];

    // Add symptom-specific guidelines
    if (profile.symptoms.includes('Fatigue')) {
      guidelines.push({
        id: `${profile.diseaseId}-fatigue`,
        category: 'lifestyle',
        title: 'Managing Fatigue',
        description: 'Pace activities throughout the day. Take short rest breaks. Prioritize important tasks. Maintain consistent sleep schedule.',
        priority: 'medium',
        icon: 'Moon',
      });
    }

    if (profile.symptoms.includes('Pain') || profile.symptoms.includes('Joint pain') || profile.symptoms.includes('Chest pain')) {
      guidelines.push({
        id: `${profile.diseaseId}-pain-management`,
        category: 'lifestyle',
        title: 'Pain Management',
        description: 'Use prescribed pain medications appropriately. Apply heat or cold therapy. Practice relaxation techniques. Report severe or worsening pain immediately.',
        priority: 'high',
        icon: 'Zap',
      });
    }

    return guidelines;
  }

  private getDiseasePrecautions(diseaseId: string): Precaution[] {
    const precautionsMap: Record<string, Precaution[]> = {
      diabetes: [
        {
          id: 'diabetes-hypoglycemia',
          type: 'danger',
          title: 'Hypoglycemia Risk',
          description: 'Be aware of low blood sugar symptoms: shakiness, sweating, confusion. Always carry fast-acting glucose. Wear medical ID.',
          relatedMedications: ['Insulin', 'Sulfonylureas', 'Meglitinides'],
        },
        {
          id: 'diabetes-foot-care',
          type: 'warning',
          title: 'Foot Care Essential',
          description: 'Inspect feet daily for cuts, blisters, or infections. Wear proper footwear. Never go barefoot. Report any foot problems immediately.',
        },
        {
          id: 'diabetes-sick-day',
          type: 'info',
          title: 'Sick Day Management',
          description: 'Continue taking diabetes medications even when sick. Monitor blood sugar more frequently. Stay hydrated. Contact doctor if unable to eat or drink.',
        },
      ],
      hypertension: [
        {
          id: 'hypertension-emergency',
          type: 'danger',
          title: 'Hypertensive Emergency',
          description: 'Seek immediate medical attention if blood pressure exceeds 180/120 with symptoms like chest pain, shortness of breath, or severe headache.',
        },
        {
          id: 'hypertension-medication',
          type: 'warning',
          title: 'Medication Adherence',
          description: 'Never stop blood pressure medications suddenly. This can cause dangerous rebound hypertension. Consult doctor before any changes.',
          relatedMedications: ['Beta-blockers', 'ACE inhibitors', 'ARBs', 'Calcium channel blockers'],
        },
        {
          id: 'hypertension-sodium',
          type: 'info',
          title: 'Sodium Awareness',
          description: 'Read food labels carefully. Restaurant and processed foods are often high in sodium. Aim for less than 2,300mg daily.',
        },
      ],
      'heart-disease': [
        {
          id: 'heart-emergency',
          type: 'danger',
          title: 'Heart Attack Warning Signs',
          description: 'Call 911 immediately for chest pain, shortness of breath, nausea, or pain radiating to arm/jaw. Do not drive yourself to hospital.',
        },
        {
          id: 'heart-anticoagulants',
          type: 'warning',
          title: 'Blood Thinner Precautions',
          description: 'If on blood thinners, avoid activities with high injury risk. Report unusual bleeding or bruising. Inform all healthcare providers.',
          relatedMedications: ['Warfarin', 'Aspirin', 'Clopidogrel', 'DOACs'],
        },
        {
          id: 'heart-dental',
          type: 'info',
          title: 'Dental Care',
          description: 'Inform dentist of heart condition. Some procedures may require antibiotic prophylaxis. Maintain good oral hygiene.',
        },
      ],
      asthma: [
        {
          id: 'asthma-emergency',
          type: 'danger',
          title: 'Asthma Attack Warning',
          description: 'Seek emergency care if rescue inhaler not helping, severe breathlessness, blue lips/fingernails, or difficulty speaking.',
        },
        {
          id: 'asthma-triggers',
          type: 'warning',
          title: 'Avoid Triggers',
          description: 'Identify and avoid personal triggers: allergens, cold air, exercise, smoke, strong odors. Keep rescue inhaler always accessible.',
        },
        {
          id: 'asthma-action-plan',
          type: 'info',
          title: 'Asthma Action Plan',
          description: 'Work with your doctor to create a written asthma action plan. Know your zones: green (good), yellow (caution), red (danger).',
        },
      ],
      copd: [
        {
          id: 'copd-emergency',
          type: 'danger',
          title: 'Respiratory Emergency',
          description: 'Seek immediate help for severe breathlessness, blue lips, confusion, or chest pain. These may indicate respiratory failure.',
        },
        {
          id: 'copd-oxygen',
          type: 'warning',
          title: 'Oxygen Therapy Safety',
          description: 'If on oxygen, follow prescribed flow rate exactly. Keep oxygen away from flames and heat sources. No smoking near oxygen.',
        },
        {
          id: 'copd-infections',
          type: 'info',
          title: 'Prevent Infections',
          description: 'Get annual flu vaccine and pneumonia vaccine. Avoid crowds during flu season. Report increased mucus or color change promptly.',
        },
      ],
      arthritis: [
        {
          id: 'arthritis-nsaids',
          type: 'warning',
          title: 'NSAID Precautions',
          description: 'Long-term NSAID use can cause stomach ulcers and kidney problems. Take with food. Report stomach pain or dark stools.',
          relatedMedications: ['Ibuprofen', 'Naproxen', 'Celecoxib'],
        },
        {
          id: 'arthritis-joint-protection',
          type: 'info',
          title: 'Joint Protection',
          description: 'Use assistive devices when needed. Avoid repetitive motions. Alternate between activity and rest. Maintain healthy weight.',
        },
        {
          id: 'arthritis-heat-cold',
          type: 'info',
          title: 'Heat and Cold Therapy',
          description: 'Use heat for stiffness and cold for inflammation. Never apply directly to skin. Limit application to 15-20 minutes.',
        },
      ],
      'thyroid-disorder': [
        {
          id: 'thyroid-medication-timing',
          type: 'warning',
          title: 'Medication Timing Critical',
          description: 'Take thyroid medication at the same time daily, on empty stomach. Wait 30-60 minutes before eating. Avoid calcium/iron supplements within 4 hours.',
          relatedMedications: ['Levothyroxine', 'Liothyronine'],
        },
        {
          id: 'thyroid-symptoms',
          type: 'info',
          title: 'Monitor Symptoms',
          description: 'Report persistent fatigue, weight changes, mood changes, or heart palpitations. These may indicate need for dose adjustment.',
        },
        {
          id: 'thyroid-pregnancy',
          type: 'warning',
          title: 'Pregnancy Considerations',
          description: 'If planning pregnancy or pregnant, inform doctor immediately. Thyroid medication needs often change during pregnancy.',
        },
      ],
      'kidney-disease': [
        {
          id: 'kidney-medications',
          type: 'danger',
          title: 'Avoid Nephrotoxic Drugs',
          description: 'Avoid NSAIDs, certain antibiotics, and contrast dyes without nephrologist approval. These can worsen kidney function.',
          relatedMedications: ['NSAIDs', 'Aminoglycosides', 'Contrast agents'],
        },
        {
          id: 'kidney-diet',
          type: 'warning',
          title: 'Dietary Restrictions',
          description: 'Follow prescribed limits for potassium, phosphorus, and protein. High levels can be dangerous with kidney disease.',
        },
        {
          id: 'kidney-hydration',
          type: 'info',
          title: 'Fluid Management',
          description: 'Follow fluid restrictions if prescribed. Monitor for swelling in legs, ankles, or around eyes. Weigh daily.',
        },
      ],
      epilepsy: [
        {
          id: 'epilepsy-medication',
          type: 'danger',
          title: 'Never Skip Medications',
          description: 'Missing seizure medications can trigger seizures. Set reminders. Keep extra medication on hand. Never stop suddenly.',
          relatedMedications: ['Antiepileptic drugs'],
        },
        {
          id: 'epilepsy-safety',
          type: 'warning',
          title: 'Safety Precautions',
          description: 'Avoid swimming alone, working at heights, or operating dangerous machinery. Wear medical ID. Inform close contacts about seizure first aid.',
        },
        {
          id: 'epilepsy-triggers',
          type: 'info',
          title: 'Identify Triggers',
          description: 'Common triggers include lack of sleep, stress, flashing lights, alcohol, and missed medications. Keep a seizure diary.',
        },
      ],
      'chronic-pain': [
        {
          id: 'pain-opioids',
          type: 'warning',
          title: 'Opioid Safety',
          description: 'If prescribed opioids, take exactly as directed. Never share medications. Store securely. Dispose of unused medications properly.',
          relatedMedications: ['Opioid pain relievers'],
        },
        {
          id: 'pain-multimodal',
          type: 'info',
          title: 'Multimodal Approach',
          description: 'Combine medications with physical therapy, exercise, and psychological support for best results. Avoid relying solely on medications.',
        },
        {
          id: 'pain-mental-health',
          type: 'info',
          title: 'Mental Health Connection',
          description: 'Chronic pain often coexists with depression and anxiety. Seek mental health support if experiencing mood changes.',
        },
      ],
      osteoporosis: [
        {
          id: 'osteoporosis-fracture',
          type: 'danger',
          title: 'Fracture Prevention',
          description: 'Even minor falls can cause fractures. Remove home hazards. Use handrails. Wear proper footwear. Report any bone pain immediately.',
        },
        {
          id: 'osteoporosis-bisphosphonates',
          type: 'warning',
          title: 'Bisphosphonate Instructions',
          description: 'Take on empty stomach with full glass of water. Remain upright for 30-60 minutes. Report jaw pain or thigh pain.',
          relatedMedications: ['Alendronate', 'Risedronate', 'Ibandronate'],
        },
        {
          id: 'osteoporosis-calcium',
          type: 'info',
          title: 'Calcium and Vitamin D',
          description: 'Ensure adequate intake through diet and supplements. Get 15-20 minutes of sun exposure daily for vitamin D.',
        },
      ],
      depression: [
        {
          id: 'depression-crisis',
          type: 'danger',
          title: 'Crisis Resources',
          description: 'If experiencing suicidal thoughts, call 988 (Suicide & Crisis Lifeline) or go to nearest emergency room. You are not alone.',
        },
        {
          id: 'depression-medication',
          type: 'warning',
          title: 'Antidepressant Guidelines',
          description: 'Takes 4-6 weeks for full effect. Never stop suddenly - can cause withdrawal. Report worsening depression or suicidal thoughts immediately.',
          relatedMedications: ['SSRIs', 'SNRIs', 'TCAs', 'MAOIs'],
        },
        {
          id: 'depression-therapy',
          type: 'info',
          title: 'Therapy Importance',
          description: 'Combination of medication and therapy is most effective. Consider cognitive behavioral therapy (CBT) or interpersonal therapy.',
        },
      ],
    };

    return precautionsMap[diseaseId] || [
      {
        id: `${diseaseId}-general`,
        type: 'info',
        title: 'General Precautions',
        description: 'Follow your healthcare provider\'s recommendations. Attend all scheduled appointments. Report any concerning symptoms promptly.',
      },
    ];
  }
}

export const guidelineGenerator = new GuidelineGenerator();
