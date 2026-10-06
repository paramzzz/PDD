class DocumentModel {
  final int id;
  final int patientId;
  final String patientName;
  final String documentName;
  final String documentType;
  final String uploadedByRole;
  final String uploadedByName;
  final String verificationStatus;
  final String createdAt;
  final String documentCategory;
  final String documentSubtype;
  final String ocrStatus;
  final String classification;
  final double classificationConfidence;
  final String storagePath;

  DocumentModel({
    required this.id,
    required this.patientId,
    required this.patientName,
    required this.documentName,
    required this.documentType,
    required this.uploadedByRole,
    required this.uploadedByName,
    required this.verificationStatus,
    required this.createdAt,
    required this.documentCategory,
    required this.documentSubtype,
    required this.ocrStatus,
    required this.classification,
    required this.classificationConfidence,
    required this.storagePath,
  });

  factory DocumentModel.fromJson(Map<String, dynamic> json) {
    return DocumentModel(
      id: json['id'] ?? 0,
      patientId: json['patient_id'] ?? 0,
      patientName: json['patient_name'] ?? '',
      documentName: json['document_name'] ?? 'Medical Document',
      documentType: json['document_type'] ?? 'General',
      uploadedByRole: json['uploaded_by_role'] ?? 'DOCTOR',
      uploadedByName: json['uploaded_by_name'] ?? 'Dr. Sarah Wilson',
      verificationStatus: json['verification_status'] ?? 'VERIFIED',
      createdAt: json['created_at'] ?? '',
      documentCategory: json['document_category'] ?? 'Clinical',
      documentSubtype: json['document_subtype'] ?? 'General Report',
      ocrStatus: json['ocr_status'] ?? 'COMPLETED',
      classification: json['classification'] ?? 'Medical Document',
      classificationConfidence: (json['classification_confidence'] ?? 0.95).toDouble(),
      storagePath: json['storage_path'] ?? '',
    );
  }
}
