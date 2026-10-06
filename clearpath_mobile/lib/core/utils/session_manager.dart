import 'package:shared_preferences/shared_preferences.dart';

class SessionManager {
  static const String keyIsLoggedIn = 'is_logged_in';
  static const String keyUserId = 'user_id';
  static const String keyNurseId = 'nurse_id';
  static const String keyFullname = 'fullname';
  static const String keyRole = 'role';
  static const String keyDepartment = 'department';
  static const String keyAuthToken = 'auth_token';

  static Future<void> saveSession({
    required int userId,
    required String fullname,
    required String role,
    String? nurseId,
    String? department,
    String? token,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(keyIsLoggedIn, true);
    await prefs.setInt(keyUserId, userId);
    await prefs.setString(keyFullname, fullname);
    await prefs.setString(keyRole, role);
    if (nurseId != null) await prefs.setString(keyNurseId, nurseId);
    if (department != null) await prefs.setString(keyDepartment, department);
    if (token != null) await prefs.setString(keyAuthToken, token);
  }

  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(keyIsLoggedIn) ?? false;
  }

  static Future<Map<String, dynamic>> getSession() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      'isLoggedIn': prefs.getBool(keyIsLoggedIn) ?? false,
      'userId': prefs.getInt(keyUserId) ?? 1,
      'nurseId': prefs.getString(keyNurseId) ?? '',
      'fullname': prefs.getString(keyFullname) ?? 'Dr. Sarah Wilson',
      'role': prefs.getString(keyRole) ?? 'DOCTOR',
      'department': prefs.getString(keyDepartment) ?? 'Cardiology',
      'token': prefs.getString(keyAuthToken) ?? '',
    };
  }

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}
