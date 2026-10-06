import 'dart:io';

class ApiConfig {
  // Configurable base URL: 10.0.2.2 for Android Emulator, 127.0.0.1 for Desktop/Web/iOS Simulator
  static String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8000';
    }
    return 'http://127.0.0.1:8000';
  }

  static const String healthEndpoint = '/health';
  static const String loginEndpoint = '/login';
  static const String signupEndpoint = '/signup';
  static const String patientsEndpoint = '/patients';
  static const String createPatientEndpoint = '/patients/create';
  static const String uploadDocumentEndpoint = '/upload-document';
  static const String copilotQueryEndpoint = '/copilot/query';

  static String getDocumentUploadsUrl(String path) {
    if (path.startsWith('http')) return path;
    final cleanPath = path.startsWith('/') ? path : '/$path';
    return '$baseUrl$cleanPath';
  }
}
