import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_strings.dart';
import 'login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final s = AppStrings.of(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppComponents.headerAppBar(
        context,
        title: s.myProfileTitle,
        subtitle: 'Decentralized Resident Profile',
        showBack: true,
        showLangPill: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Profile Hero Card (Deep Indigo & Violet Gradient)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1E1B4B), Color(0xFF3730A3), Color(0xFF4F46E5)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x243730A3),
                        blurRadius: 16,
                        offset: Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withOpacity(0.18),
                          border: Border.all(color: Colors.white30, width: 2),
                        ),
                        child: const Icon(Icons.person, color: Colors.white, size: 36),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Aravinda Kumara',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'NIC: 200223003053',
                        style: TextStyle(color: Colors.white70, fontSize: 13),
                      ),
                      const SizedBox(height: 12),
                      AppComponents.didBadge('did:smartgrama:prototype:001'),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Personal Info Card
                AppComponents.card(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        s.personalInfo,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 16),

                      _infoTile(Icons.phone_outlined, s.phone, '+94 78 145 3248'),
                      const Divider(height: 18, color: AppColors.border),
                      _infoTile(Icons.email_outlined, s.emailAddress, 'aravinda.k@gmail.com'),
                      const Divider(height: 18, color: AppColors.border),
                      _infoTile(Icons.home_outlined, s.addressField, '45/A, Jayawickrama Road, Minuwangoda'),
                      const Divider(height: 18, color: AppColors.border),
                      _infoTile(Icons.location_on_outlined, s.gnField, 'Minuwangoda North (Division 542/A)'),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Household Details
                AppComponents.card(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        s.householdInfo,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 16),

                      Row(
                        children: [
                          Expanded(child: _metricTag('Family Members', '4 Persons')),
                          const SizedBox(width: 12),
                          Expanded(child: _metricTag('Dependents', '2 Children')),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(child: _metricTag('Occupation', 'Farmer / Cultivator')),
                          const SizedBox(width: 12),
                          Expanded(child: _metricTag('Monthly Income', 'Rs. 45,000')),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Logout Button
                OutlinedButton.icon(
                  icon: const Icon(Icons.logout, size: 18, color: AppColors.danger),
                  label: Text(s.logout, style: const TextStyle(color: AppColors.danger, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    side: const BorderSide(color: AppColors.dangerBorder, width: 1.5),
                    backgroundColor: AppColors.dangerBg,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                      (route) => false,
                    );
                  },
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _infoTile(IconData icon, String label, String value) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.surfaceSubtle,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 18, color: AppColors.textSecondary),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
              Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _metricTag(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceSubtle,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
        ],
      ),
    );
  }
}
