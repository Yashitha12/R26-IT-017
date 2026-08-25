import 'package:flutter/material.dart';
import '../api_service.dart';
import 'home_screen.dart';

class LoanResultScreen extends StatefulWidget {
  final Map<String, dynamic> prediction;
  final String bank;
  final String loanType;

  const LoanResultScreen({
    super.key,
    required this.prediction,
    required this.bank,
    required this.loanType,
  });

  @override
  State<LoanResultScreen> createState() => _LoanResultScreenState();
}

class _LoanResultScreenState extends State<LoanResultScreen> {
  bool isLoading = false;

  void _submitToOfficer(bool accepted) async {
    setState(() => isLoading = true);
    try {
      final payload = {
        "nic": "981234567V",
        "applicant_name": "Nimal Perera",
        "loan_type": widget.loanType,
        "loan_amount": widget.prediction['requested_loan_amount'] ?? 0,
        "recommended_loan_amount": accepted 
            ? widget.prediction['recommended_loan_amount'] 
            : widget.prediction['requested_loan_amount'],
        "interest_rate": 15.0,
        "repayment_months": widget.prediction['estimated_repayment_duration_months'] ?? 24,
        "risk_level": widget.prediction['predicted_risk_level'],
        "decision": accepted ? widget.prediction['final_decision'] : "Requires Manual Review"
      };

      await ApiService.recordLoanOnBlockchain(payload);

      if (!mounted) return;
      setState(() => isLoading = false);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Application Submitted Successfully to Officer Dashboard!')),
      );
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const HomeScreen()),
        (route) => false,
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error submitting application')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final decision = widget.prediction['final_decision'] ?? 'Pending';
    final riskLevel = widget.prediction['predicted_risk_level'] ?? 'Unknown';
    final reason = widget.prediction['reason'] ?? '';
    final requested = widget.prediction['requested_loan_amount'] ?? 0.0;
    final approved = widget.prediction['recommended_loan_amount'] ?? 0.0;
    final emi = widget.prediction['suggested_monthly_installment'] ?? 0.0;
    final duration = widget.prediction['estimated_repayment_duration_months'] ?? 0;

    bool isWarning = riskLevel == 'Medium Risk' || decision.contains('Caution');
    bool isDanger = riskLevel == 'High Risk' || decision == 'Rejected';

    Color statusColor = isDanger ? Colors.red : (isWarning ? Colors.orange : Colors.green);
    IconData statusIcon = isDanger ? Icons.cancel : (isWarning ? Icons.warning_rounded : Icons.check_circle);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Evaluation Complete', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1E293B))),
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: Color(0xFF1E293B)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: statusColor,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(statusIcon, color: Colors.white, size: 24),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(decision, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
                            const Text('SmartGrama AI Evaluation Complete', style: TextStyle(color: Colors.grey, fontSize: 12)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  // AI Reasoning
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border(left: BorderSide(color: statusColor, width: 4)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('AI REASONING', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                        const SizedBox(height: 4),
                        Text(reason, style: const TextStyle(fontSize: 14, color: Colors.black87)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text('Detailed Assessment', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey.shade200),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Predicted Risk Profile', style: TextStyle(fontSize: 10, color: Colors.grey)),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Icon(Icons.shield, size: 14, color: statusColor),
                                  const SizedBox(width: 4),
                                  Text(riskLevel, style: TextStyle(fontWeight: FontWeight.bold, color: statusColor)),
                                ],
                              )
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey.shade200),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Requested Amount', style: TextStyle(fontSize: 10, color: Colors.grey)),
                              const SizedBox(height: 4),
                              Text('Rs. ${requested.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  )
                ],
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Final Terms Card (Purple)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFFF3E8FF), // Light purple
                border: Border.all(color: const Color(0xFFD8B4FE)),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('FINAL APPROVED TERMS', style: TextStyle(color: Color(0xFF4C1D95), fontSize: 10, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  const Text('Approved Amount', style: TextStyle(color: Color(0xFF6B21A8), fontSize: 12)),
                  Text('Rs. ${approved.toStringAsFixed(0)}', style: const TextStyle(color: Color(0xFF7E22CE), fontSize: 32, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  const Divider(color: Color(0xFFE9D5FF)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Monthly EMI', style: TextStyle(color: Color(0xFF6B21A8), fontSize: 12)),
                      Text('Rs. ${emi.toStringAsFixed(0)}', style: const TextStyle(color: Color(0xFF4C1D95), fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Duration', style: TextStyle(color: Color(0xFF6B21A8), fontSize: 12)),
                      Text('$duration months', style: const TextStyle(color: Color(0xFF4C1D95), fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Interest Rate', style: TextStyle(color: Color(0xFF6B21A8), fontSize: 12)),
                      Text('15% APR', style: TextStyle(color: Color(0xFF4C1D95), fontWeight: FontWeight.bold)),
                    ],
                  )
                ],
              ),
            ),

            const SizedBox(height: 32),

            if (isLoading)
              const Center(child: CircularProgressIndicator())
            else ...[
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () => _submitToOfficer(true),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF3B82F6),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Accept & Send to Officer', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: OutlinedButton(
                  onPressed: () => _submitToOfficer(false),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.red),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Reject Terms & Request Review', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.red)),
                ),
              ),
            ],
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
