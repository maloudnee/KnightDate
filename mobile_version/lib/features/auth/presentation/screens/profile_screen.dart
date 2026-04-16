import 'package:flutter/material.dart';
import 'welcome_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:http_parser/http_parser.dart'; 

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? userData;
  static const gold = Color(0xFFD4AF37);

  final TextEditingController _bioController = TextEditingController();
  final TextEditingController _majorController = TextEditingController();
  final TextEditingController _ageController = TextEditingController();
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _usernameController = TextEditingController();

  final List<String> _genders = ["Man", "Woman", "Non-binary", "Transgender", "Other"];
  final List<String> _orientations = ["Straight", "Gay", "Lesbian", "Bisexual", "Pansexual", "Other"];

  String? _selectedGender;
  String? _selectedOrientation;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  @override
  void dispose() {
    _bioController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('https://knightdate.xyz/api/profile'),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token"
        },
      );
      if (response.statusCode == 200) {
        setState(() {
          userData = json.decode(response.body);
          _bioController.text = userData?['bio'] ?? '';
          _isLoading = false;
        });
      } 
    } catch (e) {
      setState(() => _isLoading = false);
      print("Error loading profile: $e");
    }
  }

  Future<void> _updateProfile() async {
    final prefs = await SharedPreferences.getInstance();
    final String? token = prefs.getString('token');

    final String currentUsername = userData?['username'] ?? "UnknownUser";

    final response = await http.post(
      Uri.parse('https://knightdate.xyz/api/profile/register-profile'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'Username': currentUsername,
        'Bio': _bioController.text,
        'Major': _majorController.text,
        'ProfilePicture': userData?['ProfilePicture'] ?? '',
        'Age': int.tryParse(_ageController.text) ?? 0,
        'FirstName': _firstNameController.text,
        'LastName': _lastNameController.text,
        'Gender': userData?['Gender'] ?? '',
        'SexualOrientation': userData?['SexualOrientation'] ?? '',
      }),
    );

    if (response.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Profile Updated!")),
      );
      _loadProfile(); // Refresh profile data
    }
  }

  Future<void> _uploadPic() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);

    if (image == null) return;

    setState(() => _isLoading = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('token');

      var request = http.MultipartRequest(
        'POST', 
        Uri.parse('https://knightdate.xyz/api/profile/upload-picture')
      );

      request.headers['Authorization'] = 'Bearer $token';
      
      request.files.add(await http.MultipartFile.fromPath(
        'image', 
        image.path,
        contentType: MediaType('image', 'jpeg'),
      ));

      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        var decoded = json.decode(response.body);
        
        setState(() {
          userData?['ProfilePicture'] = decoded['filePath']; 
        });
        
        await _updateProfile(); 
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Profile picture updated!")),
        );
      }
    } catch (e) {
      print("Upload error: $e");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    if (_isLoading) {
      return Scaffold(
        backgroundColor: isDark ? Colors.black : Colors.white,
        body: const Center(child: CircularProgressIndicator(color: gold)),
       );
    }

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 60), 

            // Profile Picture
            Center(
              child: Stack(
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: gold, shape: BoxShape.circle),
                    child: CircleAvatar(
                      radius: 70,
                      backgroundColor: Colors.black,
                      backgroundImage: userData?['ProfilePicture'] != null 
                        ? NetworkImage("https://knightdate.xyz/${userData!['ProfilePicture']}") 
                        : const NetworkImage("https://via.placeholder.com/150"),
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
              "${userData?['FirstName'] ?? "N/A"}, ${userData?['Age'] ?? ''}",
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            Text(
              userData?['Major'] ?? "N/A",
              style: TextStyle(color: Colors.white70, fontSize: 16),
            ),
            
            const SizedBox(height: 30),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Expanded(
                    child: _buildActionButton(
                      "Edit Profile", 
                      Icons.edit_note, 
                      isDark,
                      () => _editProfileDialog(context),
                    ),
                  ),
                  const SizedBox(width: 15),
                  Expanded(
                    child: _buildActionButton(
                      "View Public", 
                      Icons.remove_red_eye, 
                      isDark, 
                      () {
                        if (userData != null) {
                          Navigator.push(
                            context, 
                            MaterialPageRoute(
                              builder: (context) => Scaffold(
                                appBar: AppBar(title: const Text("Public Profile")),
                                body: Padding(
                                  padding: const EdgeInsets.all(20.0),
                                  child: Column(
                                    children: [
                                      CircleAvatar(
                                        radius: 50,
                                        backgroundImage: userData!['ProfilePicture'] != null 
                                          ? NetworkImage("https://knightdate.xyz/${userData!['ProfilePicture']}") 
                                          : const NetworkImage("https://via.placeholder.com/150"),
                                      ),
                                      const SizedBox(height: 15),
                                      Text(
                                        "${userData?['FirstName'] ?? "N/A"}, ${userData?['Age'] ?? ''}",
                                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                                      ),
                                      Text(
                                        userData?['Major'] ?? "N/A",
                                        style: TextStyle(color: Colors.grey[700], fontSize: 14),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          );
                        }
                      },
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 40),

            _buildSettingTile("Account Settings", Icons.settings_outlined, isDark),
            _buildSettingTile("Preferences", Icons.tune_outlined, isDark),
            _buildSettingTile("Security", Icons.lock_outline, isDark),
            
            const Divider(color: Colors.white10, indent: 20, endIndent: 20, height: 40),
            
            // LOGOUT BUTTON
            ListTile(
              onTap: () => _handleLogout(context),
              leading: const Icon(Icons.logout, color: Colors.redAccent),
              title: const Text("Logout", style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
              trailing: const Icon(Icons.chevron_right, color: Colors.white24),
            ),
          ],
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
        child: Column(
          children: [
            Icon(icon, color: gold),
            const SizedBox(height: 5),
            Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingTile(String title, IconData icon, bool isDark) {
    return ListTile(
      leading: Icon(icon, color: Colors.white70),
      title: Text(title, style: const TextStyle(color: Colors.white)),
      trailing: const Icon(Icons.chevron_right, color: Colors.white24),
      onTap: () {},
    );
  }

  void _handleLogout(BuildContext context) {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const WelcomeScreen()), 
      (route) => false,
    );
  }

  void _editProfileDialog(BuildContext context) {
    _firstNameController.text = userData?['FirstName'] ?? '';
    _lastNameController.text = userData?['LastName'] ?? '';
    _ageController.text = (userData?['Age'] ?? '').toString();
    _majorController.text = userData?['Major'] ?? '';
    _usernameController.text = userData?['username'] ?? '';
    _bioController.text = userData?['Bio'] ?? '';
    _selectedGender = userData?['Gender'];
    _selectedOrientation = userData?['SexualOrientation'];

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: Colors.grey[900],
          title: const Text("Edit Profile", style: TextStyle(color: gold)),
          content: SizedBox(
            width: double.maxFinite,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildPopupField("First Name", _firstNameController),
                  _buildPopupField("Last Name", _lastNameController),
                  _buildPopupField("Age", _ageController, isNumber: true),
                  _buildPopupField("Major", _majorController),
                  _buildPopupField("Username", _usernameController, isReadOnly: true), // Rubric: Primary keys should stay fixed
                  _buildPopupField("Bio", _bioController, maxLines: 3),

                  const SizedBox(height: 10),
                  
                  DropdownButtonFormField<String>(
                    value: _selectedGender,
                    dropdownColor: Colors.grey[850],
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(labelText: "Gender", labelStyle: TextStyle(color: gold)),
                    items: _genders.map((g) => DropdownMenuItem(value: g, child: Text(g))).toList(),
                    onChanged: (val) {
                      setState(() {
                        _selectedGender = val;
                      });
                    },
                  ),
                  const SizedBox(height: 15),

                  DropdownButtonFormField<String>(
                    value: _selectedOrientation,
                    dropdownColor: Colors.grey[850],
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(labelText: "Sexual Orientation", labelStyle: TextStyle(color: gold)),
                    items: _orientations.map((o) => DropdownMenuItem(value: o, child: Text(o))).toList(),
                    onChanged: (val) {
                      setState(() {
                        _selectedOrientation = val;
                      });
                    },
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cancel", style: TextStyle(color: Colors.white54)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: gold),
              onPressed: () {
                _updateProfile();
                Navigator.pop(context);
              },
              child: const Text("Save Changes", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
            ),
          ],
        );
      }
    );
  }

  Widget _buildPopupField(String label, TextEditingController controller, {bool isNumber = false, int maxLines = 1, bool isReadOnly = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15.0),
      child: TextField(
        controller: controller,
        readOnly: isReadOnly,
        maxLines: maxLines,
        keyboardType: isNumber ? TextInputType.number : TextInputType.text,
        style: const TextStyle(color: Colors.white, fontSize: 14),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: gold),
          enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: gold.withOpacity(0.3))),
          focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: gold)),
        ),
      ),
    );
  }
}