import 'package:flutter/material.dart';
import '../api_service.dart';

class WelfareScreen extends StatefulWidget {
  const WelfareScreen({super.key});

  @override
  State<WelfareScreen> createState() => _WelfareScreenState();
}

class _WelfareScreenState extends State<WelfareScreen> {
  final _formKey = GlobalKey<FormState>();
  
  int familySize = 4;
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
        "loan_amount": 0,
        "loan_type": "welfare",
        "savings_balance": 8000,
        "existing_loans": 0,
        "repayment_history": 1,
        "guarantor_support_count": 0
      };

      final prediction = await ApiService.assessWelfare(payload);
      
      if (!mounted) return;
      
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(prediction['eligibility'] ?? 'Result'),
          content: Text(prediction['message'] ?? ''),
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
        const SnackBar(content: Text('Error assessing welfare')),
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
        title: const Text('Welfare Application', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF1E293B))),
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
              const Text('Family Size', style: TextStyle(fontSize: 14, color: Color(0xFF1E293B))),
              const SizedBox(height: 8),
              TextFormField(
                initialValue: '4',
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
                    borderSide: const BorderSide(color: Color(0xFF10B981)),
                  ),
                ),
                keyboardType: TextInputType.number,
                validator: (value) => value!.isEmpty ? 'Required' : null,
                onSaved: (value) => familySize = int.parse(value!),
              ),
              const SizedBox(height: 24),
              
              // Note Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4), // Light green background
                  border: Border.all(color: const Color(0xFF86EFAC)),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Eligibility Note', style: TextStyle(color: Color(0xFF064E3B), fontSize: 14, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text('Families with 4+ members may qualify for additional support', style: TextStyle(color: Colors.grey[700], fontSize: 13)),
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
                    backgroundColor: const Color(0xFF059669), // Green
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
