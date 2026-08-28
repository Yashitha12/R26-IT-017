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
  int childrenCount = 2;
  int elderlyCount = 0;
  int disabledCount = 0;
  double monthlyIncome = 45000;
  double monthlyExpenses = 25000;
  bool isLoading = false;

  void _submitApplication() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() {
      isLoading = true;
    });

    try {
      final payload = {
        "nic": "200223003053",
        "full_name": "Aravinda Kumara",
        "gn_division": "Minuwangoda North",
        "family_size": familySize,
        "dependents_children": childrenCount,
        "elderly_count": elderlyCount,
        "disabled_members": disabledCount,
        "monthly_income": monthlyIncome,
        "monthly_expenses": monthlyExpenses,
      };

      final prediction = await ApiService.assessWelfare(payload);

      if (!mounted) return;

      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              const Icon(Icons.check_circle, color: Color(0xFF059669), size: 28),
              const SizedBox(width: 8),
              const Text('Aswesuma Result', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Poverty Score: ${prediction['welfare_score']} pts',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFFEA580C)),
              ),
              const SizedBox(height: 6),
              Text('Category: ${prediction['category'] ?? "POOR"}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Text(
                'Eligible Monthly Stipend: Rs. ${prediction['monthly_stipend'] ?? 8500}',
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF059669)),
              ),
              const SizedBox(height: 12),
              const Text(
                'Your application and Zero-PII cryptographic proof will be anchored to the blockchain ledger upon Divisional Secretariat review.',
                style: TextStyle(fontSize: 12, color: Colors.black54),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF059669),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
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
        title: const Text('Aswesuma Welfare Application', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF1E293B))),
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
              const Text('Total Family Size', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
              const SizedBox(height: 8),
              TextFormField(
                initialValue: '4',
                decoration: InputDecoration(
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF10B981))),
                ),
                keyboardType: TextInputType.number,
                validator: (value) => value!.isEmpty ? 'Required' : null,
                onSaved: (value) => familySize = int.parse(value!),
              ),
              const SizedBox(height: 16),

              const Text('Monthly Household Income (LKR)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
              const SizedBox(height: 8),
              TextFormField(
                initialValue: '45000',
                decoration: InputDecoration(
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF10B981))),
                ),
                keyboardType: TextInputType.number,
                validator: (value) => value!.isEmpty ? 'Required' : null,
                onSaved: (value) => monthlyIncome = double.parse(value!),
              ),
              const SizedBox(height: 16),

              const Text('Monthly Expenses (LKR)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
              const SizedBox(height: 8),
              TextFormField(
                initialValue: '25000',
                decoration: InputDecoration(
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF10B981))),
                ),
                keyboardType: TextInputType.number,
                validator: (value) => value!.isEmpty ? 'Required' : null,
                onSaved: (value) => monthlyExpenses = double.parse(value!),
              ),
              const SizedBox(height: 24),

              // Note Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  border: Border.all(color: const Color(0xFF86EFAC)),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Aswesuma PMT Scoring', style: TextStyle(color: Color(0xFF064E3B), fontSize: 14, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    Text('Proxy Means Test calculates multi-dimensional poverty index across 6 socio-economic dimensions.', style: TextStyle(color: Colors.grey[700], fontSize: 13)),
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
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: isLoading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Calculate & Submit', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
