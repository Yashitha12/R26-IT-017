import 'package:flutter/material.dart';
import 'loan_programs_screen.dart';
import 'wallet_screen.dart';
import 'welfare_screen.dart';
import 'profile_screen.dart';
import 'ai_chat_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  static const List<Widget> _pages = <Widget>[
    _HomeContent(),
    WalletScreen(),
    Scaffold(body: Center(child: Text('Status Screen'))),
    ProfileScreen(),
    AIChatScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                color: Color(0xFF0D9488), // Teal
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.home, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('SmartGrama', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                Text('Resident Portal', style: TextStyle(color: Colors.grey[500], fontSize: 12, fontWeight: FontWeight.normal)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.menu), onPressed: () {}),
        ],
      ),
      body: _pages.elementAt(_selectedIndex),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: _onItemTapped,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.account_balance_wallet_outlined), selectedIcon: Icon(Icons.account_balance_wallet), label: 'Wallet'),
          NavigationDestination(icon: Icon(Icons.access_time), label: 'Status'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
          NavigationDestination(icon: Icon(Icons.smart_toy_outlined), label: 'AI Chat'),
        ],
      ),
    );
  }
}

class _HomeContent extends StatelessWidget {
  const _HomeContent();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Blue Gradient Profile Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1D4ED8), Color(0xFF3B82F6)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Welcome back,', style: TextStyle(color: Colors.white, fontSize: 14)),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), shape: BoxShape.circle),
                      child: const Icon(Icons.person_outline, color: Colors.white),
                    ),
                  ],
                ),
                const Text('Nimal Perera', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(16),
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('Total Balance', style: TextStyle(color: Colors.white, fontSize: 12)),
                      SizedBox(height: 4),
                      Text('Rs. 12,500', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 2x2 Action Grid
          Row(
            children: [
              Expanded(child: _ActionCard(icon: Icons.trending_up, color: Colors.blue, title: 'Apply Loan', subtitle: 'Quick funding', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoanProgramsScreen())))),
              const SizedBox(width: 16),
              Expanded(child: _ActionCard(icon: Icons.card_giftcard, color: Colors.green, title: 'Apply Welfare', subtitle: 'Government aid', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WelfareScreen())))),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _ActionCard(icon: Icons.account_balance_wallet_outlined, color: Colors.purple, title: 'My Wallet', subtitle: 'View balance', onTap: () {})),
              const SizedBox(width: 16),
              Expanded(child: _ActionCard(icon: Icons.person_outline, color: Colors.deepOrange, title: 'My Profile', subtitle: 'Account info', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen())))),
            ],
          ),
          const SizedBox(height: 24),

          // Recent Applications
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text('Recent Applications', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
              Text('View All', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.blue)),
            ],
          ),
          const SizedBox(height: 16),
          
          _AppCard(iconColor: Colors.green.shade100, icon: Icons.trending_up, iconTint: Colors.green, title: 'Agricultural Microloan', date: 'Apr 10, 2026', statusText: 'Approved', statusColor: Colors.green, desc: 'Rs. 150,000 • EMI: Rs. 3,750/month'),
          const SizedBox(height: 12),
          _AppCard(iconColor: Colors.amber.shade100, icon: Icons.card_giftcard, iconTint: Colors.amber.shade700, title: 'Samurdhi Welfare', date: 'May 5, 2026', statusText: 'Under Review', statusColor: Colors.amber.shade700, desc: 'Monthly support • Rs. 4,500'),
          const SizedBox(height: 20),

          // AI Banner
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF6B21A8), Color(0xFF9333EA)]),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), shape: BoxShape.circle),
                      child: const Icon(Icons.chat_bubble_outline, color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 12),
                    const Text('Ask AI Assistant', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                const Icon(Icons.arrow_forward, color: Colors.white),
              ],
            ),
          )
        ],
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ActionCard({required this.icon, required this.color, required this.title, required this.subtitle, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: Colors.white, size: 28),
            ),
            const SizedBox(height: 12),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 4),
            Text(subtitle, style: TextStyle(color: Colors.grey[500], fontSize: 11)),
          ],
        ),
      ),
    );
  }
}

class _AppCard extends StatelessWidget {
  final Color iconColor;
  final IconData icon;
  final Color iconTint;
  final String title;
  final String date;
  final String statusText;
  final Color statusColor;
  final String desc;

  const _AppCard({required this.iconColor, required this.icon, required this.iconTint, required this.title, required this.date, required this.statusText, required this.statusColor, required this.desc});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: iconColor, borderRadius: BorderRadius.circular(12)),
                child: Icon(icon, color: iconTint, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    const SizedBox(height: 4),
                    Text(date, style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: Text(statusText, style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1),
          const SizedBox(height: 12),
          Row(
            children: [
              Text(desc, style: TextStyle(color: Colors.grey[700], fontSize: 13)),
            ],
          )
        ],
      ),
    );
  }
}
