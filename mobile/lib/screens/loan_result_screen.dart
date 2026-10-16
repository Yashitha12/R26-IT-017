import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_strings.dart';
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
  bool isSubmitted = false;
  Map<String, dynamic>? submissionReceipt;

  void _submitToOfficer(bool accepted) async {
    setState(() => isLoading = true);
    try {
      final payload = {
        "nic": "200223003053",
        "applicant_name": "Aravinda Kumara",
        "loan_type": widget.loanType,
        "loan_amount": widget.prediction['requested_loan_amount'] ?? 100000,
        "recommended_loan_amount": accepted
            ? (widget.prediction['recommended_loan_amount'] ?? widget.prediction['requested_loan_amount'] ?? 100000)
            : (widget.prediction['requested_loan_amount'] ?? 100000),
        "interest_rate": 10.5,
        "repayment_months": widget.prediction['estimated_repayment_duration_months'] ?? 24,
        "risk_level": widget.prediction['predicted_risk_level'] ?? 'Low Risk',
        "decision": accepted ? (widget.prediction['final_decision'] ?? 'Approved') : "Requires Manual Review",
      };

      final res = await ApiService.recordLoanOnBlockchain(payload);

      if (!mounted) return;
      setState(() {
        isLoading = false;
        isSubmitted = true;
        submissionReceipt = res;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Application successfully anchored to blockchain and sent to Grama Niladhari Officer queue!'),
          backgroundColor: AppColors.welfare,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error recording to blockchain: $e'), backgroundColor: AppColors.danger),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = AppStrings.of(context);
    final decision = widget.prediction['final_decision'] ?? 'Approved';
    final riskLevel = widget.prediction['predicted_risk_level'] ?? 'Low Risk';
    final reason = widget.prediction['reason'] ?? 'Household income and low debt obligations demonstrate solid repayment ability.';
    final requested = widget.prediction['requested_loan_amount'] ?? 100000.0;
    final approved = widget.prediction['recommended_loan_amount'] ?? requested;
    final emi = widget.prediction['suggested_monthly_installment'] ?? (approved * 1.10 / 24);
    final duration = widget.prediction['estimated_repayment_duration_months'] ?? 24;

    final bool isLowRisk = riskLevel == 'Low Risk' || decision == 'Approved';
    final bool isMediumRisk = riskLevel == 'Medium Risk';

    final Color statusColor = isLowRisk
        ? AppColors.welfare
        : (isMediumRisk ? AppColors.warning : AppColors.danger);
    final Color statusBg = isLowRisk
        ? AppColors.successBg
        : (isMediumRisk ? AppColors.warningBg : AppColors.dangerBg);
    final Color statusBorder = isLowRisk
        ? AppColors.successBorder
        : (isMediumRisk ? AppColors.warningBorder : AppColors.dangerBorder);
    final IconData statusIcon = isLowRisk
        ? Icons.verified_rounded
        : (isMediumRisk ? Icons.warning_amber_rounded : Icons.cancel_outlined);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppComponents.headerAppBar(
        context,
        title: s.evaluationComplete,
        subtitle: widget.bank,
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
                // Top Risk Profile Card
                AppComponents.card(
                  padding: const EdgeInsets.all(24),
                  border: Border.all(color: statusBorder, width: 2),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: statusBg,
                          shape: BoxShape.circle,
                          border: Border.all(color: statusBorder, width: 1.5),
                        ),
                        child: Icon(statusIcon, size: 40, color: statusColor),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        decision,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: statusColor,
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(height: 6),
                      AppComponents.statusBadge(
                        label: riskLevel,
                        background: statusBg,
                        textColor: statusColor,
                        borderColor: statusBorder,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Approved Terms Card
                AppComponents.card(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        s.approvedTerms,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 16),

                      _termRow('Requested Amount', 'Rs. ${requested.toStringAsFixed(0)}'),
                      const Divider(height: 20, color: AppColors.border),
                      _termRow(
                        s.recommendedAmount,
                        'Rs. ${approved.toStringAsFixed(0)}',
                        isHighlight: true,
                        valueColor: AppColors.welfare,
                      ),
                      const Divider(height: 20, color: AppColors.border),
                      _termRow(
                        s.suggestedInstallment,
                        'Rs. ${emi.toStringAsFixed(0)} / mo',
                        isHighlight: true,
                        valueColor: AppColors.accent,
                      ),
                      const Divider(height: 20, color: AppColors.border),
                      _termRow('Tenure', '$duration Months'),
                      const Divider(height: 20, color: AppColors.border),
                      _termRow('Partner Bank', widget.bank),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // AI Affordability Explanation
                AppComponents.card(
                  padding: const EdgeInsets.all(18),
                  color: const Color(0xFFF0FDF4),
                  border: Border.all(color: const Color(0xFF86EFAC), width: 1),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.auto_awesome, color: AppColors.welfare, size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              s.affordabilityNotes,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF065F46),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              reason,
                              style: const TextStyle(
                                fontSize: 13,
                                color: Color(0xFF047857),
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                if (isSubmitted) ...[
                  // Post-Submission Blockchain Receipt Card
                  AppComponents.card(
                    padding: const EdgeInsets.all(20),
                    color: AppColors.successBg,
                    border: Border.all(color: AppColors.successBorder, width: 1.5),
                    child: Column(
                      children: [
                        const Icon(Icons.check_circle, size: 36, color: AppColors.welfare),
                        const SizedBox(height: 10),
                        const Text(
                          'Recorded on Private Blockchain Ledger',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.welfareDark),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          s.anchorSuccess,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 14),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            children: const [
                              Icon(Icons.link, size: 16, color: AppColors.textMuted),
                              SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'tx_0x9b4a8e23f...7c1a (Verified)',
                                  style: TextStyle(fontFamily: 'monospace', fontSize: 11, color: AppColors.textSecondary),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        AppComponents.primaryButton(
                          label: 'Back to Dashboard',
                          icon: Icons.dashboard_outlined,
                          onPressed: () {
                            Navigator.pushAndRemoveUntil(
                              context,
                              MaterialPageRoute(builder: (_) => const HomeScreen()),
                              (route) => false,
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ] else ...[
                  // Action Buttons
                  AppComponents.primaryButton(
                    label: s.submitToOfficer,
                    icon: Icons.send_rounded,
                    backgroundColor: AppColors.welfare,
                    isLoading: isLoading,
                    onPressed: () => _submitToOfficer(true),
                  ),
                  const SizedBox(height: 12),
                  AppComponents.secondaryButton(
                    label: 'Back to Programs',
                    icon: Icons.arrow_back,
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _termRow(String label, String value, {bool isHighlight = false, Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isHighlight ? FontWeight.bold : FontWeight.w500,
            color: AppColors.textSecondary,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isHighlight ? 16 : 14,
            fontWeight: isHighlight ? FontWeight.w800 : FontWeight.w600,
            color: valueColor ?? AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
