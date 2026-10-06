import 'package:flutter/material.dart';
import '../../core/config/api_config.dart';
import '../../core/theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../main_navigation_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController(text: 'doctor@clearpath.ai');
  final _passwordController = TextEditingController(text: 'doctor123');
  final _customUrlController = TextEditingController();
  
  String _selectedRole = 'DOCTOR';
  bool _isLoading = false;
  Map<String, dynamic>? _connectionStatus;

  @override
  void initState() {
    super.initState();
    _checkServerConnection();
  }

  void _checkServerConnection() async {
    final status = await ApiConfig.checkBackendHealth();
    if (mounted) {
      setState(() {
        _connectionStatus = status;
      });
    }
  }

  void _showIpDialog() {
    _customUrlController.text = ApiConfig.baseUrl;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Server Connection Settings'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Specify backend URL for Android Emulator (http://10.0.2.2:8000), Physical Phone (http://192.168.x.x:8000), or Web (http://127.0.0.1:8000):',
              style: TextStyle(fontSize: 12),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _customUrlController,
              decoration: const InputDecoration(labelText: 'Backend Base URL'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              ApiConfig.customOverrideUrl = _customUrlController.text.trim();
              Navigator.pop(ctx);
              _checkServerConnection();
            },
            child: const Text('Save & Reconnect'),
          ),
        ],
      ),
    );
  }

  void _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    try {
      final success = await AuthService.login(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
        role: _selectedRole,
      );

      if (mounted) {
        setState(() => _isLoading = false);
        if (success) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Invalid login credentials')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Login Failure: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Brand Icon & Title
                    const Icon(
                      Icons.local_hospital_rounded,
                      size: 64,
                      color: AppTheme.emeraldGreen,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'CLEAR PATH',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontSize: 28,
                            letterSpacing: 2,
                            color: Colors.white,
                          ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Clinical Intelligence & Automated Approval',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey[400], fontSize: 13),
                    ),
                    const SizedBox(height: 16),

                    // Connection Diagnostic Bar
                    GestureDetector(
                      onTap: _showIpDialog,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: _connectionStatus == null
                              ? const Color(0xFF334155)
                              : (_connectionStatus!['online'] == true
                                  ? AppTheme.emeraldGreen.withValues(alpha: 0.2)
                                  : AppTheme.alertRed.withValues(alpha: 0.2)),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: _connectionStatus == null
                                ? Colors.grey
                                : (_connectionStatus!['online'] == true ? AppTheme.emeraldGreen : AppTheme.alertRed),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                _connectionStatus == null
                                    ? 'Checking Backend Connectivity...'
                                    : '${_connectionStatus!['message']}',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: _connectionStatus == null
                                      ? Colors.white
                                      : (_connectionStatus!['online'] == true ? AppTheme.emeraldGreen : Colors.redAccent),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const Icon(Icons.settings, size: 16, color: Colors.white70),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Role Selector Toggle
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF334155),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      padding: const EdgeInsets.all(4),
                      child: Row(
                        children: [
                          Expanded(
                            child: GestureDetector(
                              onTap: () {
                                setState(() {
                                  _selectedRole = 'DOCTOR';
                                  _emailController.text = 'doctor@clearpath.ai';
                                  _passwordController.text = 'doctor123';
                                });
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                decoration: BoxDecoration(
                                  color: _selectedRole == 'DOCTOR' ? AppTheme.accentTeal : Colors.transparent,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  'Doctor Portal',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: _selectedRole == 'DOCTOR' ? Colors.white : Colors.grey[300],
                                  ),
                                ),
                              ),
                            ),
                          ),
                          Expanded(
                            child: GestureDetector(
                              onTap: () {
                                setState(() {
                                  _selectedRole = 'NURSE';
                                  _emailController.text = 'priya@clearpath.ai';
                                  _passwordController.text = 'nurse123';
                                });
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                decoration: BoxDecoration(
                                  color: _selectedRole == 'NURSE' ? AppTheme.accentTeal : Colors.transparent,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  'Nurse Portal',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: _selectedRole == 'NURSE' ? Colors.white : Colors.grey[300],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Email Input Field
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(
                        labelText: 'Email Address',
                        prefixIcon: Icon(Icons.email_outlined, color: AppTheme.accentTeal),
                      ),
                      validator: (val) => val == null || val.isEmpty ? 'Email is required' : null,
                    ),
                    const SizedBox(height: 16),

                    // Password Input Field
                    TextFormField(
                      controller: _passwordController,
                      obscureText: true,
                      decoration: const InputDecoration(
                        labelText: 'Password',
                        prefixIcon: Icon(Icons.lock_outline, color: AppTheme.accentTeal),
                      ),
                      validator: (val) => val == null || val.isEmpty ? 'Password is required' : null,
                    ),
                    const SizedBox(height: 24),

                    // Login Button
                    SizedBox(
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _handleLogin,
                        child: _isLoading
                            ? const SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                              )
                            : Text('LOGIN TO ${_selectedRole == 'DOCTOR' ? 'DOCTOR' : 'NURSE'} PORTAL'),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Security Badge
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.shield_outlined, size: 16, color: AppTheme.emeraldGreen),
                        SizedBox(width: 6),
                        Text(
                          'HIPAA & ISO 27001 Clinical Encryption',
                          style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
