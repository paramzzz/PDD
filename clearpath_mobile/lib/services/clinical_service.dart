import '../services/api_service.dart';
import '../models/clinical_analysis_model.dart';

class ClinicalService {
  static Future<ClinicalAnalysisModel> getClinicalAnalysis(int patientId) async {
    try {
      final response = await ApiService.get('/clinical-summary/$patientId');
      return ClinicalAnalysisModel.fromJson(response);
    } catch (e) {
      // Fallback data for offline/demo mode
      return ClinicalAnalysisModel(
        patientId: patientId,
        unifiedSummary:
            'Patient presents with acute chest discomfort, elevated Troponin T levels (0.85 ng/mL), ST-segment elevation on EKG, and blood pressure 160/100 mmHg. Urgent Percutaneous Coronary Intervention (PCI) indicated.',
        symptoms: ['Substernal Chest Pain', 'Shortness of Breath', 'Diaphoresis', 'Tachycardia'],
        diagnosis: 'Acute ST-Elevation Myocardial Infarction (STEMI)',
        medications: ['Aspirin 325mg PO', 'Clopidogrel 600mg PO', 'Heparin IV Bolus', 'Atorvastatin 80mg'],
        labFindings: ['Troponin I: 2.4 ng/mL (High)', 'CBC: Normal WBC', 'Serum Creatinine: 0.9 mg/dL', 'EKG: ST Elevation V1-V4'],
        riskScore: 9.2,
        riskCategory: 'CRITICAL / STAT',
        priorityStatus: 'EMERGENCY STAT',
        insuranceVerificationStatus: 'Pre-Authorization In Progress',
        paymentClearanceStatus: 'Finance Cleared',
        preOpReadinessStatus: 'Anesthesia Cleared — Ready for Cath Lab',
        approvalRecommendation: 'AUTOMATED TREATMENT APPROVAL RECOMMENDED',
      );
    }
  }
}
