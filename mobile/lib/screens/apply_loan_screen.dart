import 'package:flutter/material.dart';
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
  
  double loanAmount = 50000;
  int duration = 24;
  double monthlyIncome = 0;
  double otherIncome = 0;
  double expenses = 0;
  double savingsBalance = 0;
  int existingLoans = 0;
  int guarantorCount = 1;
  int repaymentHistory = 1;

  bool isLoading = false;

  void _submitApplication() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() {
      isLoading = true;
    });

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
        "guarantor_support_count": guarantorCount
      };

      final prediction = await ApiService.predictLoan(payload);
      
      if (!mounted) return;
      
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => LoanResultScreen(
          prediction: prediction,
          bank: widget.bank,
          loanType: widget.loanType,
        ))
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error predicting loan')),
      );
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Basic calculation for UI purposes
    double estimatedEmi = (loanAmount * 1.15) / duration;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('Apply for ${widget.loanType}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1E293B))),
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: Color(0xFF1E293B)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header text
              const Text('Fill in your financial details below. Our AI evaluates affordability instantly.', style: TextStyle(color: Colors.grey)),
              const SizedBox(height: 24),
              
              // Section 1
              const Text('1. Loan Requirements', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField('Loan Amount (Rs.)', initial: '50000', onSave: (v) => loanAmount = double.parse(v)),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildTextField('Duration (Months)', initial: '24', onSave: (v) => duration = int.parse(v)),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Section 2
              const Text('2. Financial Profile', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _buildTextField('Monthly Income (Rs.) *', onSave: (v) => monthlyIncome = double.parse(v))),
                  const SizedBox(width: 16),
                  Expanded(child: _buildTextField('Other Income (Rs.)', initial: '0', onSave: (v) => otherIncome = double.parse(v))),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _buildTextField('Monthly Expenses (Rs.) *', onSave: (v) => expenses = double.parse(v))),
                  const SizedBox(width: 16),
                  Expanded(child: _buildTextField('Savings Balance (Rs.) *', onSave: (v) => savingsBalance = double.parse(v))),
                ],
              ),
              const SizedBox(height: 24),

              // Section 3
              const Text('3. Guarantor & Credit', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<int>(
                      decoration: _inputDeco(),
                      value: existingLoans,
                      items: const [
                        DropdownMenuItem(value: 0, child: Text('0 (No active loans)')),
                        DropdownMenuItem(value: 1, child: Text('1 Active Loan')),
                        DropdownMenuItem(value: 2, child: Text('2+ Active Loans')),
                      ],
                      onChanged: (v) => setState(() => existingLoans = v!),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: DropdownButtonFormField<int>(
                      decoration: _inputDeco(),
                      value: guarantorCount,
                      items: const [
                        DropdownMenuItem(value: 0, child: Text('0 Guarantors')),
                        DropdownMenuItem(value: 1, child: Text('1 Guarantor')),
                        DropdownMenuItem(value: 2, child: Text('2+ Guarantors')),
                      ],
                      onChanged: (v) => setState(() => guarantorCount = v!),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<int>(
                decoration: _inputDeco().copyWith(labelText: 'Prior Loan Repayment History'),
                value: repaymentHistory,
                items: const [
                  DropdownMenuItem(value: 1, child: Text('Good (No defaults)')),
                  DropdownMenuItem(value: 0, child: Text('Poor (Past defaults)')),
                ],
                onChanged: (v) => setState(() => repaymentHistory = v!),
              ),
              
              const SizedBox(height: 32),

              // EMI Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFFF3E8FF), // Light purple
                  border: Border.all(color: const Color(0xFFD8B4FE)),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('ESTIMATED MONTHLY EMI', style: TextStyle(color: Color(0xFF4C1D95), fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text('Rs. ${estimatedEmi.toStringAsFixed(0)}', style: const TextStyle(color: Color(0xFF7E22CE), fontSize: 32, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    const Text('Interest Rate: 15% APR', style: TextStyle(color: Color(0xFF6B21A8), fontSize: 12)),
                  ],
                ),
              ),
              
              const SizedBox(height: 16),

              // Blockchain protected badge
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFDCFCE7), // Light green
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF86EFAC)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.shield_outlined, color: Color(0xFF166534)),
                    SizedBox(width: 12),
                    Expanded(child: Text('Blockchain Protected: Your application data is securely recorded on the SmartGrama distributed ledger.', style: TextStyle(color: Color(0xFF166534), fontSize: 12))),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: isLoading ? null : _submitApplication,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF3B82F6), // Blue submit button
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: isLoading 
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Submit Application', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(String label, {String? initial, required Function(String) onSave}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.black87)),
        const SizedBox(height: 6),
        TextFormField(
          initialValue: initial,
          decoration: _inputDeco(),
          keyboardType: TextInputType.number,
          validator: (value) => value == null || value.isEmpty ? 'Required' : null,
          onSaved: (value) => onSave(value!),
        ),
      ],
    );
  }

  InputDecoration _inputDeco() {
    return InputDecoration(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFF1D4ED8)),
      ),
      filled: true,
      fillColor: Colors.white,
    );
  }
}
