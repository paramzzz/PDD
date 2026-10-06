import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/session_manager.dart';
import '../../models/patient_model.dart';
import '../../services/patient_service.dart';
import '../patient/patient_list_screen.dart';
import '../patient/patient_detail_screen.dart';
import '../patient/add_patient_screen.dart';
import '../auth/login_screen.dart';
import '../copilot/copilot_sheet.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic> _session = {};
  List<PatientModel> _patients = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  void _loadDashboardData() async {
    setState(() => _isLoading = true);
    final sess = await SessionManager.getSession();
    final list = await PatientService.getPatients();

    if (mounted) {
      setState(() {
        _session = sess;
        _patients = list;
        _isLoading = false;
      });
    }
  }

  void _openCopilot() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const CopilotSheet(),
    );
  }

  void _logout() async {
    await SessionManager.clearSession();
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final fullname = _session['fullname'] ?? 'Dr. Sarah Wilson';
    final role = _session['role'] ?? 'DOCTOR';
    final statPatients = _patients.where((p) => p.isCritical).toList();

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('CLEAR PATH CLINICAL COPILOT', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1)),
            Text('$role: $fullname', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.psychology_outlined, color: AppTheme.emeraldGreen),
            tooltip: 'AI Copilot Sheet',
            onPressed: _openCopilot,
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.grey),
            tooltip: 'Sign Out',
            onPressed: _logout,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openCopilot,
        backgroundColor: AppTheme.accentTeal,
        icon: const Icon(Icons.auto_awesome),
        label: const Text('Ask AI Copilot'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async => _loadDashboardData(),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // System Status Banner
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.emeraldGreen.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppTheme.emeraldGreen.withOpacity(0.4)),
                      ),
                      child: Row(
                        children: const [
                          Icon(Icons.shield_outlined, color: AppTheme.emeraldGreen, size: 22),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'ClearPath OCR & Clinical AI Engine Operational — Backend Online',
                              style: TextStyle(color: AppTheme.emeraldGreen, fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Executive Telemetry Grid
                    const Text('Executive Dashboard Telemetry', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white)),
                    const SizedBox(height: 10),
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      childAspectRatio: 1.5,
                      children: [
                        _buildStatCard('Total Patients', _patients.length.toString(), Icons.people_outline, Colors.blue),
                        _buildStatCard('STAT Emergency', statPatients.length.toString(), Icons.warning_amber_rounded, AppTheme.alertRed),
                        _buildStatCard('Pre-Auth Cleared', '94%', Icons.verified_user_outlined, AppTheme.emeraldGreen),
                        _buildStatCard('Pre-Op Ready', '88%', Icons.medical_services_outlined, Colors.amber),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Quick Actions Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Emergency Priority Queue', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white)),
                        TextButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const PatientListScreen()),
                            );
                          },
                          child: const Text('View All Queue →'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // STAT Emergency Alert Queue List
                    if (statPatients.isNotEmpty)
                      ...statPatients.map(
                        (patient) => Card(
                          color: const Color(0xFF2C1C24),
                          child: ListTile(
                            leading: const CircleAvatar(
                              backgroundColor: AppTheme.alertRed,
                              child: Icon(Icons.emergency, color: Colors.white),
                            ),
                            title: Text(patient.fullName, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                            subtitle: Text('STAT Risk: ${patient.chiefComplaint}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                            trailing: ElevatedButton(
                              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.alertRed, padding: const EdgeInsets.symmetric(horizontal: 10)),
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => PatientDetailScreen(patient: patient)),
                                );
                              },
                              child: const Text('TRIAGE', style: TextStyle(fontSize: 11)),
                            ),
                          ),
                        ),
                      )
                    else
                      const Card(
                        child: Padding(
                          padding: EdgeInsets.all(16),
                          child: Center(
                            child: Text('No STAT emergency cases pending triage.', style: TextStyle(color: AppTheme.textMuted)),
                          ),
                        ),
                      ),

                    const SizedBox(height: 20),

                    // Quick Action Launchers
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            icon: const Icon(Icons.person_add),
                            label: const Text('Add Patient'),
                            onPressed: () async {
                              final res = await Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const AddPatientScreen()),
                              );
                              if (res == true) _loadDashboardData();
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            icon: const Icon(Icons.format_list_bulleted),
                            label: const Text('Patient Queue'),
                            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF334155)),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const PatientListScreen()),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildStatCard(String title, String val, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                Icon(icon, color: color, size: 20),
              ],
            ),
            const SizedBox(height: 8),
            Text(val, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
          ],
        ),
      ),
    );
  }
}
