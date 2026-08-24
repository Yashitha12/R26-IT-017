import 'package:flutter/material.dart';
import '../api_service.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

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
        ledger = data['ledger'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Wallet', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF1E293B))),
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
            // Top Purple Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF9333EA), Color(0xFF4C1D95)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Icon(Icons.account_balance_wallet, color: Colors.white, size: 28),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: const [
                          Text('Total Balance', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500)),
                          SizedBox(height: 4),
                          Text('Rs. 12,500', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text('Savings', style: TextStyle(color: Colors.white, fontSize: 12)),
                              SizedBox(height: 4),
                              Text('Rs. 8,000', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text('Welfare', style: TextStyle(color: Colors.white, fontSize: 12)),
                              SizedBox(height: 4),
                              Text('Rs. 4,500', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  )
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text('Active Loans', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            const SizedBox(height: 12),
            // Active Loan Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 2))],
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(color: const Color(0xFF1D4ED8), borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.trending_up, color: Colors.white),
                      ),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Agricultural Microloan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          Text('Approved on Apr 15, 2026', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _DetailRow('Loan Amount', 'Rs. 150,000', isBold: false),
                  const SizedBox(height: 12),
                  _DetailRow('Remaining Balance', 'Rs. 142,500', isBold: false, valueColor: const Color(0xFFEA580C)),
                  const SizedBox(height: 12),
                  _DetailRow('Monthly Installment', 'Rs. 3,750', isBold: false),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Repayment Progress', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                      Text('2/48 months', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: 2/48,
                    backgroundColor: Colors.grey[200],
                    color: const Color(0xFF10B981),
                    minHeight: 8,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  const SizedBox(height: 20),
                  const Divider(height: 1),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('Next Payment', style: TextStyle(color: Color(0xFF1E293B))),
                      Text('June 1, 2026', style: TextStyle(color: Color(0xFF1D4ED8), fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            const Text('Welfare Support', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            const SizedBox(height: 12),
            // Welfare Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                border: Border.all(color: const Color(0xFF86EFAC)),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(color: const Color(0xFF10B981), borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.card_giftcard, color: Colors.white),
                      ),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Monthly Samurdhi Support', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF064E3B))),
                          Text('Active since Jan 2026', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  const Divider(color: Color(0xFF86EFAC)),
                  const SizedBox(height: 16),
                  _DetailRow('Monthly Amount', 'Rs. 4,500', isBold: true, valueColor: const Color(0xFF10B981)),
                  const SizedBox(height: 12),
                  _DetailRow('Last Payment', 'May 1, 2026', isBold: false),
                  const SizedBox(height: 12),
                  _DetailRow('Next Payment', 'June 1, 2026', isBold: true, valueColor: const Color(0xFF10B981)),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            const Text('Recent Transactions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            const SizedBox(height: 12),
            
            Container(
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
                    decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.arrow_downward, color: Color(0xFF16A34A), size: 20),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Welfare Payment', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        Text('May 1, 2026', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                      ],
                    ),
                  ),
                  const Text('+Rs. 4,500', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF16A34A), fontSize: 14)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isBold;
  final Color? valueColor;

  const _DetailRow(this.label, this.value, {this.isBold = false, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
        Text(
          value,
          style: TextStyle(
            color: valueColor ?? const Color(0xFF1E293B),
            fontSize: 13,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
