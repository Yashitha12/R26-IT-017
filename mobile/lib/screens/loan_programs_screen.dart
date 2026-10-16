import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_strings.dart';
import '../api_service.dart';
import 'apply_loan_screen.dart';

class LoanProgramsScreen extends StatefulWidget {
  final bool isEmbedded;
  const LoanProgramsScreen({super.key, this.isEmbedded = false});

  @override
  State<LoanProgramsScreen> createState() => _LoanProgramsScreenState();
}

class _LoanProgramsScreenState extends State<LoanProgramsScreen> {
  bool _isLoading = true;
  List<dynamic> _banks = [];
  List<dynamic> _allPrograms = [];
  String? _selectedBankId;

  // Fallback sample loan programs matching web microfinance data
  final List<Map<String, dynamic>> _fallbackPrograms = [
    {
      "id": "lp-001",
      "bank_id": "bank-001",
      "bank_name": "Samurdhi Development Bank",
      "title": "Samurdhi Diriya Cultivation Loan",
      "category": "Agriculture & Farming",
      "apr": "9.5%",
      "limit": "Rs. 250,000",
      "months": "24 Months",
      "features": [
        "Special subsidized interest for rural farmers",
        "No land title mortgage required for loans under Rs. 150K",
        "Direct seasonal balloon repayment flexibility",
        "Instant zero-PII cryptographic eligibility check"
      ]
    },
    {
      "id": "lp-002",
      "bank_id": "bank-001",
      "bank_name": "Samurdhi Development Bank",
      "title": "Micro-Enterprise Equipment Microloan",
      "category": "Small Business",
      "apr": "11.0%",
      "limit": "Rs. 500,000",
      "months": "36 Months",
      "features": [
        "Procurement of machinery, sewing or cottage industry tools",
        "Fast 48-hour Divisional Secretariat review",
        "Flexible monthly amortized EMI payments"
      ]
    },
    {
      "id": "lp-003",
      "bank_id": "bank-002",
      "bank_name": "Sanasa Development Bank",
      "title": "Sanasa Upahara Women Entrepreneur Loan",
      "category": "Women Enterprise",
      "apr": "10.0%",
      "limit": "Rs. 350,000",
      "months": "30 Months",
      "features": [
        "Tailored for self-employed women and craft producers",
        "Community group peer guarantee support",
        "Financial literacy mentoring included"
      ]
    },
    {
      "id": "lp-004",
      "bank_id": "bank-003",
      "bank_name": "Samupakara Cooperative Bank",
      "title": "Cooperative Fishery & Livestock Microcredit",
      "category": "Fishery & Livestock",
      "apr": "10.5%",
      "limit": "Rs. 300,000",
      "months": "24 Months",
      "features": [
        "Support for fishing equipment, dairy cattle, poultry feeds",
        "Low documentation overhead for Grama Niladhari verified residents"
      ]
    }
  ];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final banks = await ApiService.fetchBanks();
      final programs = await ApiService.fetchLoanPrograms();

