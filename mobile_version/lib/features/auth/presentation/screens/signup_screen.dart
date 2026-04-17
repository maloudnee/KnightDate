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

  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _ageController = TextEditingController();
  final _majorController = TextEditingController();
  final _bioController = TextEditingController();

  String? _selectedGender;
  String? _selectedOrientation;

  final List<String> _genderOption = ['Man', 'Woman', 'Non-binary', 'Transgender', 'Other'];
  final List<String> _orientationOption = ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Other'];

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
    if (_firstNameController.text.isEmpty ||
        _lastNameController.text.isEmpty ||
        _ageController.text.isEmpty ||
        _majorController.text.isEmpty ||
        _bioController.text.isEmpty ||
        _emailController.text.isEmpty ||
        _usernameController.text.isEmpty ||
        _passwordController.text.isEmpty ||
        _selectedGender == null ||
        _selectedOrientation == null) {
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
            "firstName": _firstNameController.text.trim(),
            "lastName": _lastNameController.text.trim(),
            "age": int.tryParse(_ageController.text) ?? 18,
            "major": _majorController.text.trim(),
            "bio": _bioController.text.trim(),
            "gender": _selectedGender?.toLowerCase(),
            "sexualOrientation": _selectedOrientation?.toLowerCase(),
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
          Navigator.of(context).pop();
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
        title: Text(
          "Create Account",
          style: TextStyle(color: isDark ? Colors.white : Colors.black, fontSize: 20, fontWeight: FontWeight.w600),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.close, color: isDark ? Colors.white : Colors.black, size: 32),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        children: [
          Center(
            child: GestureDetector(
              onTap: _pickImage,
              child: Stack(
                children: [
                  CircleAvatar(
                    radius: 60,
                    backgroundColor: isDark ? Colors.white10 : Colors.white70,
                    backgroundImage: _profileImage != null ? FileImage(_profileImage!) : null,
                    child: _profileImage == null ? Icon(Icons.camera_alt_outlined, size: 40, color: gold) : null,
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(color: gold, shape: BoxShape.circle),
                      child: const Icon(Icons.edit, size: 16, color: Colors.black),
                    ),
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 30),
          _buildTextField(controller: _firstNameController, label: "First Name"),
          const SizedBox(height: 12),
          _buildTextField(controller: _lastNameController, label: "Last Name"),
          const SizedBox(height: 12),
          _buildTextField(controller: _ageController, label: "Age", keyboardType: TextInputType.number),
          const SizedBox(height: 12),
          _buildTextField(controller: _majorController, label: "Major"),
          const SizedBox(height: 12),
          _buildTextField(controller: _bioController, label: "Bio", maxLines: 3),
          const SizedBox(height: 12),
          _buildTextField(controller: _emailController, label: "Email", keyboardType: TextInputType.emailAddress),
          const SizedBox(height: 12),
          _buildTextField(controller: _usernameController, label: "Username"),
          const SizedBox(height: 12),
          _buildTextField(controller: _passwordController, label: "Password", obscureText: true),
          const SizedBox(height: 12),
          _buildDropdown(hint: "Gender", value: _selectedGender, items: _genderOption, onChanged: (v) => setState(() => _selectedGender = v)),
          const SizedBox(height: 12),
          _buildDropdown(hint: "Orientation", value: _selectedOrientation, items: _orientationOption, onChanged: (v) => setState(() => _selectedOrientation = v)),
          const SizedBox(height: 30),
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

  Widget _buildDropdown({required String? value, required List<String> items, required ValueChanged<String?> onChanged, required String hint}) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(color: isDark ? Colors.white10 : Colors.white70, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.white24)),
      child: DropdownButton<String>(
        value: value,
        hint: Text(hint, style: TextStyle(color: isDark ? Colors.white70 : Colors.black54)),
        isExpanded: true,
        underline: const SizedBox(),
        dropdownColor: isDark ? Colors.grey[900] : Colors.white,
        icon: Icon(Icons.arrow_drop_down, color: isDark ? Colors.white70 : Colors.black54),
        items: items.map((item) => DropdownMenuItem(value: item, child: Text(item, style: TextStyle(color: isDark ? Colors.white : Colors.black)))).toList(),
        onChanged: onChanged,
      ),
    );
  }
}