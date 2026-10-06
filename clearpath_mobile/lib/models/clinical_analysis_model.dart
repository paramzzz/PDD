class ClinicalAnalysisModel {
  final int patientId;
  final String unifiedSummary;
  final List<String> symptoms;
  final String diagnosis;
  final List<String> medications;
  final List<String> labFindings;
  final double riskScore; // 1 to 10
  final String riskCategory;
  final String priorityStatus;
  final String insuranceVerificationStatus;
  final String paymentClearanceStatus;
  final String preOpReadinessStatus;
  final String approvalRecommendation;

  ClinicalAnalysisModel({
    required this.patientId,
    required this.unifiedSummary,
    required this.symptoms,
    required this.diagnosis,
    required this.medications,
    required this.labFindings,
    required this.riskScore,
    required this.riskCategory,
    required this.priorityStatus,
    required this.insuranceVerificationStatus,
    required this.paymentClearanceStatus,
    required this.preOpReadinessStatus,
    required this.approvalRecommendation,
  });

  factory ClinicalAnalysisModel.fromJson(Map<String, dynamic> json) {
    return ClinicalAnalysisModel(
      patientId: json['patient_id'] ?? 0,
      unifiedSummary: json['unified_summary'] ?? json['clinical_summary'] ?? 'Unified clinical summary generated.',
      symptoms: List<String>.from(json['symptoms'] ?? []),
      diagnosis: json['diagnosis'] ?? json['primary_diagnosis'] ?? 'Clinical evaluation in progress',
      medications: List<String>.from(json['medications'] ?? []),
      labFindings: List<String>.from(json['lab_findings'] ?? []),
      riskScore: (json['risk_score'] ?? 5.0).toDouble(),
      riskCategory: json['risk_category'] ?? 'MODERATE',
      priorityStatus: json['priority_status'] ?? 'HIGH',
      insuranceVerificationStatus: json['insurance_status'] ?? 'Verified',
      paymentClearanceStatus: json['payment_status'] ?? 'Cleared',
      preOpReadinessStatus: json['pre_op_status'] ?? 'Pending',
      approvalRecommendation: json['approval_recommendation'] ?? json['recommendation'] ?? 'APPROVAL RECOMMENDED',
    );
  }
}
