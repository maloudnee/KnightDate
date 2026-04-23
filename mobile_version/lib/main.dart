import 'package:flutter/material.dart';
import 'package:mobile_version/features/auth/presentation/screens/welcome_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  static const Color gold = Color(0xFFFFD700);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'KnightDate',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.system,
      theme: ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: Colors.white, 
        colorScheme: ColorScheme.light(
          primary: gold, 
          secondary: Color(0xFFD4AF37),
          onPrimary: Colors.white,
        )
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: Colors.black, 
        colorScheme: ColorScheme.dark(
          primary: gold, 
          secondary: Color(0xFFD4AF37),
          onPrimary: Colors.black,
        )
      ),
      home: const WelcomeScreen(),
    );
  }
}