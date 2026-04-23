import 'package:flutter/material.dart';
import 'dart:io';
import 'dart:convert';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  File? _profileImage;
  final ImagePicker _picker = ImagePicker();
  bool _isSubmitting = false;

  final _emailController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();


  static const gold = Color(0xFFD4AF38);

  Future<void> _pickImage() async {
    final XFile? pickedFile = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (pickedFile != null) {
      setState(() {
        _profileImage = File(pickedFile.path);
      });
    }
  }

  Future<void> _submit() async {
    if (_emailController.text.isEmpty ||
        _usernameController.text.isEmpty ||
        _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please fill in all fields"), backgroundColor: Colors.redAccent)
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final authResponse = await http.post(
        Uri.parse('https://knightdate.xyz/api/auth/register'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "username": _usernameController.text.trim(),
          "password": _passwordController.text.trim(),
          "email": _emailController.text.trim().toLowerCase(),
        }),
      );

      if (authResponse.statusCode == 200 || authResponse.statusCode == 201) {
        
        await http.post(
          Uri.parse('https://knightdate.xyz/api/api/profile/register-profile'),
          headers: {"Content-Type": "application/json"},
          body: jsonEncode({
            "username": _usernameController.text.trim(),
          }),
        );

        if (_profileImage != null) {
          var request = http.MultipartRequest(
            'POST',
            Uri.parse('https://knightdate.xyz/api/api/profile/upload-picture'),
          );
          request.fields['username'] = _usernameController.text.trim();
          request.files.add(await http.MultipartFile.fromPath(
            'profilePicture',
            _profileImage!.path,
            contentType: MediaType('image', 'jpeg'),
          ));
          await request.send();
        }

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Account created! Verify your email to log in."), backgroundColor: Colors.green)
          );
          Navigator.of(context).popUntil((route) => route.isFirst);
        }
      } else {
        final errorData = jsonDecode(authResponse.body);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errorData['msg'] ?? "Signup failed"), backgroundColor: Colors.redAccent)
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Server error. Please try again later."))
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: false,
        leadingWidth: 120,
        leading: Padding(
          padding: const EdgeInsets.only(top: 9.0, left: 9.0),
          child: TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text(
              "Cancel",
              style: TextStyle(
                color: Color(0xFFD4AF37),
                fontWeight: FontWeight.bold,
                fontSize: 24, 
              ),
            ),
          ),
        ),
        actions: [],
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(top: 60, left: 24, right: 24),
          child: Column(
            children: [
              const Text(
                "Create Account",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 30),
              _buildTextField(controller: _emailController, label: "Email", keyboardType: TextInputType.emailAddress),
              const SizedBox(height: 12),
              _buildTextField(controller: _usernameController, label: "Username"),
              const SizedBox(height: 12),
              _buildTextField(controller: _passwordController, label: "Password", obscureText: true),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: gold,
                  foregroundColor: Colors.black,
                  minimumSize: const Size(double.infinity, 55),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: _isSubmitting 
                  ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                  : const Text("Create Account", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({required TextEditingController controller, required String label, bool obscureText = false, TextInputType keyboardType = TextInputType.text, int maxLines = 1}) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    return TextField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      maxLines: maxLines,
      style: TextStyle(color: isDark ? Colors.white : Colors.black),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: isDark ? Colors.white70 : Colors.black54),
        filled: true,
        fillColor: isDark ? Colors.white10 : Colors.white70,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
      ),
    );
  }
}