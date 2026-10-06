import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../models/document_model.dart';

class DocumentViewerScreen extends StatefulWidget {
  final DocumentModel document;
  const DocumentViewerScreen({super.key, required this.document});

  @override
  State<DocumentViewerScreen> createState() => _DocumentViewerScreenState();
}

class _DocumentViewerScreenState extends State<DocumentViewerScreen> {
  double _zoomScale = 1.0;
  int _rotation = 0;

  void _zoomIn() => setState(() => _zoomScale = (_zoomScale + 0.25).clamp(0.5, 3.0));
  void _zoomOut() => setState(() => _zoomScale = (_zoomScale - 0.25).clamp(0.5, 3.0));
  void _rotate() => setState(() => _rotation = (_rotation + 90) % 360);
  void _reset() => setState(() {
        _zoomScale = 1.0;
        _rotation = 0;
      });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.document.documentName),
        actions: [
          IconButton(icon: const Icon(Icons.zoom_in), onPressed: _zoomIn),
          IconButton(icon: const Icon(Icons.zoom_out), onPressed: _zoomOut),
          IconButton(icon: const Icon(Icons.rotate_right), onPressed: _rotate),
          IconButton(icon: const Icon(Icons.restart_alt), onPressed: _reset),
        ],
      ),
      body: Column(
        children: [
          // Document Info Header
          Container(
            color: const Color(0xFF1E293B),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Category: ${widget.document.documentCategory}', style: const TextStyle(color: Colors.white, fontSize: 12)),
                Text('OCR: ${widget.document.ocrStatus}', style: const TextStyle(color: AppTheme.emeraldGreen, fontWeight: FontWeight.bold, fontSize: 12)),
              ],
            ),
          ),
          // Document View Canvas
          Expanded(
            child: Center(
              child: Transform.rotate(
                angle: _rotation * (3.1415926535897932 / 180),
                child: Transform.scale(
                  scale: _zoomScale,
                  child: Container(
                    width: MediaQuery.of(context).size.width * 0.85,
                    height: MediaQuery.of(context).size.height * 0.6,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 8)],
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.picture_as_pdf_rounded, size: 64, color: AppTheme.primaryNavy),
                        const SizedBox(height: 16),
                        Text(
                          widget.document.documentName,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Verified Document preview rendering...\nPatient ID: #${widget.document.patientId}\nUploaded by: ${widget.document.uploadedByName}',
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.black54, fontSize: 12),
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppTheme.emeraldGreen.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            'CLASSIFICATION CONFIDENCE: ${(widget.document.classificationConfidence * 100).toStringAsFixed(0)}%',
                            style: const TextStyle(color: AppTheme.emeraldGreen, fontWeight: FontWeight.bold, fontSize: 11),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
          // Bottom Controls
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.download_rounded),
                    label: const Text('DOWNLOAD FILE'),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Downloading ${widget.document.documentName}...')),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
