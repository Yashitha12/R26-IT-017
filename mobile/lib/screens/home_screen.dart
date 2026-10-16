import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_strings.dart';
import 'loan_programs_screen.dart';
import 'wallet_screen.dart';
import 'welfare_screen.dart';
import 'profile_screen.dart';
import 'ai_chat_screen.dart';

class HomeScreen extends StatefulWidget {
  final Map<String, dynamic>? userData;
  const HomeScreen({super.key, this.userData});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  List<Widget> _getPages() {
    return [
      _HomeDashboardView(userData: widget.userData),
      const WalletScreen(isEmbedded: true),
      const LoanProgramsScreen(isEmbedded: true),
      const WelfareScreen(isEmbedded: true),
      const AIChatScreen(isEmbedded: true),
    ];
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final s = AppStrings.of(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppComponents.headerAppBar(
        context,
        title: s.appTitle,
        subtitle: s.residentPortal,
        showBack: false,
        showLangPill: true,
        extraActions: [
          IconButton(
            icon: const Icon(Icons.person_outline, color: AppColors.textPrimary),
            tooltip: s.myProfileTitle,
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ProfileScreen()),
              );
            },
          ),
        ],
      ),
      body: IndexedStack(
        index: _selectedIndex,
        children: _getPages(),
      ),
      floatingActionButton: _selectedIndex == 0
          ? Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: AppComponents.aiFloatingAssistantWidget(
                context,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const AIChatScreen()),
                  );
                },
              ),
            )
          : null,
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppColors.surface,
          border: Border(top: BorderSide(color: AppColors.border, width: 1)),
        ),
        child: NavigationBar(
          backgroundColor: AppColors.surface,
          elevation: 0,
          selectedIndex: _selectedIndex,
          onDestinationSelected: _onItemTapped,
          indicatorColor: AppColors.primaryLight,
          destinations: [
            NavigationDestination(
              icon: const Icon(Icons.home_outlined),
              selectedIcon: const Icon(Icons.home, color: AppColors.primary),
              label: s.navHome,
            ),
            NavigationDestination(
              icon: const Icon(Icons.account_balance_wallet_outlined),
              selectedIcon: const Icon(Icons.account_balance_wallet, color: AppColors.primary),
              label: s.navWallet,
            ),
            NavigationDestination(
              icon: const Icon(Icons.trending_up),
              selectedIcon: const Icon(Icons.trending_up, color: AppColors.accent),
              label: 'Loans',
            ),
            NavigationDestination(
              icon: const Icon(Icons.card_giftcard),
              selectedIcon: const Icon(Icons.card_giftcard, color: AppColors.welfare),
              label: 'Welfare',
            ),
            NavigationDestination(
              icon: const Icon(Icons.smart_toy_outlined),
              selectedIcon: const Icon(Icons.smart_toy, color: AppColors.primary),
              label: s.navChat,
            ),
          ],
        ),
      ),
    );
  }
}

class _HomeDashboardView extends StatelessWidget {
  final Map<String, dynamic>? userData;
  const _HomeDashboardView({this.userData});

