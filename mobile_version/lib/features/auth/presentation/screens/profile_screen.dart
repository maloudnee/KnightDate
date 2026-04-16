import 'package:flutter/material.dart';
import 'welcome_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

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
        Uri.parse('http://knightdate.xyz/api/profile'),
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
    final String? _selectedMajor = userData?['Major'] ?? "Undeclared";

    final response = await http.post(
    Uri.parse('http://knightdate.xyz/api/profile/register-profile'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
    body: jsonEncode({
      'username': currentUsername,
      'bio': _bioController.text,
      'major': _selectedMajor,
      'profilePicture': userData?['profilePicture'] ?? '',
      'age': userData?['Age'] ?? 0,
      'firstName': userData?['FirstName'] ?? '',
      'lastName': userData?['LastName'] ?? '',
      'gender': userData?['Gender'] ?? '',
      'sexualOrientation': userData?['SexualOrientation'] ?? '',
    }),
  );

  if (response.statusCode == 200) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Profile Updated!")),
    );
    _loadProfile(); // Refresh profile data
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
                      backgroundImage: userData?['profilePicture'] != null 
                        ? NetworkImage("http://knightdate.xyz:5000/${userData!['profilePicture']}") 
                        : const NetworkImage("https://via.placeholder.com/150"), // Placeholder image
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(color: gold, shape: BoxShape.circle),
                      child: const Icon(Icons.edit, color: Colors.black, size: 20),
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
                      () {
                        // Navigate to Edit Profile Screen 
                      },
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
                                        backgroundImage: userData!['profilePicture'] != null 
                                          ? NetworkImage("http://knightdate.xyz:5000/${userData!['profilePicture']}") 
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
}