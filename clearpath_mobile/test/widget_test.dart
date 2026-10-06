import 'package:flutter_test/flutter_test.dart';
import 'package:clearpath_mobile/main.dart';

void main() {
  testWidgets('ClearPath Mobile App load test', (WidgetTester tester) async {
    await tester.pumpWidget(const ClearPathMobileApp(isLoggedIn: false));
    expect(find.text('CLEAR PATH'), findsOneWidget);
  });
}