      if (!mounted) return;
      setState(() {
        _banks = banks.isNotEmpty ? banks : [
          {"id": "bank-001", "name": "Samurdhi Development Bank"},
          {"id": "bank-002", "name": "Sanasa Development Bank"},
          {"id": "bank-003", "name": "Samupakara Cooperative Bank"},
        ];
        _allPrograms = programs.isNotEmpty ? programs : _fallbackPrograms;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _banks = [
          {"id": "bank-001", "name": "Samurdhi Development Bank"},
          {"id": "bank-002", "name": "Sanasa Development Bank"},
          {"id": "bank-003", "name": "Samupakara Cooperative Bank"},
        ];
        _allPrograms = _fallbackPrograms;
        _isLoading = false;
      });
    }
  }

  List<dynamic> get _filteredPrograms {
    if (_selectedBankId == null || _selectedBankId == 'ALL') {
      return _allPrograms;
    }
    return _allPrograms.where((p) => p['bank_id'] == _selectedBankId).toList();
  }

  void _openLoanModal(Map<String, dynamic> loan) {
    final s = AppStrings.of(context);
    final bankName = loan['bank_name'] ?? _banks.firstWhere((b) => b['id'] == loan['bank_id'], orElse: () => {'name': 'Partner Bank'})['name'];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.85,
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 44,
                height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    loan['title'] ?? 'Microfinance Loan',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: AppColors.textSecondary),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            Text(
              bankName,
              style: const TextStyle(fontSize: 13, color: AppColors.primary, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 20),

            // Key Rate Badges
            Row(
              children: [
                Expanded(child: _metricBox(s.aprInterest, loan['apr'] ?? '12% APR', AppColors.primaryLight, AppColors.primary)),
                const SizedBox(width: 12),
                Expanded(child: _metricBox(s.maxLimit, loan['limit'] ?? 'Rs. 250,000', AppColors.successBg, AppColors.welfare)),
                const SizedBox(width: 12),
                Expanded(child: _metricBox(s.maxRepayment, loan['months'] ?? '24 Mos', const Color(0xFFF1F5F9), AppColors.textPrimary)),
              ],
            ),

            const SizedBox(height: 24),
            Text(s.keyFeatures, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
            const SizedBox(height: 12),

            Expanded(
              child: ListView(
                children: (loan['features'] as List? ?? [
                  "Subsidized microfinance rate for rural citizens",
                  "Fast automated credit risk evaluation",
                  "Direct blockchain record on officer approval"
                ]).map((f) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.check_circle, size: 18, color: AppColors.welfare),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          f.toString(),
                          style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.3),
                        ),
                      ),
                    ],
                  ),
                )).toList(),
              ),
            ),

            const SizedBox(height: 16),
            AppComponents.primaryButton(
              label: s.checkAffordability,
              icon: Icons.calculate_outlined,
              backgroundColor: AppColors.accent,
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ApplyLoanScreen(
                      bank: bankName,
                      loanType: loan['title'] ?? 'Agricultural Microloan',
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _metricBox(String label, String value, Color bg, Color text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary), maxLines: 1),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: text)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final s = AppStrings.of(context);

    final content = _isLoading
        ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
        : Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Bank Filter Pills
              Container(
                color: AppColors.surface,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _bankFilterChip('ALL', 'All Banks', s),
                      ..._banks.map((b) => _bankFilterChip(b['id'], b['name'], s)),
                    ],
                  ),
                ),
              ),
              const Divider(height: 1, color: AppColors.border),

              // Program Cards List
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _filteredPrograms.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 14),
                  itemBuilder: (context, index) {
                    final loan = _filteredPrograms[index];
                    return _LoanProgramCard(
                      loan: loan,
                      onTap: () => _openLoanModal(loan),
                    );
                  },
                ),
              ),
            ],
          );

    if (widget.isEmbedded) {
      return content;
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppComponents.headerAppBar(
        context,
        title: s.loanProgramsTitle,
        subtitle: 'Low-Interest Government Microfinance',
        showBack: true,
        showLangPill: true,
      ),
      body: content,
    );
  }

  Widget _bankFilterChip(String id, String label, AppStrings s) {
    final isSelected = (_selectedBankId == null && id == 'ALL') || _selectedBankId == id;

    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        selectedColor: AppColors.primary,
        backgroundColor: AppColors.surfaceSubtle,
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : AppColors.textSecondary,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
          fontSize: 13,
        ),
        side: BorderSide(
          color: isSelected ? AppColors.primary : AppColors.border,
          width: 1,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        onSelected: (selected) {
          setState(() {
            _selectedBankId = id == 'ALL' ? null : id;
          });
        },
      ),
    );
  }
}

class _LoanProgramCard extends StatelessWidget {
  final Map<String, dynamic> loan;
  final VoidCallback onTap;

  const _LoanProgramCard({required this.loan, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final s = AppStrings.of(context);
    final title = loan['title'] ?? 'Microfinance Loan';
    final bank = loan['bank_name'] ?? 'Partner Bank';
    final apr = loan['apr'] ?? '10.5% APR';
    final limit = loan['limit'] ?? 'Rs. 250,000';
    final months = loan['months'] ?? '24 Mos';

    return AppComponents.card(
      padding: const EdgeInsets.all(20),
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      bank,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      title,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.accentLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFC7D2FE), width: 1),
                ),
                child: Text(
                  apr,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.accent,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: 14),

          Row(
            children: [
              _metricPill(Icons.account_balance_wallet_outlined, 'Max: $limit'),
              const SizedBox(width: 14),
              _metricPill(Icons.calendar_month_outlined, 'Tenure: $months'),
            ],
          ),

          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                s.checkAffordability,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: AppColors.accent,
                ),
              ),
              const Icon(Icons.arrow_forward, size: 16, color: AppColors.accent),
            ],
          ),
        ],
      ),
    );
  }

  Widget _metricPill(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 15, color: AppColors.textSecondary),
        const SizedBox(width: 5),
        Text(
          text,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textSecondary),
        ),
      ],
    );
  }
}
