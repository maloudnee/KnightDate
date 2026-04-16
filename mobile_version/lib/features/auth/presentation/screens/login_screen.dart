import 'dart:ui';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'main_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {

  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isSubmitting = false;

  static const gold = Color(0xFFD4AF38);

  Future<void> _login() async {
    if (_usernameController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter both username and password"))
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final url = Uri.parse("https://knightdate.xyz/api/auth/login");
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "username": _usernameController.text, 
          "password": _passwordController.text
        }),
      );

      if (response.statusCode == 200) {
        // parse response to get JWT 
        final Map<String, dynamic> responseData = jsonDecode(response.body);  
        final String token = responseData['token']; 
        final String userId = responseData['user']['_id'];
        final String username = responseData['user']['username'];

        // save tokens 
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('authToken', token);
        await prefs.setString('userId', userId);
        await prefs.setString('username', username);

        if (mounted) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (context) => const MainScreen())
          );
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Login successful!"))
          );
        }

      } else {
        // Handle login failure 
        final errorData = jsonDecode(response.body);
        print("Login failed: ${errorData['message']}");
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Invalid email or password"))
        );
      }
    } catch (e) {
      print("Debug: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Server unreachable. Check your connection."))
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
        actions: [
          IconButton(
            icon: Icon(
              Icons.close, 
              color: Theme.of(context).brightness == Brightness.dark 
              ? Colors.white 
              : Colors.black,
              size: 32,
            ),
            onPressed: () => Navigator.of(context, rootNavigator: true).pop(),
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

                    // Username Field
                    _buildTextField(
                      controller: _usernameController,
                      hint: "Username",
                      icon: Icons.person_outline,
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