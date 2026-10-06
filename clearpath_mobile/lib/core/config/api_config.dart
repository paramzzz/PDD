import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;

class ApiConfig {
  static String customOverrideUrl = '';

  static String get baseUrl {
    if (customOverrideUrl.isNotEmpty) {
      return customOverrideUrl;
    }
    if (kIsWeb) {
      return 'http://127.0.0.1:8000';
    }
    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:8000';
      }
    } catch (_) {}
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

  static Future<Map<String, dynamic>> checkBackendHealth() async {
    final targetUrl = '$baseUrl$healthEndpoint';
    final startTime = DateTime.now();
    try {
      final response = await http.get(Uri.parse(targetUrl)).timeout(const Duration(seconds: 4));
      final duration = DateTime.now().difference(startTime).inMilliseconds;
      if (response.statusCode == 200) {
        return {
          'online': true,
          'url': targetUrl,
          'statusCode': response.statusCode,
          'responseTimeMs': duration,
          'message': 'Connected to ClearPath Backend ($targetUrl)'
        };
      } else {
        return {
          'online': false,
          'url': targetUrl,
          'statusCode': response.statusCode,
          'message': 'Backend responded with HTTP ${response.statusCode}'
        };
      }
    } catch (e) {
      return {
        'online': false,
        'url': targetUrl,
        'error': e.toString(),
        'message': 'Cannot reach ClearPath Backend ($targetUrl). Ensure Uvicorn runs on http://0.0.0.0:8000'
      };
    }
  }
}
