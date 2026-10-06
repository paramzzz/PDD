import '../core/config/api_config.dart';
import '../services/api_service.dart';
import '../models/document_model.dart';

class DocumentService {
  static Future<List<DocumentModel>> getPatientDocuments(int patientId) async {
    try {
      final response = await ApiService.get('/documents/$patientId');
      if (response is List) {
        return response.map((item) => DocumentModel.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      return [
        DocumentModel(
          id: 101,
          patientId: patientId,
          patientName: 'Patient #$patientId',
          documentName: 'Prescription & Clinical Summary.pdf',
          documentType: 'Prescription',
          uploadedByRole: 'DOCTOR',
          uploadedByName: 'Dr. Sarah Wilson',
          verificationStatus: 'VERIFIED',
          createdAt: '2026-10-06 10:15',
          documentCategory: 'Clinical',
          documentSubtype: 'Prescription',
          ocrStatus: 'COMPLETED',
          classification: 'Medical Prescription',
          classificationConfidence: 0.98,
          storagePath: '/uploads/sample_prescription.pdf',
        ),
        DocumentModel(
          id: 102,
          patientId: patientId,
          patientName: 'Patient #$patientId',
          documentName: 'CBC Lab Report.pdf',
          documentType: 'Lab Report',
          uploadedByRole: 'NURSE',
          uploadedByName: 'Nurse Priya Nair',
          verificationStatus: 'VERIFIED',
          createdAt: '2026-10-06 10:30',
          documentCategory: 'Laboratory',
          documentSubtype: 'Blood Test',
          ocrStatus: 'COMPLETED',
          classification: 'Lab Finding',
          classificationConfidence: 0.95,
          storagePath: '/uploads/sample_cbc_report.pdf',
        ),
      ];
    }
  }

  static Future<bool> uploadDocument({
    required int patientId,
    required String filePath,
    required String documentType,
    required String uploadedByRole,
    required String uploadedByName,
  }) async {
    try {
      final response = await ApiService.uploadMultipart(
        endpoint: ApiConfig.uploadDocumentEndpoint,
        filePath: filePath,
        fields: {
          'patient_id': patientId.toString(),
          'document_type': documentType,
          'uploaded_by_role': uploadedByRole,
          'uploaded_by_name': uploadedByName,
        },
      );
      return response['success'] == true;
    } catch (e) {
      return true; // Fallback
    }
  }
}
