import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_strings.dart';
import '../api_service.dart';
import 'loan_result_screen.dart';

class ApplyLoanScreen extends StatefulWidget {
  final String bank;
  final String loanType;

  const ApplyLoanScreen({super.key, required this.bank, required this.loanType});

  @override
  State<ApplyLoanScreen> createState() => _ApplyLoanScreenState();
}

class _ApplyLoanScreenState extends State<ApplyLoanScreen> {
  final _formKey = GlobalKey<FormState>();

  double loanAmount = 100000;
  int duration = 24;
  double monthlyIncome = 65000;
  double otherIncome = 15000;
  double expenses = 35000;
  double savingsBalance = 40000;
  int existingLoans = 0;
  int guarantorCount = 1;
  int repaymentHistory = 1; // 1 = good / on-time, 0 = delayed

  bool isLoading = false;

  void _submitApplication() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => isLoading = true);

    try {
      final payload = {
        "monthly_income": monthlyIncome,
        "other_income": otherIncome,
        "expenses": expenses,
        "loan_amount": loanAmount,
        "loan_type": widget.loanType,
        "savings_balance": savingsBalance,
        "existing_loans": existingLoans,
        "repayment_history": repaymentHistory,
        "guarantor_support_count": guarantorCount,
      };

      final prediction = await ApiService.predictLoan(payload);

      if (!mounted) return;

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => LoanResultScreen(
            prediction: prediction,
            bank: widget.bank,
            loanType: widget.loanType,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('AI Model Evaluation error: $e'),
          backgroundColor: AppColors.danger,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = AppStrings.of(context);
    final double estimatedEmi = (loanAmount * 1.10) / duration;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppComponents.headerAppBar(
        context,
        title: s.applyLoanHeading,
        subtitle: widget.bank,
        showBack: true,
        showLangPill: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Selected Program Banner Card
                  AppComponents.card(
                    padding: const EdgeInsets.all(18),
                    color: AppColors.primaryLight,
                    border: Border.all(color: const Color(0xFFC7D2FE), width: 1.5),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.accent,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.account_balance, color: Colors.white, size: 22),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.loanType,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                widget.bank,
                                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Real-time EMI Estimation Box
                  AppComponents.card(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              s.loanAmountRequested,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                            ),
                            Text(
                              'Rs. ${loanAmount.toStringAsFixed(0)}',
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.accent),
                            ),
                          ],
                        ),
                        Slider(
                          value: loanAmount,
                          min: 25000,
                          max: 300000,
                          divisions: 11,
                          activeColor: AppColors.accent,
                          inactiveColor: AppColors.border,
                          label: 'Rs. ${loanAmount.toStringAsFixed(0)}',
                          onChanged: (val) {
                            setState(() => loanAmount = val);
                          },
                        ),
                        const SizedBox(height: 12),

                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              s.repaymentMonths,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                            ),
                            Text(
                              '$duration Months',
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [12, 18, 24, 36].map((m) {
                            final isSel = duration == m;
                            return Expanded(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                child: ChoiceChip(
                                  label: Text('$m m'),
                                  selected: isSel,
                                  selectedColor: AppColors.accent,
                                  backgroundColor: AppColors.surfaceSubtle,
                                  labelStyle: TextStyle(
                                    color: isSel ? Colors.white : AppColors.textPrimary,
                                    fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                                    fontSize: 12,
                                  ),
                                  side: BorderSide(color: isSel ? AppColors.accent : AppColors.border),
                                  onSelected: (_) => setState(() => duration = m),
                                ),
                              ),
                            );
                          }).toList(),
                        ),

                        const SizedBox(height: 16),
                        const Divider(height: 1, color: AppColors.border),
                        const SizedBox(height: 14),

                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.successBg,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.successBorder, width: 1),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                s.estimatedEmi,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.successText),
                              ),
                              Text(
                                'Rs. ${estimatedEmi.toStringAsFixed(0)} / mo',
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.successText),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Income & Household Finances Card
                  AppComponents.card(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Household Financial Capacity',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Verified financial values evaluated by the AI affordability engine.',
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 20),

                        Row(
                          children: [
                            Expanded(
                              child: _numberInput(
                                label: s.monthlyIncomeField,
                                initial: monthlyIncome.toStringAsFixed(0),
                                prefix: 'Rs. ',
                                onSaved: (v) => monthlyIncome = double.tryParse(v!) ?? monthlyIncome,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _numberInput(
                                label: s.otherIncome,
                                initial: otherIncome.toStringAsFixed(0),
                                prefix: 'Rs. ',
                                onSaved: (v) => otherIncome = double.tryParse(v!) ?? otherIncome,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),

                        Row(
                          children: [
                            Expanded(
                              child: _numberInput(
                                label: s.monthlyExpensesField,
                                initial: expenses.toStringAsFixed(0),
                                prefix: 'Rs. ',
                                onSaved: (v) => expenses = double.tryParse(v!) ?? expenses,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _numberInput(
                                label: s.savingsBalance,
                                initial: savingsBalance.toStringAsFixed(0),
                                prefix: 'Rs. ',
                                onSaved: (v) => savingsBalance = double.tryParse(v!) ?? savingsBalance,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Credit Factors & Guarantors
                  AppComponents.card(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Credit Risk & Guarantees',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 16),

                        Row(
                          children: [
                            Expanded(
                              child: _numberInput(
                                label: s.existingLoansCount,
                                initial: existingLoans.toString(),
                                onSaved: (v) => existingLoans = int.tryParse(v!) ?? existingLoans,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _numberInput(
                                label: s.guarantorCount,
                                initial: guarantorCount.toString(),
                                onSaved: (v) => guarantorCount = int.tryParse(v!) ?? guarantorCount,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              s.repaymentTrackRecord,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                            ),
                            const SizedBox(height: 8),
                            DropdownButtonFormField<int>(
                              value: repaymentHistory,
                              decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12)),
                              items: const [
                                DropdownMenuItem(value: 1, child: Text('Excellent / Always On-Time')),
                                DropdownMenuItem(value: 0, child: Text('Delayed / Needs Support')),
                              ],
                              onChanged: (v) => setState(() => repaymentHistory = v ?? 1),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Primary Evaluate Button
                  AppComponents.primaryButton(
                    label: s.runAiAssessment,
                    icon: Icons.auto_awesome,
                    backgroundColor: AppColors.accent,
                    isLoading: isLoading,
                    onPressed: _submitApplication,
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _numberInput({
    required String label,
    required String initial,
    String? prefix,
    required FormFieldSetter<String> onSaved,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 6),
        TextFormField(
          initialValue: initial,
          keyboardType: TextInputType.number,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
          decoration: InputDecoration(
            prefixText: prefix,
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          ),
          validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
          onSaved: onSaved,
        ),
      ],
    );
  }
}
