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
          onPrimary: Colors.white,
        )
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: Colors.black, 
        colorScheme: ColorScheme.dark(
          primary: gold, 
          onPrimary: Colors.black,
        )
      ),
      home: const WelcomeScreen(),
    );
  }
}