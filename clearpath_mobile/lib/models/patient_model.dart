class PatientModel {
  final int id;
  final String fullName;
  final String age;
  final String gender;
  final String chiefComplaint;
  final String initialRisk;
  final String bp;
  final String hr;
  final String temperature;
  final String spo2;
  final String timeElapsed;
  final String insuranceProvider;
  final String policyNumber;
  final String insuranceStatus;
  final String financeStatus;
  final String clinicalStatus;
  final String preOpStatus;
  final String approvalStatus;
  final int coPay;
  final int coveragePercent;
  final int unpaidDues;
  final String coverageDetails;
  final String assignedNurseId;
  final String assignedNurseName;

  PatientModel({
    required this.id,
    required this.fullName,
    required this.age,
    required this.gender,
    required this.chiefComplaint,
    required this.initialRisk,
    required this.bp,
    required this.hr,
    required this.temperature,
    required this.spo2,
    required this.timeElapsed,
    required this.insuranceProvider,
    required this.policyNumber,
    required this.insuranceStatus,
    required this.financeStatus,
    required this.clinicalStatus,
    required this.preOpStatus,
    required this.approvalStatus,
    required this.coPay,
    required this.coveragePercent,
    required this.unpaidDues,
    required this.coverageDetails,
    required this.assignedNurseId,
    required this.assignedNurseName,
  });

  factory PatientModel.fromJson(Map<String, dynamic> json) {
    return PatientModel(
      id: json['id'] ?? 0,
      fullName: json['full_name'] ?? json['name'] ?? 'Unknown Patient',
      age: json['age']?.toString() ?? 'N/A',
      gender: json['gender'] ?? 'N/A',
      chiefComplaint: json['chief_complaint'] ?? 'No complaint recorded',
      initialRisk: json['initial_risk'] ?? 'Low',
      bp: json['bp'] ?? 'N/A',
      hr: json['hr'] ?? 'N/A',
      temperature: json['temperature'] ?? 'N/A',
      spo2: json['spo2'] ?? 'N/A',
      timeElapsed: json['time_elapsed'] ?? 'Recently',
      insuranceProvider: json['insurance_provider'] ?? 'None',
      policyNumber: json['policy_number'] ?? 'N/A',
      insuranceStatus: json['insurance_status'] ?? 'Checking...',
      financeStatus: json['finance_status'] ?? 'Cleared',
      clinicalStatus: json['clinical_status'] ?? 'Checking...',
      preOpStatus: json['pre_op_status'] ?? 'Pending',
      approvalStatus: json['approval_status'] ?? 'Pending',
      coPay: json['co_pay'] ?? 0,
      coveragePercent: json['coverage_percent'] ?? 0,
      unpaidDues: json['unpaid_dues'] ?? 0,
      coverageDetails: json['coverage_details'] ?? '',
      assignedNurseId: json['assigned_nurse_id'] ?? 'NUR-1007',
      assignedNurseName: json['assigned_nurse_name'] ?? 'Priya Nair',
    );
  }

  bool get isCritical => initialRisk.toUpperCase() == 'STAT' || initialRisk.toUpperCase() == 'HIGH';
}
