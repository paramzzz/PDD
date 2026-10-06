import '../core/config/api_config.dart';
import '../services/api_service.dart';
import '../core/utils/session_manager.dart';

class AuthService {
  static Future<bool> login({
    required String email,
    required String password,
    String role = 'DOCTOR',
  }) async {
    try {
      final response = await ApiService.post(ApiConfig.loginEndpoint, {
        'email': email,
        'password': password,
        'role': role.toUpperCase(),
      });

      if (response['success'] == true) {
        await SessionManager.saveSession(
          userId: response['user_id'] ?? 1,
          fullname: response['fullname'] ?? (role == 'NURSE' ? 'Nurse User' : 'Dr. Sarah Wilson'),
          role: response['role'] ?? role.toUpperCase(),
          nurseId: response['nurse_id']?.toString(),
          department: response['department']?.toString(),
        );
        return true;
      }
      return false;
    } catch (e) {
      // Fallback for offline demo credentials matching backend logic
      if (email == 'doctor@clearpath.ai' && password == 'doctor123') {
        await SessionManager.saveSession(
          userId: 1,
          fullname: 'Dr. Sarah Wilson',
          role: 'DOCTOR',
        );
        return true;
      } else if (email == 'priya@clearpath.ai' && password == 'nurse123') {
        await SessionManager.saveSession(
          userId: 101,
          fullname: 'Nurse Priya Nair',
          role: 'NURSE',
          nurseId: 'NUR-1007',
          department: 'Cardiology',
        );
        return true;
      }
      rethrow;
    }
  }

  static Future<void> logout() async {
    await SessionManager.clearSession();
  }
}
