import 'package:flutter/material.dart';
import '../../services/patient_service.dart';

class AddPatientScreen extends StatefulWidget {
  const AddPatientScreen({super.key});

  @override
  State<AddPatientScreen> createState() => _AddPatientScreenState();
}

class _AddPatientScreenState extends State<AddPatientScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController(text: 'Selenium Test Patient');
  final _ageController = TextEditingController(text: '45');
  final _complaintController = TextEditingController(text: 'Chest pain & shortness of breath');
  final _bpController = TextEditingController(text: '140/90');
  final _hrController = TextEditingController(text: '88');
  final _spo2Controller = TextEditingController(text: '96%');
  final _insuranceController = TextEditingController(text: 'Star Health Insurance');
  final _policyController = TextEditingController(text: 'POL-771920');

  String _gender = 'Male';
  String _initialRisk = 'High';
  bool _isSaving = false;

  void _submitPatient() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    final success = await PatientService.createPatient({
      'full_name': _nameController.text.trim(),
      'age': _ageController.text.trim(),
      'gender': _gender,
      'chief_complaint': _complaintController.text.trim(),
      'initial_risk': _initialRisk,
      'bp': _bpController.text.trim(),
      'hr': _hrController.text.trim(),
      'spo2': _spo2Controller.text.trim(),
      'insurance_provider': _insuranceController.text.trim(),
      'policy_number': _policyController.text.trim(),
    });

    if (mounted) {
      setState(() => _isSaving = false);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Synthetic Patient Case Created Successfully!')),
        );
        Navigator.pop(context, true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Synthetic Patient Record'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Full Patient Name'),
                validator: (val) => val == null || val.isEmpty ? 'Name required' : null,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _ageController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Age'),
                      validator: (val) => val == null || val.isEmpty ? 'Age required' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _gender,
                      decoration: const InputDecoration(labelText: 'Gender'),
                      items: ['Male', 'Female', 'Other']
                          .map((g) => DropdownMenuItem(value: g, child: Text(g)))
                          .toList(),
                      onChanged: (val) => setState(() => _gender = val!),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _complaintController,
                decoration: const InputDecoration(labelText: 'Chief Complaint & Symptoms'),
                validator: (val) => val == null || val.isEmpty ? 'Complaint required' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _initialRisk,
                decoration: const InputDecoration(labelText: 'Initial Triage Risk'),
                items: ['STAT', 'High', 'Medium', 'Low']
                    .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                    .toList(),
                onChanged: (val) => setState(() => _initialRisk = val!),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _bpController,
                      decoration: const InputDecoration(labelText: 'Blood Pressure'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _hrController,
                      decoration: const InputDecoration(labelText: 'Heart Rate (bpm)'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _insuranceController,
                decoration: const InputDecoration(labelText: 'Insurance Provider'),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _policyController,
                decoration: const InputDecoration(labelText: 'Policy Number'),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isSaving ? null : _submitPatient,
                child: _isSaving
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('CREATE PATIENT CASE'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
