import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../services/notification_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _isLoading = true;
  List<dynamic> _notifications = [];

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    try {
      final list = await NotificationService.getNotifications();
      setState(() {
        _notifications = list;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  void _markAllRead() {
    setState(() {
      for (var n in _notifications) {
        n['is_read'] = 1;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('All notifications marked as read')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      appBar: AppBar(
        backgroundColor: AppTheme.cardDark,
        elevation: 0,
        title: const Text('Notifications & Alerts', style: TextStyle(color: AppTheme.textLight, fontSize: 18, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.textLight),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all, color: AppTheme.accentTeal),
            tooltip: 'Mark All Read',
            onPressed: _markAllRead,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.accentTeal))
          : _notifications.isEmpty
              ? const Center(child: Text('No active notifications', style: TextStyle(color: AppTheme.textMuted)))
              : RefreshIndicator(
                  onRefresh: _loadNotifications,
                  color: AppTheme.accentTeal,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _notifications.length,
                    itemBuilder: (context, index) {
                      final item = _notifications[index];
                      final bool isRead = item['is_read'] == 1;
                      final String prio = (item['priority'] ?? 'NORMAL').toString().toUpperCase();

                      Color prioColor = prio == 'STAT' || prio == 'CRITICAL'
                          ? AppTheme.alertRed
                          : prio == 'HIGH'
                              ? Colors.orange
                              : AppTheme.accentTeal;

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        color: AppTheme.cardDark,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                          side: BorderSide(
                            color: isRead ? Colors.white10 : prioColor.withValues(alpha: 0.5),
                            width: isRead ? 1 : 1.5,
                          ),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: prioColor.withValues(alpha: 0.15),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  prio == 'STAT' ? Icons.warning_amber_rounded : Icons.notifications_active,
                                  color: prioColor,
                                  size: 22,
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            item['title'] ?? '',
                                            style: TextStyle(
                                              fontSize: 14,
                                              fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                                              color: AppTheme.textLight,
                                            ),
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: prioColor.withValues(alpha: 0.2),
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                          child: Text(
                                            prio,
                                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: prioColor),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      item['message'] ?? '',
                                      style: const TextStyle(fontSize: 13, color: AppTheme.textMuted),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      item['created_at'] ?? '',
                                      style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
