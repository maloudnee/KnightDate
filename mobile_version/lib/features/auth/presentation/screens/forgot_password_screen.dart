import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const gold = Color(0xFFD4AF37);

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  bool _isLoading = false;
  bool _isSubmitted = false;

  Future<void> _submit() async {
    if (_emailController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter your email address"), backgroundColor: Colors.redAccent),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await http.post(
        Uri.parse('https://knightdate.xyz/api/auth/forgot-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': _emailController.text.trim().toLowerCase()}),
      );

      if (response.statusCode == 200) {
        setState(() => _isSubmitted = true);
      } else {
        final data = jsonDecode(response.body);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(data['msg'] ?? "Something went wrong."), backgroundColor: Colors.redAccent),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Server error. Please try again later.")),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.white : Colors.black;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: false,
        leadingWidth: 120,
        leading: TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text(
            "Cancel",
            style: TextStyle(color: gold, fontWeight: FontWeight.bold, fontSize: 16),
          ),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: _isSubmitted ? _buildSuccessState(textColor) : _buildForm(isDark, textColor),
        ),
      ),
    );
  }

  Widget _buildForm(bool isDark, Color textColor) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: gold.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.mail_outline, color: gold, size: 32),
        ),
        const SizedBox(height: 20),
        Text("Forgot Password?", style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: textColor)),
        const SizedBox(height: 10),
        Text(
          "Enter your email and we'll send you a link to reset your password.",
          textAlign: TextAlign.center,
          style: TextStyle(color: textColor.withOpacity(0.6), fontSize: 14),
        ),
        const SizedBox(height: 40),
        TextField(
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          style: TextStyle(color: textColor),
          decoration: InputDecoration(
            labelText: "Email",
            labelStyle: const TextStyle(color: gold),
            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: gold.withOpacity(0.3))),
            focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: gold)),
          ),
        ),
        const SizedBox(height: 40),
        ElevatedButton(
          onPressed: _isLoading ? null : _submit,
          style: ElevatedButton.styleFrom(
            backgroundColor: gold,
            foregroundColor: Colors.black,
            minimumSize: const Size(double.infinity, 55),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
          ),
          child: _isLoading
              ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
              : const Text("Send Reset Link", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  Widget _buildSuccessState(Color textColor) {
    return Column(
      children: [
        const Icon(Icons.check_circle_outline, color: gold, size: 80),
        const SizedBox(height: 20),
        Text("Email Sent!", style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: textColor)),
        const SizedBox(height: 10),
        Text(
          "If an account exists for ${_emailController.text}, you will receive a reset link shortly.",
          textAlign: TextAlign.center,
          style: TextStyle(color: textColor.withOpacity(0.6), fontSize: 14),
        ),
        const SizedBox(height: 40),
        ElevatedButton(
          onPressed: () => Navigator.of(context).pop(),
          style: ElevatedButton.styleFrom(
            backgroundColor: gold,
            foregroundColor: Colors.black,
            minimumSize: const Size(double.infinity, 55),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
          ),
          child: const Text("Back to Profile", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }
}