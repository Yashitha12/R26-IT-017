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
        ledger = data;
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
      body: isLoading 
        ? const Center(child: CircularProgressIndicator())
        : RefreshIndicator(
            onRefresh: _loadLedger,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
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
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Loan Applications', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                      Text('${ledger.length} active', style: TextStyle(color: Colors.grey[600], fontSize: 14)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  
                  if (ledger.isEmpty)
                    const Center(child: Padding(padding: EdgeInsets.all(16), child: Text("No loan applications found.")))
                  else
                    ...ledger.map((tx) {
                      final status = tx['status'] ?? 'Pending';
                      final isApproved = status == 'Active';
                      final isRejected = status == 'Rejected';
                      
                      Color statusColor = isRejected ? Colors.red : (isApproved ? const Color(0xFF10B981) : Colors.orange);
                      IconData statusIcon = isRejected ? Icons.cancel : (isApproved ? Icons.check_circle : Icons.pending);

                      return Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: isApproved ? const Color(0xFF10B981).withOpacity(0.5) : Colors.transparent, width: 2),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
                        ),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                                  child: Icon(statusIcon, color: statusColor),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(tx['loan_type'] ?? 'Loan', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                      Text(tx['timestamp'] ?? '', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),
                            _DetailRow('Amount', 'Rs. ${tx['approved_amount'] ?? 0}', isBold: true),
                            const SizedBox(height: 12),
                            _DetailRow('Duration', '${tx['duration_months'] ?? 0} months', isBold: false),
                            const SizedBox(height: 12),
                            _DetailRow('Status', status, isBold: true, valueColor: statusColor),
                            if (isApproved) ...[
                              const SizedBox(height: 16),
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(8)),
                                child: const Row(
                                  children: [
                                    Icon(Icons.info, color: Color(0xFF16A34A), size: 16),
                                    SizedBox(width: 8),
                                    Expanded(child: Text('Officer approved this loan. Funds are ready.', style: TextStyle(color: Color(0xFF16A34A), fontSize: 12))),
                                  ],
                                ),
                              )
                            ]
                          ],
                        ),
                      );
                    }).toList(),
                ],
              ),
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
