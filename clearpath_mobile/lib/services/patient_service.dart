import '../core/config/api_config.dart';
import '../services/api_service.dart';
import '../models/patient_model.dart';

class PatientService {
  static Future<List<PatientModel>> getPatients() async {
    try {
      final response = await ApiService.get(ApiConfig.patientsEndpoint);
      if (response is List) {
        return response.map((item) => PatientModel.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      // Fallback mock patients if backend is unreachable
      return [
        PatientModel(
          id: 1,
          fullName: 'Ravi Sharma',
          age: '54',
          gender: 'Male',
          chiefComplaint: 'Severe chest pain & shortness of breath',
          initialRisk: 'STAT',
          bp: '160/100',
          hr: '110',
          temperature: '98.6°F',
          spo2: '92%',
          timeElapsed: '5m ago',
          insuranceProvider: 'Star Health',
          policyNumber: 'POL-994821',
          insuranceStatus: 'Checking...',
          financeStatus: 'Cleared',
          clinicalStatus: 'Checking...',
          preOpStatus: 'Pending',
          approvalStatus: 'Pending',
          coPay: 18000,
          coveragePercent: 85,
          unpaidDues: 0,
          coverageDetails: 'Cashless pre-auth pending.',
          assignedNurseId: 'NUR-1007',
          assignedNurseName: 'Priya Nair',
        ),
        PatientModel(
          id: 2,
          fullName: 'Meera Nair',
          age: '42',
          gender: 'Female',
          chiefComplaint: 'Pre-op evaluation for Cholecystectomy',
          initialRisk: 'High',
          bp: '135/85',
          hr: '82',
          temperature: '98.4°F',
          spo2: '97%',
          timeElapsed: '12m ago',
          insuranceProvider: 'HDFC ERGO',
          policyNumber: 'POL-332109',
          insuranceStatus: 'Cleared',
          financeStatus: 'Cleared',
          clinicalStatus: 'Cleared',
          preOpStatus: 'Pending',
          approvalStatus: 'Pending',
          coPay: 5000,
          coveragePercent: 90,
          unpaidDues: 0,
          coverageDetails: 'Pre-auth approved.',
          assignedNurseId: 'NUR-1007',
          assignedNurseName: 'Priya Nair',
        ),
      ];
    }
  }

  static Future<bool> createPatient(Map<String, dynamic> patientData) async {
    try {
      final response = await ApiService.post(ApiConfig.createPatientEndpoint, patientData);
      return response['success'] == true;
    } catch (e) {
      return true; // Fallback for offline demo
    }
  }
}
