import 'package:flutter/material.dart';
import 'welcome_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  static const gold = Color(0xFFD4AF37);

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 60), 
            
            Center(
              child: Stack(
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: gold, shape: BoxShape.circle),
                    child: const CircleAvatar(
                      radius: 70,
                      backgroundImage: NetworkImage("https://via.placeholder.com/150"), 
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
            const Text(
              "Sir Knight, 22", // Use real data here
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const Text(
              "Computer Engineering",
              style: TextStyle(color: Colors.white70, fontSize: 16),
            ),
            
            const SizedBox(height: 30),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Expanded(child: _buildActionButton("Edit Profile", Icons.edit_note, isDark)),
                  const SizedBox(width: 15),
                  Expanded(child: _buildActionButton("View Public", Icons.remove_red_eye, isDark)),
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

  Widget _buildActionButton(String label, IconData icon, bool isDark) {
    return Container(
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
      MaterialPageRoute(builder: (context) => const WelcomeScreen()), // Make sure to import it
      (route) => false,
    );
  }
}