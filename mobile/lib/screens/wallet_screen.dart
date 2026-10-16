import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_strings.dart';
import '../api_service.dart';

class WalletScreen extends StatefulWidget {
  final bool isEmbedded;
  const WalletScreen({super.key, this.isEmbedded = false});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  List<dynamic> ledger = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadLedger();
  }

  Future<void> _loadLedger() async {
    try {
      final data = await ApiService.fetchLedger();
      if (!mounted) return;
      setState(() {
        ledger = data.isNotEmpty ? data : _sampleTransactions;
        isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        ledger = _sampleTransactions;
        isLoading = false;
      });
    }
  }

  final List<Map<String, dynamic>> _sampleTransactions = [
    {
      "id": "tx-001",
      "loan_type": "Agricultural Microloan",
      "partner_bank": "Samurdhi Development Bank",
      "approved_amount": 150000,
      "duration_months": 24,
      "status": "Active",
      "timestamp": "2026-10-12 14:30",
      "tx_hash": "0x7a8b...3f1c"
    },
    {
      "id": "tx-002",
      "loan_type": "Aswesuma Social Grant",
      "partner_bank": "Divisional Secretariat",
      "approved_amount": 8500,
      "duration_months": 1,
      "status": "Pending",
      "timestamp": "2026-10-14 09:15",
      "tx_hash": "0x9c2d...4e5f"
    }
  ];

  @override
  Widget build(BuildContext context) {
    final s = AppStrings.of(context);

    final content = isLoading
        ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
        : RefreshIndicator(
            onRefresh: _loadLedger,
            color: AppColors.primary,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 600),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Digital Passbook Hero Card (Deep Purple & Slate Gradient)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF312E81), Color(0xFF4338CA), Color(0xFF6366F1)],
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
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withOpacity(0.18),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: const Icon(Icons.account_balance_wallet, color: Colors.white, size: 20),
                                    ),
                                    const SizedBox(width: 10),
                                    const Text(
                                      'SmartGrama Passbook',
                                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF10B981).withOpacity(0.25),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: const Color(0xFF34D399)),
                                  ),
                                  child: const Text('Live Ledger', style: TextStyle(color: Color(0xFFD1FAE5), fontSize: 10, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),
                            Text(
                              s.totalBalance,
                              style: const TextStyle(color: Colors.white70, fontSize: 13),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Rs. 12,500.00',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 32,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.5,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: const [
                                Text(
                                  'Account: 100456789012 (Samurdhi)',
                                  style: TextStyle(color: Colors.white60, fontSize: 11, fontFamily: 'monospace'),
                                ),
                                Text(
                                  'DID Verified',
                                  style: TextStyle(color: Color(0xFF6EE7B7), fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Quick Action Buttons
                      Row(
                        children: [
                          Expanded(
                            child: _quickActionButton(
                              icon: Icons.qr_code_scanner,
                              label: 'Scan QR',
                              onTap: () {},
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _quickActionButton(
                              icon: Icons.send_rounded,
                              label: 'Transfer',
                              onTap: () {},
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _quickActionButton(
                              icon: Icons.history,
                              label: 'Statement',
                              onTap: _loadLedger,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 28),

                      // Section Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            s.walletLedgerTitle,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            '${ledger.length} Records',
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      if (ledger.isEmpty)
                        Center(
                          child: Padding(
                            padding: const EdgeInsets.all(32),
                            child: Text(s.noTransactions, style: const TextStyle(color: AppColors.textMuted)),
                          ),
                        )
                      else
                        ...ledger.map((tx) {
                          final status = tx['status'] ?? 'Pending';
                          final isApproved = status == 'Active' || status == 'Approved';
                          final isRejected = status == 'Rejected';

                          final Color statusColor = isRejected
                              ? AppColors.danger
                              : (isApproved ? AppColors.welfare : AppColors.warning);
                          final Color statusBg = isRejected
                              ? AppColors.dangerBg
                              : (isApproved ? AppColors.successBg : AppColors.warningBg);
                          final Color statusBorder = isRejected
                              ? AppColors.dangerBorder
                              : (isApproved ? AppColors.successBorder : AppColors.warningBorder);
                          final IconData statusIcon = isRejected
                              ? Icons.cancel
                              : (isApproved ? Icons.check_circle : Icons.hourglass_top);

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 14),
                            child: AppComponents.card(
                              padding: const EdgeInsets.all(18),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(10),
                                        decoration: BoxDecoration(
                                          color: statusBg,
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(color: statusBorder),
                                        ),
                                        child: Icon(statusIcon, color: statusColor, size: 20),
                                      ),
                                      const SizedBox(width: 14),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              tx['loan_type'] ?? 'Loan Facility',
                                              style: const TextStyle(
                                                fontSize: 15,
                                                fontWeight: FontWeight.bold,
                                                color: AppColors.textPrimary,
                                              ),
                                            ),
                                            const SizedBox(height: 2),
                                            Text(
                                              tx['timestamp'] ?? 'Recent',
                                              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                            ),
                                          ],
                                        ),
                                      ),
                                      AppComponents.statusBadge(
                                        label: status,
                                        background: statusBg,
                                        textColor: statusColor,
                                        borderColor: statusBorder,
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 14),
                                  const Divider(height: 1, color: AppColors.border),
                                  const SizedBox(height: 12),

                                  _ledgerRow('Disbursed Amount', 'Rs. ${tx['approved_amount'] ?? 0}', isBold: true),
                                  const SizedBox(height: 8),
                                  _ledgerRow('Repayment Period', '${tx['duration_months'] ?? 0} Months'),

                                  if (isApproved) ...[
                                    const SizedBox(height: 12),
                                    Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: AppColors.successBg,
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(color: AppColors.successBorder),
                                      ),
                                      child: Row(
                                        children: [
                                          const Icon(Icons.shield_outlined, color: AppColors.welfare, size: 16),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              s.officerApproved,
                                              style: const TextStyle(color: AppColors.welfareDark, fontSize: 11, fontWeight: FontWeight.w500),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                    ],
                  ),
                ),
              ),
            ),
          );

    if (widget.isEmbedded) {
      return content;
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppComponents.headerAppBar(
        context,
        title: s.myWalletTitle,
        subtitle: 'Cryptographic Ledger & Disbursed Grants',
        showBack: true,
        showLangPill: true,
      ),
      body: content,
    );
  }

  Widget _quickActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border, width: 1.5),
        ),
        child: Column(
          children: [
            Icon(icon, size: 22, color: AppColors.primary),
            const SizedBox(height: 6),
            Text(
              label,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
            ),
          ],
        ),
      ),
    );
  }

  Widget _ledgerRow(String label, String value, {bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
            color: isBold ? AppColors.textPrimary : AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
