import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../models/patient_model.dart';
import '../../services/patient_service.dart';
import 'patient_detail_screen.dart';
import 'add_patient_screen.dart';

class PatientListScreen extends StatefulWidget {
  const PatientListScreen({super.key});

  @override
  State<PatientListScreen> createState() => _PatientListScreenState();
}

class _PatientListScreenState extends State<PatientListScreen> {
  List<PatientModel> _allPatients = [];
  List<PatientModel> _filteredPatients = [];
  bool _isLoading = true;
  final _searchController = TextEditingController();
  String _riskFilter = 'ALL';

  @override
  void initState() {
    super.initState();
    _loadPatients();
  }

  void _loadPatients() async {
    setState(() => _isLoading = true);
    final list = await PatientService.getPatients();
    if (mounted) {
      setState(() {
        _allPatients = list;
        _applyFilters();
        _isLoading = false;
      });
    }
  }

  void _applyFilters() {
    final query = _searchController.text.toLowerCase().trim();
    setState(() {
      _filteredPatients = _allPatients.where((p) {
        final matchesQuery = p.fullName.toLowerCase().contains(query) ||
            p.chiefComplaint.toLowerCase().contains(query) ||
            p.insuranceProvider.toLowerCase().contains(query);

        final matchesRisk = _riskFilter == 'ALL' ||
            (_riskFilter == 'STAT' && p.initialRisk.toUpperCase() == 'STAT') ||
            (_riskFilter == 'HIGH' && p.initialRisk.toUpperCase() == 'HIGH') ||
            (_riskFilter == 'NORMAL' && p.initialRisk.toUpperCase() != 'STAT' && p.initialRisk.toUpperCase() != 'HIGH');

        return matchesQuery && matchesRisk;
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ClearPath Patients & Case Queue'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add_rounded),
            onPressed: () async {
              final created = await Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const AddPatientScreen()),
              );
              if (created == true) _loadPatients();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  onChanged: (_) => _applyFilters(),
                  decoration: const InputDecoration(
                    hintText: 'Search patients, complaints, insurance...',
                    prefixIcon: Icon(Icons.search, color: AppTheme.accentTeal),
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _buildFilterChip('ALL', 'All Cases'),
                    const SizedBox(width: 8),
                    _buildFilterChip('STAT', 'Emergency STAT'),
                    const SizedBox(width: 8),
                    _buildFilterChip('HIGH', 'High Priority'),
                    const SizedBox(width: 8),
                    _buildFilterChip('NORMAL', 'Standard'),
                  ],
                ),
              ],
            ),
          ),
          // Patient Queue List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredPatients.isEmpty
                    ? const Center(child: Text('No matching patient records found.', style: TextStyle(color: AppTheme.textMuted)))
                    : ListView.builder(
                        itemCount: _filteredPatients.length,
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        itemBuilder: (context, idx) {
                          final patient = _filteredPatients[idx];
                          return Card(
                            margin: const EdgeInsets.symmetric(vertical: 6),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: patient.isCritical ? AppTheme.alertRed.withOpacity(0.2) : AppTheme.accentTeal.withOpacity(0.2),
                                child: Icon(
                                  patient.isCritical ? Icons.warning_amber_rounded : Icons.person,
                                  color: patient.isCritical ? AppTheme.alertRed : AppTheme.accentTeal,
                                ),
                              ),
                              title: Text(patient.fullName, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                              subtitle: Text(
                                '${patient.gender}, ${patient.age} yrs | ${patient.chiefComplaint}',
                                style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              trailing: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: patient.isCritical ? AppTheme.alertRed : AppTheme.emeraldGreen,
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Text(
                                      patient.initialRisk.toUpperCase(),
                                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text('ID: #${patient.id}', style: const TextStyle(color: Colors.grey, fontSize: 10)),
                                ],
                              ),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => PatientDetailScreen(patient: patient)),
                                );
                              },
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String val, String label) {
    final isSelected = _riskFilter == val;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 11, color: isSelected ? Colors.white : Colors.grey[400])),
      selected: isSelected,
      selectedColor: AppTheme.accentTeal,
      backgroundColor: const Color(0xFF334155),
      onSelected: (sel) {
        if (sel) {
          setState(() {
            _riskFilter = val;
            _applyFilters();
          });
        }
      },
    );
  }
}
