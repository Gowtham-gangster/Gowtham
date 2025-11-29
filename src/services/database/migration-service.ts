import { 
  demoMedicines, 
  demoDiseaseProfiles, 
  demoPrescriptions 
} from '@/data/demo-database';
import { medicinesService } from './medicines-service';
import { diseaseProfilesService } from './disease-profiles-service';
import { prescriptionsService } from './prescriptions-service';

class MigrationService {
  /**
   * Import demo data for current user
   */
  async importDemoData(userId: string) {
    console.log('🚀 Starting demo data import...');
    
    try {
      // Import medicines
      console.log('📦 Importing medicines...');
      const medicineMap = new Map<string, string>(); // old ID -> new ID
      
      for (const medicine of demoMedicines.filter(m => m.userId === userId)) {
        const newMedicine = await medicinesService.create({
          ...medicine,
          userId,
        });
        medicineMap.set(medicine.id, newMedicine.id);
      }
      console.log(`✅ Imported ${medicineMap.size} medicines`);

      // Import disease profiles
      console.log('🏥 Importing disease profiles...');
      let diseaseCount = 0;
      
      for (const disease of demoDiseaseProfiles.filter(d => d.userId === userId)) {
        // Map old medicine IDs to new ones
        const mappedMedications = disease.medications?.map(
          oldId => medicineMap.get(oldId) || oldId
        );
        
        await diseaseProfilesService.create({
          ...disease,
          userId,
          medications: mappedMedications,
        });
        diseaseCount++;
      }
      console.log(`✅ Imported ${diseaseCount} disease profiles`);

      // Import prescriptions (without files)
      console.log('📋 Importing prescriptions...');
      let prescriptionCount = 0;
      
      for (const prescription of demoPrescriptions.filter(p => p.userId === userId)) {
        await prescriptionsService.create({
          ...prescription,
          userId,
        });
        prescriptionCount++;
      }
      console.log(`✅ Imported ${prescriptionCount} prescriptions`);

      console.log('🎉 Demo data import complete!');
      
      return {
        medicines: medicineMap.size,
        diseases: diseaseCount,
        prescriptions: prescriptionCount,
      };
    } catch (error) {
      console.error('❌ Demo data import failed:', error);
      throw error;
    }
  }

  /**
   * Export user data for backup
   */
  async exportUserData(userId: string) {
    console.log('📤 Exporting user data...');
    
    const [medicines, diseases, prescriptions] = await Promise.all([
      medicinesService.getAll(userId),
      diseaseProfilesService.getAll(userId),
      prescriptionsService.getAll(userId),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      userId,
      medicines,
      diseases,
      prescriptions,
    };

    console.log('✅ Export complete');
    return exportData;
  }

  /**
   * Clear all user data
   */
  async clearUserData(userId: string) {
    console.log('🗑️ Clearing user data...');
    
    try {
      // Get all data
      const [medicines, diseases, prescriptions] = await Promise.all([
        medicinesService.getAll(userId),
        diseaseProfilesService.getAll(userId),
        prescriptionsService.getAll(userId),
      ]);

      // Delete all
      await Promise.all([
        ...medicines.map(m => medicinesService.delete(m.id)),
        ...diseases.map(d => diseaseProfilesService.delete(d.id)),
        ...prescriptions.map(p => prescriptionsService.delete(p.id)),
      ]);

      console.log('✅ User data cleared');
      
      return {
        deleted: {
          medicines: medicines.length,
          diseases: diseases.length,
          prescriptions: prescriptions.length,
        },
      };
    } catch (error) {
      console.error('❌ Clear data failed:', error);
      throw error;
    }
  }
}

export const migrationService = new MigrationService();
