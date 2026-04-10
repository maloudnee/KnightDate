import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  List<dynamic> newMatches = [];
  List<dynamic> activeChats = [];
  bool _isLoading = true;

  static const gold = Color(0xFFD4AF37);

  @override
  void initState() {
    super.initState();
    _fetchMessages();
  }

  Future<void> _fetchMessages() async {
    try {
      final response = await http.get(Uri.parse('http://localhost:3000/api/messages'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          newMatches = data['newMatches'] ?? [];
          activeChats = data['chats'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      print("Error fetching messages: $e");
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        title: const Text("Messages", style: TextStyle(color: gold, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: gold))
        : CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text("New Matches", style: TextStyle(color: gold, fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ),
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 110,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    itemCount: newMatches.length,
                    itemBuilder: (context, index) => _buildMatchCircle(newMatches[index]),
                  ),
                ),
              ),

              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10),
                  child: Text("Messages", style: TextStyle(color: gold, fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ),
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final chat = activeChats[index];
                    return Column(
                      children: [
                        _buildChatItem(chat, isDark),
                        const Divider(color: Colors.white10, indent: 85, endIndent: 20, height: 1),
                      ],
                    );
                  },
                  childCount: activeChats.length,
                ),
              ),
            ],
          ),
    );
  }

  // Matches
  Widget _buildMatchCircle(dynamic match) {
    final imageUrl = 'http://localhost:3000${match['ProfilePicture']}';
    
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10.0),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(2), // The Gold Border
            decoration: const BoxDecoration(color: gold, shape: BoxShape.circle),
            child: CircleAvatar(
              radius: 32,
              backgroundColor: Colors.black,
              child: CircleAvatar(
                radius: 30,
                backgroundImage: NetworkImage(imageUrl),
              ),
            ),
          ),
          const SizedBox(height: 6),
          Text(match['FirstName'] ?? "Knight", style: const TextStyle(color: Colors.white70, fontSize: 13)),
        ],
      ),
    );
  }

  // Chat Messages
  Widget _buildChatItem(dynamic chat, bool isDark) {
    final imageUrl = 'http://localhost:3000${chat['ProfilePicture']}';
    bool unread = chat['unread'] ?? false; // Database field for new message

    return ListTile(
      onTap: () { /* Navigate to Chat Details */ },
      leading: Stack(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundImage: NetworkImage(imageUrl),
          ),
          if (unread)
            Positioned(
              right: 0,
              top: 0,
              child: Container(
                height: 15,
                width: 15,
                decoration: BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                  border: Border.all(color: isDark ? Colors.black : Colors.white, width: 2),
                ),
              ),
            ),
        ],
      ),
      title: Text(
        chat['FirstName'] ?? "Unknown",
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      ),
      subtitle: Text(
        chat['lastMessage'] ?? "Tap to start chatting!",
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(color: unread ? Colors.white : Colors.grey, fontWeight: unread ? FontWeight.bold : FontWeight.normal),
      ),
      trailing: const Icon(Icons.chevron_right, color: Colors.white24),
    );
  }
}