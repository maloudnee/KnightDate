import 'package:flutter/material.dart';
import 'welcome_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:http_parser/http_parser.dart';
import 'public_profile_screen.dart';

Map<String, dynamic>? _profileCache;

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoading = true;
  static const gold = Color(0xFFD4AF37);

  final _bioController = TextEditingController();
  final _majorController = TextEditingController();
  final _ageController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _minAgeController = TextEditingController();
  final _maxAgeController = TextEditingController();
  final _interestsController = TextEditingController();

  final List<String> _genders = ["Man", "Woman", "Non-binary", "Transgender", "Other"];
  final List<String> _orientations = ["Straight", "Gay", "Lesbian", "Bisexual", "Pansexual", "Other"];
  final List<String> _interestedInOptions = ["Man", "Woman", "Transgender", "Anybody", "Other"];

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
    
    String? rawGender = data['Gender'];
    if (rawGender != null && rawGender.isNotEmpty) {
      String capitalized = rawGender[0].toUpperCase() + rawGender.substring(1);
      _selectedGender = _genders.contains(capitalized) ? capitalized : null;
    }

    _selectedOrientation = data['SexualOrientation'];
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
    List<String> interestsList = _interestsController.text.split(',').map((s) => s.trim().toLowerCase()).where((s) => s.isNotEmpty).toList();

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
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    if (image == null) return;
    setState(() => _isLoading = true);
    final prefs = await SharedPreferences.getInstance();
    final String? token = prefs.getString('authToken');
    var request = http.MultipartRequest('POST', Uri.parse('https://knightdate.xyz/api/api/profile/upload-picture'));
    request.headers['Authorization'] = 'Bearer $token';
    request.fields['username'] = prefs.getString('username') ?? '';
    request.files.add(await http.MultipartFile.fromPath('profilePicture', image.path, contentType: MediaType('image', 'jpeg')));
    await request.send();
    _loadProfile();
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.white : Colors.black;

    if (_isLoading && _profileCache == null) {
      return Scaffold(backgroundColor: isDark ? Colors.black : Colors.white, body: const Center(child: CircularProgressIndicator(color: gold)));
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
                        backgroundColor: Colors.black,
                        backgroundImage: _profileCache?['ProfilePicture'] != null && _profileCache?['ProfilePicture'] != "/default.png"
                            ? NetworkImage("https://knightdate.xyz${_profileCache!['ProfilePicture']}")
                            : const NetworkImage("https://via.placeholder.com/150"),
                      ),
                    ),
                    Positioned(bottom: 0, right: 0, child: GestureDetector(onTap: _uploadPic, child: Container(padding: const EdgeInsets.all(8), decoration: const BoxDecoration(color: gold, shape: BoxShape.circle), child: const Icon(Icons.edit, color: Colors.black, size: 20)))),
                  ],
                ),
              ),
              const SizedBox(height: 15),
              Text("${_profileCache?['FirstName'] ?? "N/A"}, ${_profileCache?['Age'] ?? '18'}", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: textColor)),
              Text(_profileCache?['Major'] ?? "N/A", style: TextStyle(color: isDark ? Colors.white70 : Colors.black87, fontSize: 16)),
              const SizedBox(height: 30),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Expanded(child: _buildActionButton("Edit Profile", Icons.edit_note, isDark, () => _editProfileDialog(context))),
                    const SizedBox(width: 15),
                    Expanded(child: _buildActionButton("View Public", 
                    Icons.remove_red_eye, 
                    isDark, 
                    () { 
                        if (_profileCache != null) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => PublicProfileScreen(userData: _profileCache!),
                          ),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("Profile data not loaded yet")),
                        );
                      }
                    },
                    ),),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              _buildSettingTile("Preferences", Icons.tune_outlined, isDark, onTap: () => _showPreferencesDialog(context)),
              _buildSettingTile("Security", Icons.lock_outline, isDark, onTap: () => _showSecurityDialog(context)),
              const Divider(color: Colors.white10, indent: 20, endIndent: 20, height: 40),
              ListTile(onTap: () => _handleLogout(context), leading: const Icon(Icons.logout, color: Colors.redAccent), title: const Text("Logout", style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)), trailing: const Icon(Icons.chevron_right, color: Colors.white24)),
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
        decoration: BoxDecoration(color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey[100], borderRadius: BorderRadius.circular(15), border: Border.all(color: gold.withOpacity(0.3))),
        child: Column(children: [Icon(icon, color: gold), const SizedBox(height: 5), Text(label, style: TextStyle(fontWeight: FontWeight.w500, color: isDark ? Colors.white : Colors.black))]),
      ),
    );
  }

  Widget _buildSettingTile(String title, IconData icon, bool isDark, {VoidCallback? onTap}) {
    return ListTile(onTap: onTap, leading: Icon(icon, color: isDark ? Colors.white70 : Colors.black87), title: Text(title, style: TextStyle(color: isDark ? Colors.white : Colors.black)), trailing: const Icon(Icons.chevron_right, color: Colors.white24));
  }

  void _handleLogout(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    _profileCache = null;
    Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(builder: (context) => const WelcomeScreen()), (route) => false);
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
              DropdownButtonFormField<String>(value: _selectedGender, dropdownColor: Colors.grey[850], style: const TextStyle(color: Colors.white), decoration: const InputDecoration(labelText: "Gender", labelStyle: TextStyle(color: gold)), items: _genders.map((g) => DropdownMenuItem(value: g, child: Text(g))).toList(), onChanged: (val) => setState(() => _selectedGender = val)),
              DropdownButtonFormField<String>(value: _selectedOrientation, dropdownColor: Colors.grey[850], style: const TextStyle(color: Colors.white), decoration: const InputDecoration(labelText: "Orientation", labelStyle: TextStyle(color: gold)), items: _orientations.map((o) => DropdownMenuItem(value: o, child: Text(o))).toList(), onChanged: (val) => setState(() => _selectedOrientation = val)),
            ],
          ),
        ),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")), ElevatedButton(style: ElevatedButton.styleFrom(backgroundColor: gold), onPressed: () { _updateProfile(); Navigator.pop(context); }, child: const Text("Save", style: TextStyle(color: Colors.black)))],
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
                Row(children: [Expanded(child: _buildPopupField("Min Age", _minAgeController, isNumber: true)), const SizedBox(width: 10), Expanded(child: _buildPopupField("Max Age", _maxAgeController, isNumber: true))]),
                const Text("Show Me:", style: TextStyle(color: gold)),
                ..._interestedInOptions.map((opt) => CheckboxListTile(title: Text(opt, style: const TextStyle(color: Colors.white)), value: _selectedInterestedIn.contains(opt.toLowerCase()), activeColor: gold, onChanged: (checked) => setDialogState(() { if(checked!) _selectedInterestedIn.add(opt.toLowerCase()); else _selectedInterestedIn.remove(opt.toLowerCase()); }))).toList(),
                _buildPopupField("Interests (comma separated)", _interestsController, maxLines: 2),
              ],
            ),
          ),
          actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")), ElevatedButton(style: ElevatedButton.styleFrom(backgroundColor: gold), onPressed: () { _updatePreferences(); Navigator.pop(context); }, child: const Text("Save", style: TextStyle(color: Colors.black)))],
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
            ListTile(leading: const Icon(Icons.lock_reset, color: Colors.white), title: const Text("Reset Password", style: TextStyle(color: Colors.white)), onTap: () { Navigator.pop(context); ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Reset email sent!"))); }),
            ListTile(leading: const Icon(Icons.delete_forever, color: Colors.redAccent), title: const Text("Delete Account", style: TextStyle(color: Colors.redAccent)), onTap: () => Navigator.pop(context)),
          ],
        ),
      ),
    );
  }

  Widget _buildPopupField(String label, TextEditingController controller, {bool isNumber = false, int maxLines = 1}) {
    return TextField(controller: controller, maxLines: maxLines, keyboardType: isNumber ? TextInputType.number : TextInputType.text, style: const TextStyle(color: Colors.white, fontSize: 14), decoration: InputDecoration(labelText: label, labelStyle: const TextStyle(color: gold), enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: gold.withOpacity(0.3))), focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: gold))));
  }
}