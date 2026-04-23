import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

const gold = Color(0xFFD4AF37);

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  List<dynamic> newMatches = [];
  List<dynamic> activeChats = [];
  bool _isLoading = true;
  String? userId;

  @override
  void initState() {
    super.initState();
    _loadUserId().then((_) => _fetchMessages());
  }

  Future<void> _loadUserId() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() => userId = prefs.getString('userId'));
  }

  Future<void> _fetchMessages() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('authToken');
      final String? currentUid = prefs.getString('userId');

      final chatResponse = await http.get(
        Uri.parse("https://knightdate.xyz/api/api/messages/inbox/$currentUid"),
        headers: {'Authorization': 'Bearer $token'},
      );

      final matchResponse = await http.get(
        Uri.parse("https://knightdate.xyz/api/api/match/get-matches"),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (chatResponse.statusCode == 200 && matchResponse.statusCode == 200) {
        final List<dynamic> chats = jsonDecode(chatResponse.body);
        final List<dynamic> matches = jsonDecode(matchResponse.body);

        setState(() {
          activeChats = chats;
          
          newMatches = matches.where((m) {
            final String matchId = m['_id'].toString();
            bool alreadyInChat = chats.any((c) {
              final chatUserData = c['_id'];
              final String chatUserId = (chatUserData is Map) 
                  ? chatUserData['_id'].toString() 
                  : chatUserData.toString();
              return chatUserId == matchId;
            });
            return !alreadyInChat;
          }).toList();

          _isLoading = false;
        });
      }
    } catch (e) {
      print("Fetch error: $e");
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.white : Colors.black;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        title: const Text("Messages", style: TextStyle(color: gold, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: gold),
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
                  child: newMatches.isEmpty 
                  ? Padding(padding: const EdgeInsets.symmetric(horizontal: 20), child: Text("No new matches yet.", style: TextStyle(color: textColor.withOpacity(0.5))))
                  : SizedBox(
                      height: 110,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        itemCount: newMatches.length,
                        itemBuilder: (context, index) => _buildMatchCircle(newMatches[index], textColor),
                      ),
                    ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10),
                    child: Text("Messages", style: TextStyle(color: gold, fontWeight: FontWeight.bold, fontSize: 16)),
                  ),
                ),
                activeChats.isEmpty 
                ? SliverToBoxAdapter(child: Center(child: Padding(padding: const EdgeInsets.all(40), child: Text("No conversations yet.", style: TextStyle(color: textColor.withOpacity(0.5))))))
                : SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      return _buildChatItem(activeChats[index], isDark, textColor);
                    },
                    childCount: activeChats.length,
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildMatchCircle(dynamic match, Color textColor) {
    String rawPath = match['ProfilePicture'] ?? "/default.png";
    String cleanPath = rawPath.replaceAll('/api/api', '');
    if (!cleanPath.startsWith('/')) cleanPath = '/$cleanPath';
    final imageUrl = "https://knightdate.xyz/api$cleanPath?v=${DateTime.now().millisecondsSinceEpoch}";

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10.0),
      child: GestureDetector(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ChatScreen(
                recieverId: match['_id'].toString(), 
                recieverName: match['FirstName'] ?? match['username'] ?? "Knight",
                recieverImage: imageUrl,
              ),
            ),
          ).then((_) => _fetchMessages());
        },
        child: Column(
          children: [
            CircleAvatar(
              radius: 32,
              backgroundColor: gold,
              child: CircleAvatar(
                radius: 30,
                backgroundColor: Colors.grey[800],
                backgroundImage: (cleanPath != "/default.png") ? NetworkImage(imageUrl) : null,
                child: (cleanPath == "/default.png") ? const Icon(Icons.person, color: gold) : null,
              ),
            ),
            const SizedBox(height: 6),
            Text(match['FirstName'] ?? match['username'] ?? "N/A", style: TextStyle(color: textColor, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _buildChatItem(dynamic chat, bool isDark, Color textColor) {
    final userData = chat['_id'];
    if (userData == null) return const SizedBox.shrink();

    final String rId = (userData is Map) ? userData['_id']?.toString() ?? "" : userData.toString();
    final String rName = (userData is Map) ? (userData['username'] ?? "Knight User") : "Knight User";
    String rPic = (userData is Map) ? (userData['ProfilePicture'] ?? "/default.png") : "/default.png";
    
    final String displayMessage = chat['lastMessage'] ?? "Tap to chat";

    rPic = rPic.replaceAll('/api/api', '');
    final String imageUrl = "https://knightdate.xyz/api${rPic.startsWith('/') ? '' : '/'}$rPic?v=${DateTime.now().millisecondsSinceEpoch}";

    return ListTile(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ChatScreen(
              recieverId: rId,
              recieverName: rName,
              recieverImage: imageUrl,
            ),
          ),
        ).then((_) => _fetchMessages());
      },
      leading: CircleAvatar(
        radius: 28,
        backgroundColor: Colors.grey[800],
        backgroundImage: (rPic != "/default.png") ? NetworkImage(imageUrl) : null,
        child: (rPic == "/default.png") ? const Icon(Icons.person, color: gold) : null,
      ),
      title: Text(rName, style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
      subtitle: Text(displayMessage, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: textColor.withOpacity(0.6))),
      trailing: Icon(Icons.chevron_right, color: textColor.withOpacity(0.3)),
    );
  }
}

