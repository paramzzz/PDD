import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../../core/theme/app_theme.dart';
import '../../services/document_service.dart';

class DocumentUploadScreen extends StatefulWidget {
  final int patientId;
  const DocumentUploadScreen({super.key, required this.patientId});

  @override
  State<DocumentUploadScreen> createState() => _DocumentUploadScreenState();
}

class _DocumentUploadScreenState extends State<DocumentUploadScreen> {
  String _selectedDocType = 'Prescription';
  List<PlatformFile> _selectedFiles = [];
  bool _isUploading = false;

  void _pickFiles() async {
    final result = await FilePicker.platform.pickFiles(
      allowMultiple: true,
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
    );

    if (result != null) {
      setState(() {
        _selectedFiles = result.files;
      });
    }
  }

  void _uploadFiles() async {
    if (_selectedFiles.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one document to upload.')),
      );
      return;
    }

    setState(() => _isUploading = true);

    for (var file in _selectedFiles) {
      if (file.path != null) {
        await DocumentService.uploadDocument(
          patientId: widget.patientId,
          filePath: file.path!,
          documentType: _selectedDocType,
          uploadedByRole: 'DOCTOR',
          uploadedByName: 'Dr. Sarah Wilson',
        );
      }
    }

    if (mounted) {
      setState(() => _isUploading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Multi-Document Bundle Uploaded & Processed via OCR!')),
      );
      Navigator.pop(context, true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Upload Documents — Patient #${widget.patientId}'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            DropdownButtonFormField<String>(
              value: _selectedDocType,
              decoration: const InputDecoration(labelText: 'Document Type / Classification'),
              items: ['Prescription', 'Lab Report', 'Scan / X-Ray Report', 'Insurance Document', 'Payment Receipt']
                  .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                  .toList(),
              onChanged: (val) => setState(() => _selectedDocType = val!),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _pickFiles,
              icon: const Icon(Icons.attach_file_rounded),
              label: const Text('SELECT PDF / IMAGE FILES'),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF334155)),
            ),
            const SizedBox(height: 16),
            if (_selectedFiles.isNotEmpty) ...[
              const Text('Selected Files:', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 8),
              Expanded(
                child: ListView.builder(
                  itemCount: _selectedFiles.length,
                  itemBuilder: (context, idx) {
                    final f = _selectedFiles[idx];
                    return Card(
                      child: ListTile(
                        leading: const Icon(Icons.picture_as_pdf, color: AppTheme.alertRed),
                        title: Text(f.name, style: const TextStyle(fontSize: 13, color: Colors.white)),
                        subtitle: Text('${(f.size / 1024).toStringAsFixed(1)} KB'),
                        trailing: IconButton(
                          icon: const Icon(Icons.close, color: Colors.grey),
                          onPressed: () {
                            setState(() => _selectedFiles.removeAt(idx));
                          },
                        ),
                      ),
                    );
                  },
                ),
              ),
            ] else ...[
              const Expanded(
                child: Center(
                  child: Text('No files selected yet.', style: TextStyle(color: AppTheme.textMuted)),
                ),
              ),
            ],
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isUploading ? null : _uploadFiles,
              child: _isUploading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('UPLOAD & TRIGGER OCR ANALYSIS'),
            ),
          ],
        ),
      ),
    );
  }
}
