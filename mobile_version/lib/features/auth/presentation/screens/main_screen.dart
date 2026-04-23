import 'package:flutter/material.dart';
import 'discovery_screen.dart';
import 'messages_screen.dart';
import 'profile_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const DiscoveryScreen(),
    const MessagesScreen(),
    const ProfileScreen(),  
  ];

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    
    return PopScope(
      canPop: false, 
      child: Scaffold(
        body: _screens[_currentIndex],
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.explore), label: "Discover"),
            BottomNavigationBarItem(icon: Icon(Icons.message), label: "Messages"),
            BottomNavigationBarItem(icon: Icon(Icons.person), label: "Profile"),          
          ],
        ),
      ),
    );
  }
}