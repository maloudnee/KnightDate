import 'package:flutter/material.dart';
import 'login_screen.dart';
import 'signup_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color gold = Color(0xFFD4AF38);

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
          child: Column(
            children: [
              const SizedBox(height: 20),

              const Text(
                "KnightDate",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 42,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFFD4AF37),
                  letterSpacing: 1.5,
                ),
              ),

              const SizedBox(height: 12),

              Text(
                "Charge into love!",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white60 : Colors.black87,
                ),
              ),

              const Spacer(),

              _buildButton(
                context,
                text: "Login",
                color: gold,
                textColor: Colors.black,
              ),

              const SizedBox(height: 16),

              _buildButton(
                context,
                text: "Sign Up",
                color: gold,
                textColor: Colors.black,
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildButton(BuildContext context, { 
    required String text, 
    required Color color, 
    required Color textColor,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: ElevatedButton(
        onPressed: () {
          if (text == "Login") {
            showModalBottomSheet(
              context: context, 
              isScrollControlled: true,
              backgroundColor: Colors.transparent,
              builder: (context) => const LoginScreen(),
            );
          } else {
            showModalBottomSheet(
              context: context, 
              isScrollControlled: true,
              backgroundColor: Colors.transparent,
              builder: (context) => const SignupScreen(),
            );
          }
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          minimumSize: const Size(double.infinity, 55),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
          ),
          elevation: 5,
        ),
        child: Text(
          text,
          style: const TextStyle(
            color: Colors.black,
            fontSize: 18,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
      ),
    );
  }
}