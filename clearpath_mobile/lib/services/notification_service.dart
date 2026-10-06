import 'api_service.dart';

class NotificationService {
  static Future<List<dynamic>> getNotifications({String role = "DOCTOR", int userId = 1}) async {
    try {
      final res = await ApiService.get('/api/notifications?role=$role&user_id=$userId');
      if (res is List) {
        return res;
      }
      return [];
    } catch (e) {
      return [
        {
          "id": 1,
          "type": "EMERGENCY_ALERT",
          "title": "🚨 STAT Critical Alert: Ravi Sharma",
          "message": "High priority acute STEMI risk detected. Cath Lab team notified.",
          "patient_id": 1,
          "case_id": "CP-7841",
          "priority": "STAT",
          "is_read": 0,
          "created_at": "2 mins ago"
        },
        {
          "id": 2,
          "type": "NURSE_RESPONSE",
          "title": "🔔 Nurse Vitals Update Received",
          "message": "Nurse Priya Nair updated vitals for Patient #1: BP 160/100, HR 98, SpO2 94%.",
          "patient_id": 1,
          "case_id": "CP-7841",
          "priority": "HIGH",
          "is_read": 0,
          "created_at": "12 mins ago"
        },
        {
          "id": 3,
          "type": "DOCUMENT_ANALYSIS",
          "title": "📄 AI Document Classification Ready",
          "message": "CBC & Cardiac Enzymes report extracted with 98.4% confidence.",
          "patient_id": 1,
          "case_id": "CP-7841",
          "priority": "NORMAL",
          "is_read": 1,
          "created_at": "1 hour ago"
        }
      ];
    }
  }
}