  @override
  Widget build(BuildContext context) {
    final s = AppStrings.of(context);
    final citizenName = userData?['fullName'] ?? userData?['name'] ?? 'Aravinda Kumara';
    final district = userData?['district'] ?? userData?['address'] ?? 'Gampaha';
    final did = userData?['did'] ?? 'did:smartgrama:prototype:001';

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 640),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome & Balance Hero Card (Deep Slate & Indigo gradient)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1E1B4B), Color(0xFF3730A3), Color(0xFF4338CA)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x263730A3),
                      blurRadius: 18,
                      offset: Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${s.welcomeBack},',
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              citizenName,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.3,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Text(
                                  '$district • ${s.gnResident}',
                                  style: const TextStyle(color: Colors.white60, fontSize: 12),
                                ),
                              ],
                            ),
                          ],
                        ),
                        // Avatar
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.18),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white24, width: 1.5),
                          ),
                          child: const Icon(Icons.person, color: Colors.white, size: 24),
                        ),
                      ],
                    ),

                    const SizedBox(height: 12),
                    // Verified DID Pill inside hero
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF065F46).withOpacity(0.85),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF34D399), width: 1),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.verified, size: 13, color: Color(0xFF6EE7B7)),
                          const SizedBox(width: 5),
                          Text(
                            did,
                            style: const TextStyle(
                              color: Color(0xFFE0E7FF),
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Total Balance Container
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white12, width: 1),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                s.totalBalance,
                                style: const TextStyle(color: Colors.white70, fontSize: 12),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'Rs. 12,500.00',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 26,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.account_balance_wallet, color: Colors.white, size: 24),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Section Title: Digital Services
              Text(
                s.quickActions,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),

              // 2x2 Services Grid
              Row(
                children: [
                  Expanded(
                    child: _ServiceCard(
                      title: s.applyLoanTitle,
                      subtitle: s.applyLoanDesc,
                      icon: Icons.trending_up,
                      iconBg: const Color(0xFFEEF2FF),
                      iconColor: AppColors.accent,
                      borderColor: const Color(0xFFC7D2FE),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const LoanProgramsScreen()),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: _ServiceCard(
                      title: s.applyWelfareTitle,
                      subtitle: s.applyWelfareDesc,
                      icon: Icons.card_giftcard,
                      iconBg: const Color(0xFFDCFCE7),
                      iconColor: AppColors.welfare,
                      borderColor: const Color(0xFFA7F3D0),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const WelfareScreen()),
                        );
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: _ServiceCard(
                      title: s.myWalletTitle,
                      subtitle: s.myWalletDesc,
                      icon: Icons.account_balance_wallet_outlined,
                      iconBg: const Color(0xFFF3E8FF),
                      iconColor: const Color(0xFF9333EA),
                      borderColor: const Color(0xFFE9D5FF),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const WalletScreen()),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: _ServiceCard(
                      title: s.myProfileTitle,
                      subtitle: s.myProfileDesc,
                      icon: Icons.badge_outlined,
                      iconBg: const Color(0xFFCCFBF1),
                      iconColor: AppColors.tealBrand,
                      borderColor: const Color(0xFF99F6E4),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const ProfileScreen()),
                        );
                      },
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 28),

              // Section: Recent Applications
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    s.recentApplications,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const WalletScreen()),
                      );
                    },
                    child: Text(
                      s.viewAll,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Application Card 1: Microloan
              _ApplicationStatusCard(
                title: 'Agricultural Cultivation Microloan',
                partner: 'Samurdhi Development Bank',
                date: 'Oct 12, 2026',
                statusText: s.approved,
                statusBg: AppColors.successBg,
                statusColor: AppColors.successText,
                statusBorder: AppColors.successBorder,
                details: 'Approved: Rs. 150,000 • 12% APR • EMI: Rs. 3,750/mo',
                icon: Icons.trending_up,
                iconColor: AppColors.accent,
              ),

              const SizedBox(height: 12),

              // Application Card 2: Aswesuma
              _ApplicationStatusCard(
                title: 'Aswesuma Welfare Benefit (PMT)',
                partner: 'Divisional Secretariat Minuwangoda',
                date: 'Oct 14, 2026',
                statusText: s.underReview,
                statusBg: AppColors.warningBg,
                statusColor: AppColors.warningText,
                statusBorder: AppColors.warningBorder,
                details: 'Category: Poor • Eligible Allowance: Rs. 8,500/mo',
                icon: Icons.card_giftcard,
                iconColor: AppColors.welfare,
              ),

              const SizedBox(height: 24),

              // AI Chat Assistant Banner
              AppComponents.card(
                padding: const EdgeInsets.all(20),
                color: const Color(0xFFFAF5FF),
                border: Border.all(color: const Color(0xFFE9D5FF), width: 1.5),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const AIChatScreen()),
                  );
                },
                child: Row(
                  children: [
                    AppComponents.aiBotAvatar(size: 52),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            s.aiAssistantBannerTitle,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF581C87),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            s.aiAssistantBannerDesc,
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF7E22CE),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.arrow_forward_ios, size: 16, color: Color(0xFF9333EA)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ServiceCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color iconBg;
  final Color iconColor;
  final Color borderColor;
  final VoidCallback onTap;

  const _ServiceCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.iconBg,
    required this.iconColor,
    required this.borderColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppComponents.card(
      padding: const EdgeInsets.all(18),
      border: Border.all(color: borderColor, width: 1.5),
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: iconBg,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const SizedBox(height: 14),
          Text(
            title,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
              height: 1.3,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _ApplicationStatusCard extends StatelessWidget {
  final String title;
  final String partner;
  final String date;
  final String statusText;
  final Color statusBg;
  final Color statusColor;
  final Color statusBorder;
  final String details;
  final IconData icon;
  final Color iconColor;

  const _ApplicationStatusCard({
    required this.title,
    required this.partner,
    required this.date,
    required this.statusText,
    required this.statusBg,
    required this.statusColor,
    required this.statusBorder,
    required this.details,
    required this.icon,
    required this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return AppComponents.card(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 20, color: iconColor),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '$partner • $date',
                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              AppComponents.statusBadge(
                label: statusText,
                background: statusBg,
                textColor: statusColor,
                borderColor: statusBorder,
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: 10),
          Text(
            details,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
