import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

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
      final prefs = await SharedPreferences.getInstance();

      final String? userId = prefs.getString('userId');
      final String? token = prefs.getString('authToken');

      final String url = "https://knightdate.xyz/api/api/messages/inbox/$userId";

      final chatResponse = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final matches = await http.get(
        Uri.parse("https://knightdate.xyz/api/api/match/get-matches"),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (chatResponse.statusCode == 200 && matches.statusCode == 200) {
        setState(() {
          activeChats = jsonDecode(chatResponse.body)['chats'] ?? [];
          newMatches = jsonDecode(matches.body);
          _isLoading = false; 
        });
      }
    } catch (e) {
      print("Error fetching messages: $e");
      setState(() => _isLoading = false);
    }
  }

  Future<void> sendMessage(String text, String receiverId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? senderId = prefs.getString('userId');
      final String? token = prefs.getString('authToken');

      final String url = "https://knightdate.xyz/api/api/messages/send";

      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'sender': senderId,
          'receiver': receiverId,
          'content': text,
        }),
      );

      if (response.statusCode == 200) {
        print("Message sent successfully");
      } else {
        print("Failed to send message: ${response.body}");
      }
    } catch (e) {
      print("Error sending message: $e");
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
      final imageUrl = 'https://knightdate.xyz${match['ProfilePicture'] ?? '/default.png'}';
      
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10.0),
        child: GestureDetector(
          onTap: () {
            Navigator.push(
              context, 
              MaterialPageRoute(
                builder: (context) => ChatScreen(
                  recieverId: match['_id'], 
                  recieverName: match['FirstName'] ?? "N/A",
                  recieverImage: imageUrl,
                ),
              ),
            );
          },
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(2),
                decoration: const BoxDecoration(color: gold, shape: BoxShape.circle),
                child: CircleAvatar(
                  radius: 32,
                  backgroundColor: Colors.black,
                  backgroundImage: NetworkImage(imageUrl),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                match['FirstName'] ?? "N/A", 
                style: const TextStyle(color: Colors.white70, fontSize: 13)
              ),
            ],
          ),
        ),
      );
    }

  // Chat Messages
  Widget _buildChatItem(dynamic chat, bool isDark) {
    final imageUrl = 'https://knightdate.xyz${chat['ProfilePicture']}';
    bool unread = chat['unread'] ?? false; // Database field for new message

    return ListTile(
      onTap: () { 
        Navigator.push(
          context, 
          MaterialPageRoute(
            builder: (context) => ChatScreen(
              recieverId: chat['receiverId'],
              recieverName: chat['FirstName'] ?? "Unknown",
              recieverImage: imageUrl,
            ),
          ),
        );
       },
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

class ChatScreen extends StatefulWidget {
  final String recieverId;
  final String recieverName;
  final String recieverImage;

  const ChatScreen({
    super.key,
    required this.recieverId,
    required this.recieverName,
    required this.recieverImage,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  List<dynamic> _messages = [];
  String? userId;

  @override
  void initState() {
    super.initState();
    _loadUserId();
    _fetchConversation();
  }

  Future<void> _loadUserId() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      userId = prefs.getString('userId');
    });
  }

  Future<void> _handleSend() async {
    final String text = _messageController.text.trim();
    if (text.isEmpty) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      final String? senderId = prefs.getString('userId');
      final String? token = prefs.getString('authToken');

      final response = await http.post(
        Uri.parse("https://knightdate.xyz/api/api/messages/send"),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'sender': senderId,
          'receiver': widget.recieverId,
          'content': text,
        }),
      );

      if (response.statusCode == 200) {
        print("Message sent successfully");
        _messageController.clear();
        _fetchConversation();
      } else {
        print("Failed to send message: ${response.body}");
      }
    } catch (e) {
      print("Error sending message: $e");
    }
  }

  Future<void> _fetchConversation() async {
    final prefs = await SharedPreferences.getInstance();
    final String? userId = prefs.getString('userId');
    final String? token = prefs.getString('authToken');

    final response = await http.get(
      Uri.parse("https://knightdate.xyz/api/api/messages/conversation/${widget.recieverId}/$userId"),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      setState(() {
        _messages = jsonDecode(response.body);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.recieverName),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              reverse: true, 
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                bool isMe = message['sender'] == userId;
                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: isMe ? Colors.blueAccent : Colors.white10,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(message['content'], style: const TextStyle(color: Colors.white)),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField( 
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: "Type a message...",
                      filled: true,
                      fillColor: Colors.white10,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(30),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    ),
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.send, color: Color(0xFFD4AF37)),
                  onPressed: () async {
                    await _handleSend();
                  },
                ), 
              ],
            ),
          ),
        ],
      ),
    );
  }
}