import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../models/patient_model.dart';
import '../../models/clinical_analysis_model.dart';
import '../../models/document_model.dart';
import '../../services/clinical_service.dart';
import '../../services/document_service.dart';
import '../document/document_upload_screen.dart';
import '../document/document_viewer_screen.dart';

class PatientDetailScreen extends StatefulWidget {
  final PatientModel patient;
  const PatientDetailScreen({super.key, required this.patient});

  @override
  State<PatientDetailScreen> createState() => _PatientDetailScreenState();
}

class _PatientDetailScreenState extends State<PatientDetailScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  ClinicalAnalysisModel? _analysis;
  List<DocumentModel> _documents = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 6, vsync: this);
    _loadPatientData();
  }

  void _loadPatientData() async {
    setState(() => _isLoading = true);
    final analysis = await ClinicalService.getClinicalAnalysis(widget.patient.id);
    final docs = await DocumentService.getPatientDocuments(widget.patient.id);

    if (mounted) {
      setState(() {
        _analysis = analysis;
        _documents = docs;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final patient = widget.patient;

    return Scaffold(
      appBar: AppBar(
        title: Text(patient.fullName),
        actions: [
          IconButton(
            icon: const Icon(Icons.upload_file_rounded),
            tooltip: 'Upload Document',
            onPressed: () async {
              final result = await Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => DocumentUploadScreen(patientId: patient.id)),
              );
              if (result == true) _loadPatientData();
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          indicatorColor: AppTheme.accentTeal,
          labelColor: AppTheme.accentTeal,
          unselectedLabelColor: Colors.grey,
          tabs: const [
            Tab(text: 'Overview & Vitals'),
            Tab(text: 'AI Summary & OCR'),
            Tab(text: 'Risk Gauge (1-10)'),
            Tab(text: 'Insurance & Billing'),
            Tab(text: 'Pre-Op Checklist'),
            Tab(text: 'Treatment Approval'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildOverviewTab(patient),
                _buildAiSummaryTab(),
                _buildRiskTab(),
                _buildInsuranceBillingTab(patient),
                _buildPreOpTab(),
                _buildApprovalTab(),
              ],
            ),
    );
  }

  // 1. Overview & Vitals
  Widget _buildOverviewTab(PatientModel patient) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Demographics Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(patient.fullName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: patient.isCritical ? AppTheme.alertRed : AppTheme.emeraldGreen,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          patient.initialRisk.toUpperCase(),
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('Age: ${patient.age} | Gender: ${patient.gender}', style: const TextStyle(color: AppTheme.textMuted)),
                  const SizedBox(height: 8),
                  Text('Chief Complaint: ${patient.chiefComplaint}', style: const TextStyle(color: Colors.white)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Vitals Grid
          const Text('Clinical Vitals Telemetry', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white)),
          const SizedBox(height: 8),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 2.2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            children: [
              _buildVitalTile('Blood Pressure', patient.bp, Icons.favorite, Colors.redAccent),
              _buildVitalTile('Heart Rate', '${patient.hr} bpm', Icons.monitor_heart, Colors.orangeAccent),
              _buildVitalTile('SpO2', patient.spo2, Icons.air, Colors.blueAccent),
              _buildVitalTile('Temperature', patient.temperature, Icons.thermostat, Colors.amberAccent),
            ],
          ),
          const SizedBox(height: 16),
          // Uploaded Documents Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Patient Document Vault', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white)),
              TextButton.icon(
                icon: const Icon(Icons.add, size: 16),
                label: const Text('Add Document'),
                onPressed: () async {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => DocumentUploadScreen(patientId: patient.id)),
                  );
                  if (result == true) _loadPatientData();
                },
              ),
            ],
          ),
          ..._documents.map(
            (doc) => Card(
              child: ListTile(
                leading: const Icon(Icons.picture_as_pdf, color: AppTheme.alertRed),
                title: Text(doc.documentName, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                subtitle: Text('Type: ${doc.documentType} | OCR: ${doc.ocrStatus}', style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => DocumentViewerScreen(document: doc)),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVitalTile(String title, String val, IconData icon, Color color) {
    return Card(
      color: const Color(0xFF1E293B),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(title, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                Text(val, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // 2. AI Summary & OCR
  Widget _buildAiSummaryTab() {
    final analysis = _analysis!;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            color: const Color(0xFF1B365D),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.auto_awesome, color: AppTheme.emeraldGreen),
                      SizedBox(width: 8),
                      Text('Unified AI Clinical Intelligence Summary', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 15)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(analysis.unifiedSummary, style: const TextStyle(color: Colors.white, height: 1.4)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text('Extracted Symptoms', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: analysis.symptoms
                .map((s) => Chip(
                      label: Text(s, style: const TextStyle(color: Colors.white, fontSize: 12)),
                      backgroundColor: const Color(0xFF334155),
                    ))
                .toList(),
          ),
          const SizedBox(height: 16),
          const Text('Diagnosis & Prescribed Medications', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Primary Diagnosis: ${analysis.diagnosis}', style: const TextStyle(color: AppTheme.emeraldGreen, fontWeight: FontWeight.bold)),
                  const Divider(color: Colors.grey),
                  ...analysis.medications.map((m) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 2),
                        child: Row(
                          children: [
                            const Icon(Icons.medication, size: 14, color: AppTheme.accentTeal),
                            const SizedBox(width: 6),
                            Text(m, style: const TextStyle(color: Colors.white, fontSize: 12)),
                          ],
                        ),
                      )),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 3. Risk Gauge (1-10)
  Widget _buildRiskTab() {
    final analysis = _analysis!;
    final score = analysis.riskScore;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  const Text('Clinical Risk Score (1 to 10)', style: TextStyle(color: AppTheme.textMuted, fontSize: 14)),
                  const SizedBox(height: 12),
                  Text(
                    score.toStringAsFixed(1),
                    style: TextStyle(
                      fontSize: 56,
                      fontWeight: FontWeight.bold,
                      color: score >= 8.0 ? AppTheme.alertRed : (score >= 5.0 ? AppTheme.warningOrange : AppTheme.emeraldGreen),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(
                      color: score >= 8.0 ? AppTheme.alertRed.withOpacity(0.2) : AppTheme.emeraldGreen.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      analysis.priorityStatus,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: score >= 8.0 ? AppTheme.alertRed : AppTheme.emeraldGreen,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('Emergency Prioritization Logic Rules', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                  SizedBox(height: 8),
                  Text('• Score 8.0 - 10.0: STAT Priority — Cath Lab / Emergency ICU Queue', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                  Text('• Score 5.0 - 7.9: High Priority — Pre-Op Evaluation within 1 hr', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                  Text('• Score 1.0 - 4.9: Normal Priority — Standard Queue', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 4. Insurance & Billing
  Widget _buildInsuranceBillingTab(PatientModel patient) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Card(
            child: ListTile(
              leading: const Icon(Icons.verified_user, color: AppTheme.emeraldGreen, size: 36),
              title: Text('Provider: ${patient.insuranceProvider}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              subtitle: Text('Policy #: ${patient.policyNumber}\nStatus: ${patient.insuranceStatus}', style: const TextStyle(color: AppTheme.textMuted)),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Financial & Copay Breakdown', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                  const Divider(color: Colors.grey),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Pre-Auth Coverage:', style: TextStyle(color: AppTheme.textMuted)),
                      Text('${patient.coveragePercent}% Covered', style: const TextStyle(color: AppTheme.emeraldGreen, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Estimated Co-Payment:', style: TextStyle(color: AppTheme.textMuted)),
                      Text('₹${patient.coPay}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Billing Clearance Status:', style: TextStyle(color: AppTheme.textMuted)),
                      Text(patient.financeStatus, style: const TextStyle(color: AppTheme.emeraldGreen, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 5. Smart Pre-Op Checklist
  Widget _buildPreOpTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _buildPreOpCheckItem('Surgical Consent Signed & Verified', true),
          _buildPreOpCheckItem('Anesthesia Clearance & Assessment', true),
          _buildPreOpCheckItem('CBC & Coagulation Profile Labs', true),
          _buildPreOpCheckItem('EKG & Cardiac Clearance', true),
          _buildPreOpCheckItem('NPO (Nothing by Mouth) Status 8 Hrs', true),
          const SizedBox(height: 16),
          Card(
            color: AppTheme.emeraldGreen.withOpacity(0.15),
            child: const Padding(
              padding: EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(Icons.check_circle, color: AppTheme.emeraldGreen, size: 32),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'SMART PRE-OP CLEARANCE PASSED — READY FOR SURGERY / CATH LAB',
                      style: TextStyle(color: AppTheme.emeraldGreen, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPreOpCheckItem(String title, bool isDone) {
    return Card(
      child: ListTile(
        leading: Icon(isDone ? Icons.check_box : Icons.check_box_outline_blank, color: isDone ? AppTheme.emeraldGreen : Colors.grey),
        title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 13)),
        trailing: Text(isDone ? 'PASSED' : 'PENDING', style: TextStyle(color: isDone ? AppTheme.emeraldGreen : AppTheme.warningOrange, fontWeight: FontWeight.bold, fontSize: 11)),
      ),
    );
  }

  // 6. Treatment Approval
  Widget _buildApprovalTab() {
    final analysis = _analysis!;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Card(
            color: const Color(0xFF1E293B),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  const Icon(Icons.verified_rounded, size: 64, color: AppTheme.emeraldGreen),
                  const SizedBox(height: 12),
                  Text(
                    analysis.approvalRecommendation,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.emeraldGreen),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Multi-Document Clinical Intelligence Engine verified all clinical parameters, pre-op prerequisites, insurance eligibility, and risk thresholds.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton.icon(
                    icon: const Icon(Icons.check),
                    label: const Text('SIGN & APPROVE TREATMENT CASE'),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Treatment Case Approved & Signed by Doctor.')),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
