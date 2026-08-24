import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF1E293B))),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Purple Profile Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF8B5CF6), Color(0xFF4C1D95)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withOpacity(0.5), width: 2),
                      color: Colors.white.withOpacity(0.2),
                    ),
                    child: const Icon(Icons.person_outline, color: Colors.white, size: 40),
                  ),
                  const SizedBox(height: 16),
                  const Text('Nimal Perera', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  const Text('NIC: 198723456789', style: TextStyle(color: Colors.white70, fontSize: 14)),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text('Personal Information', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            const SizedBox(height: 12),
            _InfoCard(icon: Icons.phone_outlined, iconColor: Colors.blue.shade100, iconTint: Colors.blue, label: 'Phone Number', value: '+94 77 123 4567'),
            const SizedBox(height: 12),
            _InfoCard(icon: Icons.email_outlined, iconColor: Colors.purple.shade50, iconTint: Colors.purple, label: 'Email Address', value: 'nimal.perera@gmail.com'),
            const SizedBox(height: 12),
            _InfoCard(icon: Icons.location_on_outlined, iconColor: Colors.green.shade50, iconTint: Colors.green, label: 'GN Division', value: 'Homagama - Division 542/A'),

            const SizedBox(height: 24),
            const Text('Family Details', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 2))],
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(child: _GridInfoItem('Family Size', '4 Members')),
                      const SizedBox(width: 16),
                      Expanded(child: _GridInfoItem('Dependents', '2 Children')),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: _GridInfoItem('Spouse', 'Married')),
                      const SizedBox(width: 16),
                      Expanded(child: _GridInfoItem('Elderly', 'None')),
                    ],
                  )
                ],
              ),
            ),

            const SizedBox(height: 24),
            const Text('Employment & Income', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            const SizedBox(height: 12),
            _InfoCard(icon: Icons.work_outline, iconColor: Colors.orange.shade50, iconTint: Colors.orange, label: 'Occupation', value: 'Farmer'),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('Monthly Income', style: TextStyle(color: Colors.green, fontSize: 12)),
                        SizedBox(height: 4),
                        Text('Rs. 45,000', style: TextStyle(color: Color(0xFF064E3B), fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.orange.shade50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('Monthly Expenses', style: TextStyle(color: Colors.orange, fontSize: 12)),
                        SizedBox(height: 4),
                        Text('Rs. 25,000', style: TextStyle(color: Color(0xFF7C2D12), fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final Color iconTint;
  final String label;
  final String value;

  const _InfoCard({required this.icon, required this.iconColor, required this.iconTint, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: iconColor, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: iconTint, size: 20),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: TextStyle(color: Colors.grey[500], fontSize: 12)),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1E293B))),
            ],
          )
        ],
      ),
    );
  }
}

class _GridInfoItem extends StatelessWidget {
  final String label;
  final String value;

  const _GridInfoItem(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[500], fontSize: 11)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B))),
        ],
      ),
    );
  }
}
