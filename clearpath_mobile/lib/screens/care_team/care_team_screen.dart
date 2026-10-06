import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../services/care_team_service.dart';
import '../../services/patient_service.dart';
import '../../models/patient_model.dart';

class CareTeamScreen extends StatefulWidget {
  const CareTeamScreen({super.key});

  @override
  State<CareTeamScreen> createState() => _CareTeamScreenState();
}

class _CareTeamScreenState extends State<CareTeamScreen> {
  bool _isLoading = true;
  List<dynamic> _nurses = [];
  List<PatientModel> _patients = [];
  String _selectedDept = 'ALL';
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final nurses = await CareTeamService.getNurses();
      final patients = await PatientService.getPatients();
      setState(() {
        _nurses = nurses;
        _patients = patients;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _showDispatchDialog() {
    int? selectedPatientId = _patients.isNotEmpty ? _patients.first.id : 1;
    String requestText = '';
    String priority = 'HIGH';
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surfaceDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
                top: 20,
                left: 20,
                right: 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Dispatch Nurse Request',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: AppTheme.textSecondary),
                        onPressed: () => Navigator.pop(context),
                      )
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text('Select Target Patient:', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: AppTheme.cardDark,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<int>(
                        value: selectedPatientId,
                        isExpanded: true,
                        dropdownColor: AppTheme.cardDark,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        items: _patients.map((p) {
                          return DropdownMenuItem<int>(
                            value: p.id,
                            child: Text('#${p.id} — ${p.fullName} (${p.initialRisk})'),
                          );
                        }).toList(),
                        onChanged: (val) {
                          setModalState(() => selectedPatientId = val);
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text('Priority Level:', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                  const SizedBox(height: 6),
                  Row(
                    children: ['CRITICAL', 'HIGH', 'NORMAL'].map((p) {
                      final isSelected = priority == p;
                      Color btnColor = p == 'CRITICAL'
                          ? AppTheme.accentRed
                          : p == 'HIGH'
                              ? Colors.orange
                              : AppTheme.primaryTeal;
                      return Expanded(
                        child: GestureDetector(
                          onTap: () => setModalState(() => priority = p),
                          child: Container(
                            margin: const EdgeInsets.only(right: 8),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: isSelected ? btnColor.withOpacity(0.25) : AppTheme.cardDark,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: isSelected ? btnColor : Colors.white12),
                            ),
                            child: Text(
                              p,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: isSelected ? btnColor : AppTheme.textSecondary,
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  const Text('Clinical Task / Request Details:', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextField(
                    maxLines: 3,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: InputDecoration(
                      hintText: 'e.g. Please check arterial blood pressure and administer IV Nitroglycerin STAT.',
                      hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
                      filled: true,
                      fillColor: AppTheme.cardDark,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Colors.white12)),
                    ),
                    onChanged: (val) => requestText = val,
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryTeal,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: isSubmitting
                          ? null
                          : () async {
                              if (requestText.trim().isEmpty) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Please enter task instructions')),
                                );
                                return;
                              }
                              setModalState(() => isSubmitting = true);
                              try {
                                await CareTeamService.createNurseRequest(
                                  patientId: selectedPatientId ?? 1,
                                  requestText: requestText.trim(),
                                  priority: priority,
                                );
                                Navigator.pop(context);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Nurse Request Dispatched ($priority priority)'),
                                    backgroundColor: AppTheme.primaryTeal,
                                  ),
                                );
                              } catch (e) {
                                setModalState(() => isSubmitting = false);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Failed: $e'), backgroundColor: AppTheme.accentRed),
                                );
                              }
                            },
                      child: isSubmitting
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text('DISPATCH REQUEST', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredNurses = _nurses.where((n) {
      final matchesDept = _selectedDept == 'ALL' || n['department'].toString().toUpperCase() == _selectedDept;
      final matchesQuery = _searchQuery.isEmpty ||
          n['name'].toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
          n['department'].toString().toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesDept && matchesQuery;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryTeal))
          : Column(
              children: [
                // Top Search & Filter Banner
                Container(
                  padding: const EdgeInsets.all(16),
                  color: AppTheme.surfaceDark,
                  child: Column(
                    children: [
                      TextField(
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: InputDecoration(
                          hintText: 'Search Care Team by name or department...',
                          hintStyle: const TextStyle(color: AppTheme.textMuted),
                          prefixIcon: const Icon(Icons.search, color: AppTheme.primaryTeal),
                          filled: true,
                          fillColor: AppTheme.cardDark,
                          contentPadding: const EdgeInsets.symmetric(vertical: 10),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                        ),
                        onChanged: (val) => setState(() => _searchQuery = val),
                      ),
                      const SizedBox(height: 12),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: ['ALL', 'CARDIOLOGY', 'ICU', 'EMERGENCY', 'SURGERY'].map((dept) {
                            final isSel = _selectedDept == dept;
                            return Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: FilterChip(
                                label: Text(dept, style: TextStyle(color: isSel ? Colors.white : AppTheme.textSecondary, fontSize: 12)),
                                selected: isSel,
                                selectedColor: AppTheme.primaryTeal,
                                backgroundColor: AppTheme.cardDark,
                                onSelected: (_) => setState(() => _selectedDept = dept),
                              ),
                            );
                          }).toList(),
                        ),
                      )
                    ],
                  ),
                ),
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: _loadData,
                    color: AppTheme.primaryTeal,
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: filteredNurses.length + 1,
                      itemBuilder: (context, index) {
                        if (index == 0) {
                          // Quick Roster Summary Header Card
                          return Card(
                            color: AppTheme.surfaceDark,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                              side: const BorderSide(color: Colors.white10),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: AppTheme.primaryTeal.withOpacity(0.15),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.people_alt, color: AppTheme.primaryTeal, size: 28),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          'Care Team Roster',
                                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          '${filteredNurses.length} Staff Members Active | Hospital Unit Alpha',
                                          style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                                        ),
                                      ],
                                    ),
                                  ),
                                  ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppTheme.primaryTeal,
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    icon: const Icon(Icons.send_rounded, size: 16, color: Colors.white),
                                    label: const Text('DISPATCH', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                                    onPressed: _showDispatchDialog,
                                  )
                                ],
                              ),
                            ),
                          );
                        }

                        final n = filteredNurses[index - 1];
                        final String status = (n['availability_status'] ?? 'ACTIVE').toString().toUpperCase();
                        Color statusColor = status == 'ACTIVE'
                            ? AppTheme.accentGreen
                            : status == 'ON-CALL'
                                ? Colors.orange
                                : AppTheme.accentRed;

                        return Card(
                          margin: const EdgeInsets.only(top: 12),
                          color: AppTheme.surfaceDark,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                            side: const BorderSide(color: Colors.white10),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    CircleAvatar(
                                      radius: 22,
                                      backgroundColor: AppTheme.primaryTeal.withOpacity(0.2),
                                      child: Text(
                                        n['name'].toString().substring(0, 1),
                                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryTeal),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Text(
                                                n['name'] ?? '',
                                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                                              ),
                                              const SizedBox(width: 6),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                decoration: BoxDecoration(
                                                  color: statusColor.withOpacity(0.15),
                                                  borderRadius: BorderRadius.circular(4),
                                                  border: Border.all(color: statusColor.withOpacity(0.5)),
                                                ),
                                                child: Text(
                                                  status,
                                                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor),
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            '${n['nurse_id']} • ${n['department']} (${n['hospital_unit']})',
                                            style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const Divider(color: Colors.white10, height: 24),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(Icons.badge, size: 16, color: AppTheme.textMuted),
                                        const SizedBox(width: 6),
                                        Text(
                                          'Shift: ${n['shift'] ?? 'DAY'}',
                                          style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                                        ),
                                        const SizedBox(width: 12),
                                        const Icon(Icons.single_bed, size: 16, color: AppTheme.textMuted),
                                        const SizedBox(width: 6),
                                        Text(
                                          '${n['assigned_patients_count'] ?? 0} Patients',
                                          style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                                        ),
                                      ],
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.phone_forwarded, color: AppTheme.primaryTeal, size: 20),
                                      onPressed: () {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(content: Text('Calling ${n['name']}...')),
                                        );
                                      },
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
