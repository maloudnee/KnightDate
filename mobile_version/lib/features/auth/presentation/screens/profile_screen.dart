import 'package:flutter/material.dart';
import 'welcome_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:http_parser/http_parser.dart';
import 'public_profile_screen.dart';
import 'forgot_password_screen.dart';

Map<String, dynamic>? _profileCache;
const gold = Color(0xFFD4AF37);
String _currentImageUrl = "";
File? _globalProfileImage;

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoading = true;

  final _bioController = TextEditingController();
  final _majorController = TextEditingController();
  final _ageController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _minAgeController = TextEditingController();
  final _maxAgeController = TextEditingController();
  final _interestsController = TextEditingController();

  final List<String> _genders = ["male", "female", "non-binary", "transgender", "other"];
  final List<String> _orientations = ["straight", "gay", "lesbian", "bisexual", "pansexual", "other"];
  final List<String> _interestedInOptions = ["male", "female", "transgender", "other"];

  String? _selectedGender;
  String? _selectedOrientation;
  List<String> _selectedInterestedIn = [];

  @override
  void initState() {
    super.initState();
    if (_profileCache != null) {
      _applyDataToUI(_profileCache!);
      _isLoading = false;
      _loadProfile();
    } else {
      _loadProfile();
    }
  }

  void _applyDataToUI(Map<String, dynamic> data) {
    _firstNameController.text = data['FirstName'] ?? '';
    _lastNameController.text = data['LastName'] ?? '';
    _ageController.text = (data['Age'] ?? '').toString();
    _majorController.text = data['Major'] ?? '';
    _usernameController.text = data['username'] ?? '';
    _bioController.text = data['Bio'] ?? '';

    String? rawGender = data['Gender']?.toString().toLowerCase();
    if (rawGender != null && _genders.contains(rawGender)) {
      _selectedGender = rawGender;
    }

    _selectedOrientation = data['SexualOrientation']?.toString().toLowerCase();
    _minAgeController.text = (data['MinDatingAge'] ?? '18').toString();
    _maxAgeController.text = (data['MaxDatingAge'] ?? '99').toString();

    List<dynamic> interests = data['Interests'] ?? [];
    _interestsController.text = interests.join(", ");
    _selectedInterestedIn = List<String>.from(data['InterestedIn'] ?? []);
  }

  Future<void> _loadProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('authToken');
      final String? username = prefs.getString('username');

      final response = await http.get(
        Uri.parse('https://knightdate.xyz/api/api/profile/$username'),
        headers: {"Authorization": "Bearer $token"},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _profileCache = data;
          _applyDataToUI(data);
          _isLoading = false;

          String rawPath = data['ProfilePicture'] ?? "";
          String cleanPath = rawPath.replaceAll('/api/api', '');
          if (!cleanPath.startsWith('/') && cleanPath.isNotEmpty) cleanPath = '/$cleanPath';
          _currentImageUrl = (cleanPath.isNotEmpty && cleanPath != "/default.png")
              ? "https://knightdate.xyz/api$cleanPath?v=${DateTime.now().millisecondsSinceEpoch}"
              : "";
        });
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _updateProfile() async {
    final prefs = await SharedPreferences.getInstance();
    final String? token = prefs.getString('authToken');
    await http.post(
      Uri.parse('https://knightdate.xyz/api/api/profile/register-profile'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
      body: jsonEncode({
        'firstName': _firstNameController.text.trim(),
        'lastName': _lastNameController.text.trim(),
        'age': int.tryParse(_ageController.text) ?? 18,
        'major': _majorController.text.trim(),
        'bio': _bioController.text.trim(),
        'sexualOrientation': _selectedOrientation,
        'gender': _selectedGender,
      }),
    );
    _loadProfile();
  }

  Future<void> _updatePreferences() async {
    final prefs = await SharedPreferences.getInstance();
    final String? token = prefs.getString('authToken');
    List<String> interestsList = _interestsController.text
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .where((s) => s.isNotEmpty)
        .toList();

    await http.post(
      Uri.parse('https://knightdate.xyz/api/api/profile/update-preferences'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
      body: jsonEncode({
        'minAge': int.tryParse(_minAgeController.text) ?? 18,
        'maxAge': int.tryParse(_maxAgeController.text) ?? 99,
        'interestedIn': _selectedInterestedIn,
        'interests': interestsList,
      }),
    );
    _loadProfile();
  }

  Future<void> _uploadPic() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery, imageQuality: 50);
    if (image == null) return;

    setState(() {
      _globalProfileImage = File(image.path);
      _isLoading = true;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('authToken');
      final String? username = prefs.getString('username');

      var request = http.MultipartRequest(
        'POST',
        Uri.parse('https://knightdate.xyz/api/api/profile/upload-picture'),
      );
      request.headers['Authorization'] = 'Bearer $token';
      request.fields['username'] = username ?? '';
      request.files.add(await http.MultipartFile.fromPath(
        'profilePicture',
        image.path,
        contentType: MediaType('image', 'jpeg'),
      ));

      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        PaintingBinding.instance.imageCache.clear();
        PaintingBinding.instance.imageCache.clearLiveImages();
        _profileCache = null;
        await _loadProfile();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Profile picture updated!"), backgroundColor: Colors.green),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Upload failed. Please try again."), backgroundColor: Colors.redAccent),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Error uploading image.")),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.white : Colors.black;

    if (_isLoading && _profileCache == null) {
      return Scaffold(
        backgroundColor: isDark ? Colors.black : Colors.white,
        body: const Center(child: CircularProgressIndicator(color: gold)),
      );
    }

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      body: RefreshIndicator(
        onRefresh: _loadProfile,
        color: gold,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            children: [
              const SizedBox(height: 60),
              Center(
                child: Stack(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(color: gold, shape: BoxShape.circle),
                      child: CircleAvatar(
                        radius: 70,
                        backgroundColor: isDark ? Colors.grey[900] : Colors.grey[200],
                        backgroundImage: _globalProfileImage != null
                            ? FileImage(_globalProfileImage!) as ImageProvider
                            : (_currentImageUrl.isNotEmpty ? NetworkImage(_currentImageUrl) : null),
                        child: (_globalProfileImage == null && _currentImageUrl.isEmpty)
                            ? Icon(Icons.person, size: 80, color: isDark ? gold : Colors.grey[600])
                            : null,
                      ),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: _uploadPic,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: const BoxDecoration(color: gold, shape: BoxShape.circle),
                          child: const Icon(Icons.edit, color: Colors.black, size: 20),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 15),
              Text(
                "${_profileCache?['FirstName'] ?? "N/A"}, ${_profileCache?['Age'] ?? '18'}",
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: textColor),
              ),
              Text(
                _profileCache?['Major'] ?? "N/A",
                style: TextStyle(color: isDark ? Colors.white70 : Colors.black87, fontSize: 16),
              ),
              const SizedBox(height: 30),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Expanded(child: _buildActionButton("Edit Profile", Icons.edit_note, isDark, () => _editProfileDialog(context))),
                    const SizedBox(width: 15),
                    Expanded(child: _buildActionButton("View Public", Icons.remove_red_eye, isDark, () {
                      if (_profileCache != null) {
                        Navigator.push(context, MaterialPageRoute(builder: (context) => PublicProfileScreen(userData: _profileCache!)));
                      }
                    })),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              _buildSettingTile("Preferences", Icons.tune_outlined, isDark, textColor, onTap: () => _showPreferencesDialog(context)),
              _buildSettingTile("Security", Icons.lock_outline, isDark, textColor, onTap: () => _showSecurityDialog(context)),
              const Divider(color: Colors.white10, indent: 20, endIndent: 20, height: 40),
              ListTile(
                onTap: () => _handleLogout(context),
                leading: const Icon(Icons.logout, color: Colors.redAccent),
                title: const Text("Logout", style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
                trailing: Icon(Icons.chevron_right, color: textColor.withOpacity(0.3)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton(String label, IconData icon, bool isDark, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 15),
        decoration: BoxDecoration(
          color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100],
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: gold.withOpacity(0.3)),
        ),
        child: Column(children: [
          Icon(icon, color: gold),
          const SizedBox(height: 5),
          Text(label, style: TextStyle(fontWeight: FontWeight.w500, color: isDark ? Colors.white : Colors.black)),
        ]),
      ),
    );
  }

  Widget _buildSettingTile(String title, IconData icon, bool isDark, Color textColor, {VoidCallback? onTap}) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: isDark ? Colors.white70 : Colors.black87),
      title: Text(title, style: TextStyle(color: textColor)),
      trailing: Icon(Icons.chevron_right, color: textColor.withOpacity(0.3)),
    );
  }

  void _handleLogout(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    _profileCache = null;
    _globalProfileImage = null;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const WelcomeScreen()),
      (route) => false,
    );
  }

  void _editProfileDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        title: const Text("Edit Profile", style: TextStyle(color: gold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildPopupField("First Name", _firstNameController),
              _buildPopupField("Last Name", _lastNameController),
              _buildPopupField("Age", _ageController, isNumber: true),
              _buildPopupField("Major", _majorController),
              _buildPopupField("Bio", _bioController, maxLines: 3),
              DropdownButtonFormField<String>(
                value: _selectedGender,
                dropdownColor: Colors.grey[850],
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: "Gender", labelStyle: TextStyle(color: gold)),
                items: _genders.map((g) => DropdownMenuItem(value: g, child: Text(g[0].toUpperCase() + g.substring(1)))).toList(),
                onChanged: (val) => setState(() => _selectedGender = val),
              ),
              DropdownButtonFormField<String>(
                value: _selectedOrientation,
                dropdownColor: Colors.grey[850],
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: "Orientation", labelStyle: TextStyle(color: gold)),
                items: _orientations.map((o) => DropdownMenuItem(value: o, child: Text(o[0].toUpperCase() + o.substring(1)))).toList(),
                onChanged: (val) => setState(() => _selectedOrientation = val),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("CANCEL", style: TextStyle(color: Colors.redAccent))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: gold),
            onPressed: () { _updateProfile(); Navigator.pop(context); },
            child: const Text("SAVE", style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }

  void _showPreferencesDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: Colors.grey[900],
          title: const Text("Dating Preferences", style: TextStyle(color: gold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(children: [
                  Expanded(child: _buildPopupField("Min Age", _minAgeController, isNumber: true)),
                  const SizedBox(width: 10),
                  Expanded(child: _buildPopupField("Max Age", _maxAgeController, isNumber: true)),
                ]),
                const Text("Show Me:", style: TextStyle(color: gold)),
                ..._interestedInOptions.map((opt) => CheckboxListTile(
                  title: Text(opt[0].toUpperCase() + opt.substring(1), style: const TextStyle(color: Colors.white)),
                  value: _selectedInterestedIn.contains(opt),
                  activeColor: gold,
                  onChanged: (checked) => setDialogState(() {
                    if (checked!) _selectedInterestedIn.add(opt);
                    else _selectedInterestedIn.remove(opt);
                  }),
                )).toList(),
                _buildPopupField("Interests (comma separated)", _interestsController, maxLines: 2),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text("CANCEL", style: TextStyle(color: Colors.redAccent))),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: gold),
              onPressed: () { _updatePreferences(); Navigator.pop(context); },
              child: const Text("SAVE", style: TextStyle(color: Colors.black)),
            ),
          ],
        ),
      ),
    );
  }

  void _showSecurityDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        title: const Text("Security Settings", style: TextStyle(color: gold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.lock_reset, color: Colors.white),
              title: const Text("Reset Password", style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => ForgotPasswordScreen()),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPopupField(String label, TextEditingController controller, {bool isNumber = false, int maxLines = 1}) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: isNumber ? TextInputType.number : TextInputType.text,
      style: const TextStyle(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: gold),
        enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: gold.withOpacity(0.3))),
        focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: gold)),
      ),
    );
  }
}