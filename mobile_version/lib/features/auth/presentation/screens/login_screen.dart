import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'main_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {

  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isSubmitting = false;

  static const gold = Color(0xFFD4AF38);

  Future<void> _login() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter both email and password"))
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final url = Uri.parse("https://your-backend-api.com/login");
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: '{"email": "${_emailController.text}", "password": "${_passwordController.text}"}',
      );

      if (response.statusCode == 200) {
        // Handle successful login (e.g., navigate to home screen, save token)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Login successful!"))
        );
        Navigator.of(context).pop();
        Navigator.pushAndRemoveUntil(
          context, 
          MaterialPageRoute(builder: (_) => const MainScreen()), 
          (route) => false
        );
      } else {
        // Handle login failure (e.g., show error message)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Invalid email or password"))
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("An error occurred. Please try again."))
      );
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override 
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: Icon(
              Icons.close, 
              color: Theme.of(context).brightness == Brightness.dark 
              ? Colors.white 
              : Colors.black
            ),
            onPressed: () => Navigator.of(context).pop(),
          )
        ],
      ),
      body: Center(
        child: SingleChildScrollView(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white10 : Colors.white70,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white54),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      "Welcome Back!",
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Email Field
                    _buildTextField(
                      controller: _emailController,
                      hint: "Email",
                      icon: Icons.email_outlined,
                      isSecure: false,
                      isDark: isDark,
                    ),

                    const SizedBox(height: 16),

                    // Password Field
                    _buildTextField(
                      controller: _passwordController,
                      hint: "Password",
                      icon: Icons.lock_outline,
                      isSecure: true,
                      isDark: isDark,
                    ),

                    const SizedBox(height: 24), 

                    // Login Button
                    SizedBox(
                      width: double.infinity, 
                      height: 55, 
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _login, 
                        style: ElevatedButton.styleFrom(
                          backgroundColor: gold, 
                          foregroundColor: Colors.black, 
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                          elevation: 5,
                        ),
                        child: _isSubmitting 
                          ? const SizedBox(
                              width: 24, 
                              height: 24, 
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black)
                            )
                          : const Text("Login", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ),
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

Widget _buildTextField({
  required TextEditingController controller,
  required String hint,
  required IconData icon,
  required bool isSecure,
  required bool isDark,
}) {
  return TextField(
    controller: controller,
    obscureText: isSecure,
    style: TextStyle(color: isDark ? Colors.white : Colors.black87),
    decoration: InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: isDark ? Colors.white60 : Colors.black54),
      filled: true,
      fillColor: isDark ? Colors.white12 : Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(30),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.all(16),
    ),
  );
}