import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/session_manager.dart';
import '../auth/login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic> _session = {};

  @override
  void initState() {
    super.initState();
    _loadSession();
  }

  void _loadSession() async {
    final sess = await SessionManager.getSession();
    if (mounted) {
      setState(() {
        _session = sess;
      });
    }
  }

  void _logout() async {
    await SessionManager.clearSession();
    if (mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final fullname = _session['fullname'] ?? 'Dr. Sarah Wilson';
    final role = _session['role'] ?? 'DOCTOR';
    final isNurse = role == 'NURSE';
    final nurseId = _session['nurseId'] ?? 'NUR-1007';
    final dept = _session['department'] ?? 'Cardiology';

    return Scaffold(
      appBar: AppBar(
        title: const Text('User Profile & Credentials'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: AppTheme.alertRed),
            onPressed: _logout,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // User Header Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: isNurse ? Colors.purple.withValues(alpha: 0.2) : AppTheme.accentTeal.withValues(alpha: 0.2),
                      child: Icon(
                        isNurse ? Icons.medical_services_rounded : Icons.person_rounded,
                        size: 48,
                        color: isNurse ? Colors.purpleAccent : AppTheme.accentTeal,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      fullname,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: Colors.white),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: isNurse ? Colors.purple.withValues(alpha: 0.2) : AppTheme.emeraldGreen.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '$role PORTAL',
                        style: TextStyle(
                          color: isNurse ? Colors.purpleAccent : AppTheme.emeraldGreen,
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Profile Details
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildInfoRow('Department / Specialty', dept),
                    const Divider(color: Colors.grey),
                    _buildInfoRow('Hospital Unit', isNurse ? 'ICU-Unit 1' : 'Cardiology Wing'),
                    const Divider(color: Colors.grey),
                    _buildInfoRow('License / Employee ID', isNurse ? nurseId : 'LIC-998241'),
                    const Divider(color: Colors.grey),
                    _buildInfoRow('Assigned Shift', isNurse ? 'Day Shift (08:00 - 16:00)' : 'On-Call 24/7'),
                    const Divider(color: Colors.grey),
                    _buildInfoRow('Clearance Status', 'Level 3 HIPAA Approved'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              icon: const Icon(Icons.logout),
              label: const Text('SIGN OUT OF CLEAR PATH'),
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.alertRed, minimumSize: const Size.fromHeight(48)),
              onPressed: _logout,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          Text(val, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
        ],
      ),
    );
  }
}
