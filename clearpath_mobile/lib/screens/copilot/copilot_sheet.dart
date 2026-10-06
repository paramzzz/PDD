import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../services/copilot_service.dart';

class CopilotSheet extends StatefulWidget {
  final int? patientId;
  const CopilotSheet({super.key, this.patientId});

  @override
  State<CopilotSheet> createState() => _CopilotSheetState();
}

class _CopilotSheetState extends State<CopilotSheet> {
  final _queryController = TextEditingController();
  final List<Map<String, String>> _messages = [
    {
      'sender': 'copilot',
      'text': 'Hello! I am ClearPath AI Copilot. How can I assist with clinical parameters or pre-op clearances today?'
    }
  ];
  bool _isAnalyzing = false;

  void _sendQuery() async {
    final text = _queryController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({'sender': 'user', 'text': text});
      _queryController.clear();
      _isAnalyzing = true;
    });

    try {
      final responseText = await CopilotService.askCopilot(query: text, patientId: widget.patientId);
      if (mounted) {
        setState(() {
          _messages.add({'sender': 'copilot', 'text': responseText});
          _isAnalyzing = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add({'sender': 'copilot', 'text': 'Error processing clinical query: $e'});
          _isAnalyzing = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Drag Handle
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[600],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 12),
          // Title
          Row(
            children: const [
              Icon(Icons.psychology_outlined, color: AppTheme.emeraldGreen),
              SizedBox(width: 8),
              Text(
                'ClearPath AI Copilot Assistant',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
              ),
            ],
          ),
          const Divider(color: Colors.grey),
          // Messages List
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (context, idx) {
                final msg = _messages[idx];
                final isUser = msg['sender'] == 'user';
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.all(12),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                    decoration: BoxDecoration(
                      color: isUser ? AppTheme.accentTeal : const Color(0xFF334155),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      msg['text'] ?? '',
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                    ),
                  ),
                );
              },
            ),
          ),
          if (_isAnalyzing)
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: Row(
                children: [
                  SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.emeraldGreen)),
                  SizedBox(width: 8),
                  Text('AI Copilot Analyzing Clinical Data...', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                ],
              ),
            ),
          // Input Box
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _queryController,
                  decoration: const InputDecoration(
                    hintText: 'Ask Copilot about risk, pre-op, lab values...',
                  ),
                  onSubmitted: (_) => _sendQuery(),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.send_rounded, color: AppTheme.accentTeal),
                onPressed: _sendQuery,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
