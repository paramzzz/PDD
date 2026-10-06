import 'api_service.dart';

class CareTeamService {
  static Future<List<dynamic>> getNurses() async {
    try {
      final res = await ApiService.get('/api/nurses');
      if (res is List) {
        return res;
      }
      return [];
    } catch (e) {
      // Fallback mock data if network fails
      return [
        {
          "id": 101,
          "nurse_id": "NUR-1007",
          "name": "Priya Nair",
          "email": "priya@clearpath.ai",
          "department": "Cardiology",
          "hospital_unit": "ICU Bed 4A",
          "shift": "DAY",
          "availability_status": "ACTIVE",
          "assigned_patients_count": 4
        },
        {
          "id": 102,
          "nurse_id": "NUR-1008",
          "name": "Ananya Roy",
          "email": "ananya@clearpath.ai",
          "department": "Emergency",
          "hospital_unit": "ER Bay 2",
          "shift": "DAY",
          "availability_status": "ON-CALL",
          "assigned_patients_count": 6
        },
        {
          "id": 103,
          "nurse_id": "NUR-1009",
          "name": "Rajesh Kumar",
          "email": "rajesh@clearpath.ai",
          "department": "Surgery",
          "hospital_unit": "OT Room 1",
          "shift": "NIGHT",
          "availability_status": "IN SURGERY",
          "assigned_patients_count": 2
        }
      ];
    }
  }

  static Future<Map<String, dynamic>> createNurseRequest({
    required int patientId,
    required String requestText,
    required String priority,
    int doctorId = 1,
    String doctorName = "Dr. Sarah Wilson",
  }) async {
    final body = {
      "patient_id": patientId,
      "doctor_id": doctorId,
      "doctor_name": doctorName,
      "request_text": requestText,
      "priority": priority,
    };
    return await ApiService.post('/api/nurse-requests/create', body);
  }
}
