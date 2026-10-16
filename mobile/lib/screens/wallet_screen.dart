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
  List<dynamic> welfareApps = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadLedger();
  }

  Future<void> _loadLedger() async {
    try {
      final ledgerData = await ApiService.fetchLedger();
      List<dynamic> wApps = [];
      try {
        final allApps = await ApiService.fetchAllApplications();
        wApps = allApps['welfare'] ?? [];
      } catch (_) {}

      if (!mounted) return;
      setState(() {
        ledger = ledgerData.isNotEmpty ? ledgerData : _sampleTransactions;
        welfareApps = wApps;
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
      "status": "Active",
      "type": "welfare",
      "timestamp": "2026-10-16 15:15",
      "tx_hash": "0x9c2d...4e5f"
    }
  ];

  List<dynamic> get approvedWelfare {
    final list = <dynamic>[];
    for (var w in welfareApps) {
      final status = (w['status'] ?? '').toString().toLowerCase();
      if (status.contains('approved') || status.contains('disbursement') || status.contains('active')) {
        list.add(w);
      }
    }
    // Also include from ledger if not present
    for (var tx in ledger) {
      final isWelfare = tx['type'] == 'welfare' || (tx['loan_type']?.toString().toLowerCase().contains('aswesuma') ?? false);
      final isApproved = tx['status'] == 'Active' || tx['status'] == 'Approved';
      final assessId = tx['assessment_id'] ?? '';
      if (isWelfare && isApproved) {
        if (!list.any((item) => (item['assessment_id'] ?? '') == assessId && assessId.isNotEmpty)) {
          list.add({
            'assessment_id': assessId.isNotEmpty ? assessId : 'ASW-959157',
            'tier': (tx['loan_type']?.toString().contains('POOR') ?? false) ? 'POOR' : 'POOR',
            'monthly_stipend': tx['approved_amount'] ?? 8500.0,
            'status': 'Approved for Disbursement (Blockchain Anchored)',
            'applicant_name': tx['applicant_name'] ?? 'Citizen Beneficiary',
          });
        }
      }
    }
    return list;
  }

  double get baseSavings => 8000.0;
  double get baseSamurdhi => 4500.0;

  double get approvedAswesumaTotal {
    double total = 0.0;
    for (var w in approvedWelfare) {
      total += double.tryParse(w['monthly_stipend']?.toString() ?? '0') ?? 0.0;
    }
    return total;
  }

  double get totalWelfareBalance => baseSamurdhi + approvedAswesumaTotal;
  double get totalAvailableBalance => baseSavings + totalWelfareBalance;

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
                      // Digital Passbook Hero Card (Deep Indigo & Violet Gradient)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(22),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF312E81), Color(0xFF4338CA), Color(0xFF6366F1)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(22),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x303730A3),
                              blurRadius: 18,
                              offset: Offset(0, 8),
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
                            const SizedBox(height: 20),
                            Text(
                              s.totalBalance,
                              style: const TextStyle(color: Colors.white70, fontSize: 13),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Rs. ${totalAvailableBalance.toStringAsFixed(2)}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 32,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.5,
                              ),
                            ),
                            const SizedBox(height: 16),
                            // Sub-balances Breakdown
                            Row(
                              children: [
                                Expanded(
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.10),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: Colors.white.withOpacity(0.15)),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          s.isSinhala ? 'පුද්ගලික ඉතිරිකිරීම්' : 'LKR Savings',
                                          style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.w600),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          'Rs. ${baseSavings.toStringAsFixed(2)}',
                                          style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF10B981).withOpacity(0.20),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: const Color(0xFF34D399).withOpacity(0.5)),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          s.isSinhala ? 'සුබසාධන දීමනා' : 'Welfare Grants',
                                          style: const TextStyle(color: Color(0xFFD1FAE5), fontSize: 10, fontWeight: FontWeight.w600),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          'Rs. ${totalWelfareBalance.toStringAsFixed(2)}',
                                          style: const TextStyle(color: Color(0xFF6EE7B7), fontSize: 14, fontWeight: FontWeight.w800),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  approvedWelfare.isNotEmpty
                                      ? 'Account: 100456789012 (Samurdhi + Aswesuma DBT)'
                                      : 'Account: 100456789012 (Samurdhi)',
                                  style: const TextStyle(color: Colors.white60, fontSize: 10, fontFamily: 'monospace'),
                                ),
                                const Text(
                                  'DID Verified',
                                  style: TextStyle(color: Color(0xFF6EE7B7), fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 20),

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

                      const SizedBox(height: 26),

                      // Government Welfare Grants Section (Identical to Web Experience)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF10B981).withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(Icons.volunteer_activism, color: Color(0xFF059669), size: 18),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                s.isSinhala ? 'රජයේ සුබසාධන දීමනා' : 'Government Welfare Grants',
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withOpacity(0.12),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFF34D399)),
                            ),
                            child: const Text('Direct DBT', style: TextStyle(color: Color(0xFF047857), fontSize: 10, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Dynamic Approved Aswesuma Grants Card
                      if (approvedWelfare.isNotEmpty)
                        ...approvedWelfare.map((app) => Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFFECFDF5), Color(0xFFD1FAE5)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFF6EE7B7), width: 1.5),
                            boxShadow: const [
                              BoxShadow(color: Color(0x0F059669), blurRadius: 10, offset: Offset(0, 4)),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      'Aswesuma Household Benefit (${app['tier'] ?? 'POOR'})',
                                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF064E3B)),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF059669),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Text('✓ Active & Disbursed', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Rs. ${double.tryParse(app['monthly_stipend']?.toString() ?? '8500')?.toStringAsFixed(2) ?? '8,500.00'} / mo',
                                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF047857)),
                              ),
                              const SizedBox(height: 8),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.85),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Officer Status: ${app['status'] ?? 'Approved for Disbursement'}',
                                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF166534)),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      'ID: ${app['assessment_id'] ?? 'ASW-959157'} • Direct benefit transfer to DID wallet',
                                      style: const TextStyle(fontSize: 10, color: Color(0xFF047857)),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        )),

                      // Monthly Samurdhi Baseline Card
                      Container(
                        margin: const EdgeInsets.only(bottom: 24),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0FDF4),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFBBF7D0)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  s.isSinhala ? 'මාසික සමෘද්ධි සහනාධාරය' : 'Monthly Samurdhi Relief',
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF064E3B)),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  s.isSinhala ? 'සමෘද්ධි බැංකු ගිණුම වෙත සෘජුව බැර කෙරේ' : 'Direct credit to Samurdhi Passbook',
                                  style: const TextStyle(fontSize: 11, color: Color(0xFF166534)),
                                ),
                              ],
                            ),
                            const Text(
                              'Rs. 4,500.00 / mo',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF047857)),
                            ),
                          ],
                        ),
                      ),

                      // Blockchain Transaction History / Ledger Section Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            s.walletLedgerTitle,
                            style: const TextStyle(
                              fontSize: 15,
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
                          final isWelfare = tx['type'] == 'welfare' || (tx['loan_type']?.toString().toLowerCase().contains('aswesuma') ?? false);

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
                              : (isWelfare
                                  ? Icons.volunteer_activism
                                  : (isApproved ? Icons.check_circle : Icons.hourglass_top));

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
                                          color: isWelfare ? const Color(0xFFECFDF5) : statusBg,
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(color: isWelfare ? const Color(0xFF6EE7B7) : statusBorder),
                                        ),
                                        child: Icon(statusIcon, color: isWelfare ? const Color(0xFF059669) : statusColor, size: 20),
                                      ),
                                      const SizedBox(width: 14),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              tx['loan_type'] ?? (isWelfare ? 'Aswesuma Grant' : 'Loan Facility'),
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
                                        label: isApproved ? 'Active' : status,
                                        background: isWelfare ? const Color(0xFFDCFCE7) : statusBg,
                                        textColor: isWelfare ? const Color(0xFF166534) : statusColor,
                                        borderColor: isWelfare ? const Color(0xFF86EFAC) : statusBorder,
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 14),
                                  const Divider(height: 1, color: AppColors.border),
                                  const SizedBox(height: 12),

                                  _ledgerRow(
                                    isWelfare ? 'Disbursed Monthly Grant' : 'Disbursed Amount',
                                    '${isWelfare ? "+ " : ""}Rs. ${tx['approved_amount'] ?? 0}',
                                    isBold: true,
                                    valueColor: isWelfare ? const Color(0xFF047857) : null,
                                  ),
                                  const SizedBox(height: 8),
                                  _ledgerRow(
                                    isWelfare ? 'Disbursement Channel' : 'Repayment Period',
                                    isWelfare ? 'Direct Benefit Transfer (DBT)' : '${tx['duration_months'] ?? 0} Months',
                                  ),

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
                                              isWelfare
                                                  ? (s.isSinhala ? 'නිලධාරියා විසින් අනුමත කරන ලදී. ඩිජිටල් පසුම්බියට මුදල් බැර කර ඇත.' : 'Officer verified & approved. Disbursed directly to DID Wallet.')
                                                  : s.officerApproved,
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

  Widget _ledgerRow(String label, String value, {bool isBold = false, Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
            color: valueColor ?? (isBold ? AppColors.textPrimary : AppColors.textSecondary),
          ),
        ),
      ],
    );
  }
}
