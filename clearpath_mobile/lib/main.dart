import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/utils/session_manager.dart';
import 'screens/auth/login_screen.dart';
import 'screens/main_navigation_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final isLoggedIn = await SessionManager.isLoggedIn();

  runApp(ClearPathMobileApp(isLoggedIn: isLoggedIn));
}

class ClearPathMobileApp extends StatelessWidget {
  final bool isLoggedIn;
  const ClearPathMobileApp({super.key, required this.isLoggedIn});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ClearPath Mobile — Clinical Intelligence & Treatment Approval',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: isLoggedIn ? const MainNavigationScreen() : const LoginScreen(),
    );
  }
}
