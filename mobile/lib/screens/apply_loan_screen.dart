import 'package:flutter/material.dart';
import '../api_service.dart';

class ApplyLoanScreen extends StatefulWidget {
  const ApplyLoanScreen({super.key});

  @override
  State<ApplyLoanScreen> createState() => _ApplyLoanScreenState();
}

class _ApplyLoanScreenState extends State<ApplyLoanScreen> {
  final _formKey = GlobalKey<FormState>();
  
  double loanAmount = 150000;
  int duration = 48;
  bool isLoading = false;

  void _submitApplication() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() {
      isLoading = true;
    });

    try {
      final payload = {
        "monthly_income": 45000,
        "other_income": 0,
        "expenses": 25000,
        "loan_amount": loanAmount,
        "loan_type": "Agricultural Microloan",
        "savings_balance": 8000,
        "existing_loans": 0,
        "repayment_history": 1,
        "guarantor_support_count": 1
      };

      final prediction = await ApiService.predictLoan(payload);
      
      if (!mounted) return;
      
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(prediction['final_decision'] ?? 'Result'),
          content: Text(prediction['reason'] ?? ''),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context);
              },
              child: const Text('OK'),
            ),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error predicting loan')),
      );
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Loan Application', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF1E293B))),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Loan Amount (Rs.)', style: TextStyle(fontSize: 14, color: Color(0xFF1E293B))),
              const SizedBox(height: 8),
              TextFormField(
                initialValue: '150000',
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF1D4ED8)),
                  ),
                ),
                keyboardType: TextInputType.number,
                validator: (value) => value!.isEmpty ? 'Required' : null,
                onSaved: (value) => loanAmount = double.parse(value!),
              ),
              const SizedBox(height: 24),
              
              const Text('Duration (Months)', style: TextStyle(fontSize: 14, color: Color(0xFF1E293B))),
              const SizedBox(height: 8),
              TextFormField(
                initialValue: '48',
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF1D4ED8)),
                  ),
                ),
                keyboardType: TextInputType.number,
                validator: (value) => value!.isEmpty ? 'Required' : null,
                onSaved: (value) => duration = int.parse(value!),
              ),
              const SizedBox(height: 32),
              
              // EMI Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFFF3E8FF), // Light purple background
                  border: Border.all(color: const Color(0xFFD8B4FE)),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Estimated Monthly EMI', style: TextStyle(color: Color(0xFF4C1D95), fontSize: 14)),
                    const SizedBox(height: 8),
                    const Text('Rs. 3,950', style: TextStyle(color: Color(0xFF7E22CE), fontSize: 32, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    Divider(color: const Color(0xFFD8B4FE).withOpacity(0.5)),
                    const SizedBox(height: 8),
                    Text('Interest Rate: 12% APR', style: TextStyle(color: Colors.grey[700], fontSize: 12)),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: isLoading ? null : _submitApplication,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    backgroundColor: const Color(0xFF3B82F6), // Vibrant Blue
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: isLoading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Submit Application', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
