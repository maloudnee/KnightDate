import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class DiscoveryScreen extends StatefulWidget {
  const DiscoveryScreen({super.key});

  @override
  State<DiscoveryScreen> createState() => _DiscoveryScreenState();
}

class _DiscoveryScreenState extends State<DiscoveryScreen> {
  List<dynamic> users = [];
  bool _isLoading = true;
  static const gold = Color(0xFFD4AF38);

  @override
  void initState() {
    super.initState();
    _fetchUsers();
  }

  Future<void> _fetchUsers() async {
    try {
      final response = await http.get(Uri.parse('https://your-backend-api.com/discover'));
      if (response.statusCode == 200) {
        setState(() {
          users = json.decode(response.body);
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to load users');
      }
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("An error occurred while fetching users."))
      );
    }
  }

  // Record user interactions (like/dislike) and send to backend
  Future<void> _handleChoice(bool liked, String userId) async {
    setState(() {
      users.removeAt(0); // Remove the current profile from the list
    });

    try {
      await http.post(
        Uri.parse('https://your-backend-api.com/choice'),
        headers: {"Content-Type": "application/json"},
        body: json.encode({"userId": userId, "action": liked ? "like" : "dislike"}),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Failed to record your choice. Please try again."))
      );
      print("Failed to send choice: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        title: const Text("Discovery", style: TextStyle(color: gold, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: gold))
        : users.isEmpty
          ? _buildNoMatchesState()
          : Column (
            children: [
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Stack(
                    children: users.reversed.map((user) => _buildUserCard(user, isDark)).toList(), 
                  ),
                ),
              ),
              _buildActionButtons(),
              const SizedBox(height: 40),
            ],
          ),
    );
  }

  Widget _buildUserCard(dynamic user, bool isDark) {
    final String imageUrl = 'https://your-backend-api.com/images/${user['profilePicture']}';

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.white24 : Colors.black26,
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          children: [
            Positioned.fill(
              child: Image.network(
                imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  color: isDark ? Colors.white10 : Colors.white70,
                  child: const Icon(Icons.person, size: 80, color: gold),
                ),
              ),
            ),

            Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter, 
                  end: Alignment.bottomCenter, 
                  colors: [
                    Colors.transparent, 
                    isDark ? Colors.black87 : Colors.white70
                    ],
                  ),
                ),
              ),
            ),

            Positioned(
              left: 17, 
              bottom: 17,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "${user['name']}, ${user['age']}",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    user['Major'] ?? "Unknown Major",
                    style: TextStyle(
                      color: gold,
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Text(
                    user['bio'] ?? "No bio available",
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: isDark ? Colors.white70 : Colors.black87,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons() {
    final topUser = users[0];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly, 
      children: [
        _circleButton(Icons.close, Colors.red, () => _handleChoice(false, topUser['_id'])),
        _circleButton(Icons.favorite, Colors.green, () => _handleChoice(true, topUser['_id'])),
      ],
    );
  }

  Widget _circleButton(IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap, 
      child: Container(
        height: 70, 
        width: 70, 
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white, 
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.6),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Icon(icon, color: color, size: 36),
      ),
    );
  }

  Widget _buildNoMatchesState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.sentiment_dissatisfied, size: 80, color: gold),
          const SizedBox(height: 16),
          Text(
            "No more profiles to show",
            style: TextStyle(
              color: gold,
              fontSize: 20,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
