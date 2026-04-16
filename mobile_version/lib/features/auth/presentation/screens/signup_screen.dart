import 'package:flutter/material.dart';
import 'dart:io';
import 'dart:convert';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  File? _profileImage;
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage() async {
    final XFile? pickedFile = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (pickedFile != null) {
      setState(() {
        _profileImage = File(pickedFile.path);
      });
    }
  }

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
  bool _isSubmitting = false;

  final List<String> _genderOption = ['Male', 'Female', 'Non-binary', 'Transgender', 'Other'];
  final List<String> _orientationOption = ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Other'];

  static const gold = Color(0xFFD4AF38);

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
          style: TextStyle(
            color: isDark ? Colors.white : Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(
              Icons.close,
              color: 
              isDark 
              ? Colors.white 
              : Colors.black,
              size: 32,
            ),
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
                    child: _profileImage == null
                      ? Icon(Icons.camera_alt_outlined, size: 40, color: gold)
                      : null,
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
                ]
              )
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
          _buildDropdown(
            hint: "Gender",
            value: _selectedGender,
            items: _genderOption,
            onChanged: (value) {
              setState(() {
                _selectedGender = value;
              });
            },
          ),
          const SizedBox(height: 12),
          _buildDropdown(
            hint: "Orientation",
            value: _selectedOrientation,
            items: _orientationOption,
            onChanged: (value) {
              setState(() {
                _selectedOrientation = value;
              });
            },
          ),
          const SizedBox(height: 30),

          // Sign Up Button
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submit,
            style: ElevatedButton.styleFrom(
              backgroundColor: gold,
              foregroundColor: Colors.black,
              minimumSize: const Size(double.infinity, 55),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: _isSubmitting 
              ? const SizedBox(
                  width: 24, 
                  height: 24, 
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                )
              : const Text(
                  "Create Account",
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    bool obscureText = false,
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
  }) {
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
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  Widget _buildDropdown({
    required String? value,
    required List<String> items,
    required ValueChanged<String?> onChanged, 
    required String hint,
  }) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: isDark ? Colors.white10 : Colors.white70,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white54),
      ),
      child: DropdownButton<String>(
        value: value,
        isExpanded: true,
        underline: const SizedBox(),
        icon: Icon(Icons.arrow_drop_down, color: isDark ? Colors.white70 : Colors.black54),
        items: items.map((item) => DropdownMenuItem(value: item, child: Text(item))).toList(),
        onChanged: onChanged,
      ),
    );
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
        const SnackBar(content: Text("Please fill in all fields"))
      );
      return;
    }

    setState(() => _isSubmitting = true);
    
    var uri = Uri.parse('http://knightdate.xyz/api/auth/register');

    var request = http.MultipartRequest('POST', uri);

    request.fields['FirstName'] = _firstNameController.text;
    request.fields['LastName'] = _lastNameController.text;
    request.fields['Age'] = _ageController.text;
    request.fields['Major'] = _majorController.text;
    request.fields['Bio'] = _bioController.text;
    request.fields['Email'] = _emailController.text;
    request.fields['Username'] = _usernameController.text;
    request.fields['Password'] = _passwordController.text;
    request.fields['Gender'] = _selectedGender?.toLowerCase() ?? "";
    request.fields['Orientation'] = _selectedOrientation?.toLowerCase() ?? "";

    if (_profileImage != null) {
      request.files.add(await http.MultipartFile.fromPath('ProfilePicture', _profileImage!.path));
    }

    try {
      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Account created successfully! Please verify your email before logging in."))
          );
          Navigator.of(context).pop();
        }
      } else {
        // Handle error response
        final errorData = jsonDecode(response.body);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errorData['message'] ?? "Failed to create account. Please try again."))
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Server unreachable. Check your connection."))
      );
      print("Signup error: $e");
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);  
      }
    }
  }
}