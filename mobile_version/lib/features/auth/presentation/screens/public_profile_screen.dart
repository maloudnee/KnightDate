import 'package:flutter/material.dart';

class PublicProfileScreen extends StatelessWidget {
  final Map<String, dynamic> userData;
  static const gold = Color(0xFFD4AF37);

  const PublicProfileScreen({super.key, required this.userData});

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.white : Colors.black;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: textColor),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, // Ensures children align left
          children: [
            // Profile Picture
            Center(
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(color: gold, shape: BoxShape.circle),
                child: CircleAvatar(
                  radius: 100,
                  backgroundColor: isDark ? Colors.grey[900] : Colors.grey[200],
                  backgroundImage: () {
                    String rawPath = userData['ProfilePicture'] ?? "";
                    String cleanPath = rawPath.replaceAll('/api/api', '');
                    if (!cleanPath.startsWith('/') && cleanPath.isNotEmpty) cleanPath = '/$cleanPath';
                    if (cleanPath.isNotEmpty && cleanPath != '/default.png') {
                      return NetworkImage("https://knightdate.xyz/api$cleanPath") as ImageProvider;
                    }
                    return null;
                  }(),
                  child: (userData['ProfilePicture'] == null || userData['ProfilePicture'] == '/default.png')
                    ? Icon(Icons.person, size: 80, color: isDark ? gold : Colors.grey[600])
                    : null,
                ),
              ),
            ),
            const SizedBox(height: 20),
            
            // Name, Age, and Major (Centered)
            Center(
              child: Column(
                children: [
                  Text(
                    "${userData['FirstName'] ?? 'User'}, ${userData['Age'] ?? '??'}",
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: textColor),
                  ),
                  Text(
                    userData['Major'] ?? "Undecided",
                    style: const TextStyle(fontSize: 18, color: gold, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
            
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 40, vertical: 20),
              child: Divider(color: Colors.white24),
            ),

            // Gender & Orientation
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 30),
              child: Wrap(
                spacing: 8,
                children: [
                  if (userData['Gender'] != null) _buildIdentityTag(userData['Gender'], isDark),
                  if (userData['SexualOrientation'] != null) _buildIdentityTag(userData['SexualOrientation'], isDark),
                ],
              ),
            ),
            
            const SizedBox(height: 20),

            // Bio 
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("About Me", style: TextStyle(color: gold, fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Text(
                    userData['Bio'] ?? "No bio provided yet.",
                    style: TextStyle(fontSize: 16, color: isDark ? Colors.white70 : Colors.black87, height: 1.5),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 30),

            // Interests
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Interests", style: TextStyle(color: gold, fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 15),
                  if (userData['Interests'] != null && (userData['Interests'] as List).isNotEmpty)
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: (userData['Interests'] as List).map((interest) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 8),
                          decoration: BoxDecoration(
                            border: Border.all(color: gold.withOpacity(0.5)),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            interest.toString()[0].toUpperCase() + interest.toString().substring(1), 
                            style: const TextStyle(color: gold)
                          ),
                        );
                      }).toList(),
                    )
                  else
                    const Text("No interests listed.", style: TextStyle(color: Colors.white24)),
                ],
              ),
            ),
            const SizedBox(height: 50),
          ],
        ),
      ),
    );
  }

  // Helper widget for tags
  Widget _buildIdentityTag(String label, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: gold.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        label[0].toUpperCase() + label.substring(1),
        style: const TextStyle(color: gold, fontWeight: FontWeight.bold, fontSize: 14),
      ),
    );
  }
}