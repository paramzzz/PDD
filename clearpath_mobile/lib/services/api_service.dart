import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../core/config/api_config.dart';

class ApiService {
  static Future<Map<String, String>> _getHeaders() async {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  static Future<dynamic> get(String endpoint) async {
    final url = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    final headers = await _getHeaders();

    try {
      final response = await http.get(url, headers: headers).timeout(const Duration(seconds: 15));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('API Error [${response.statusCode}]: ${response.body}');
      }
    } catch (e) {
      throw Exception('Network request failed: $e');
    }
  }

  static Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    final url = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    final headers = await _getHeaders();

    try {
      final response = await http.post(
        url,
        headers: headers,
        body: json.encode(body),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        throw Exception('API Error [${response.statusCode}]: ${response.body}');
      }
    } catch (e) {
      throw Exception('Network request failed: $e');
    }
  }

  static Future<dynamic> uploadMultipart({
    required String endpoint,
    required String filePath,
    required Map<String, String> fields,
  }) async {
    final url = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    final request = http.MultipartRequest('POST', url);

    fields.forEach((key, value) {
      request.fields[key] = value;
    });

    final file = File(filePath);
    if (await file.exists()) {
      request.files.add(await http.MultipartFile.fromPath('file', filePath));
    }

    try {
      final streamedResponse = await request.send().timeout(const Duration(seconds: 30));
      final response = await http.Response.fromStream(streamedResponse);
      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        throw Exception('Upload Failed [${response.statusCode}]: ${response.body}');
      }
    } catch (e) {
      throw Exception('File upload failed: $e');
    }
  }
}