class ChatScreen extends StatefulWidget {
  final String recieverId;
  final String recieverName;
  final String recieverImage;

  const ChatScreen({super.key, required this.recieverId, required this.recieverName, required this.recieverImage});

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
    _loadUserId().then((_) => _fetchConversation());
  }

  Future<void> _loadUserId() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() => userId = prefs.getString('userId'));
  }

  Future<void> _handleSend() async {
    final String text = _messageController.text.trim();
    if (text.isEmpty) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('authToken');
      
      await http.post(
        Uri.parse("https://knightdate.xyz/api/api/messages/send"),
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
        body: jsonEncode({
          'senderID': userId, 
          'recieverID': widget.recieverId, 
          'messageText': text
        }),
      );
      _messageController.clear();
      _fetchConversation();
    } catch (e) { print("Send error: $e"); }
  }

  Future<void> _fetchConversation() async {
    if (userId == null) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('authToken');
      final response = await http.get(
        Uri.parse("https://knightdate.xyz/api/api/messages/conversation/$userId/${widget.recieverId}"),
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) {
        setState(() => _messages = jsonDecode(response.body));
      }
    } catch (e) { print("Fetch error: $e"); }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.white : Colors.black;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      appBar: AppBar(
        title: Text(widget.recieverName, style: const TextStyle(color: gold)),
        backgroundColor: Colors.transparent, elevation: 0, centerTitle: true,
        iconTheme: const IconThemeData(color: gold),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              reverse: true,
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[_messages.length - 1 - index];
                final sender = message['senderID'];
                final String msgSenderId = (sender is Map) ? sender['_id'] : sender.toString();
                bool isMe = msgSenderId == userId;

                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: isMe ? gold : (isDark ? Colors.white10 : Colors.grey[200]), 
                      borderRadius: BorderRadius.circular(20)
                    ),
                    child: Text(message['messageText'] ?? "", style: TextStyle(color: isMe ? Colors.black : textColor)),
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
                    controller: _messageController, style: TextStyle(color: textColor),
                    decoration: InputDecoration(
                      hintText: "Type a message...", hintStyle: TextStyle(color: textColor.withOpacity(0.5)),
                      filled: true, fillColor: isDark ? Colors.white10 : Colors.grey[100],
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(30), borderSide: BorderSide.none),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    ),
                  ),
                ),
                IconButton(icon: const Icon(Icons.send, color: gold), onPressed: _handleSend),
              ],
            ),
          ),
        ],
      ),
    );
  }
}