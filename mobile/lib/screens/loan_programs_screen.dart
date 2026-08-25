import 'package:flutter/material.dart';
import '../api_service.dart';
import 'apply_loan_screen.dart';

class LoanProgramsScreen extends StatefulWidget {
  const LoanProgramsScreen({super.key});

  @override
  State<LoanProgramsScreen> createState() => _LoanProgramsScreenState();
}

class _LoanProgramsScreenState extends State<LoanProgramsScreen> {
  bool _isLoading = true;
  List<dynamic> _banks = [];
  List<dynamic> _allPrograms = [];
  
  String? _selectedBankId;

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
        _banks = banks;
        _allPrograms = programs;
        if (_banks.isNotEmpty) {
          _selectedBankId = _banks[0]['id'];
        }
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to load loan programs')));
    }
  }

  List<dynamic> get _filteredPrograms {
    if (_selectedBankId == null) return [];
    return _allPrograms.where((p) => p['bank_id'] == _selectedBankId).toList();
  }

  void _showLoanDetails(Map<String, dynamic> loan) {
    // Determine the bank name
    final bankName = _banks.firstWhere((b) => b['id'] == loan['bank_id'], orElse: () => {'name': 'Bank'})['name'];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(child: Text(loan['title'], style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)))),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
              ],
            ),
            const SizedBox(height: 24),
            _buildDetailRow('Interest Rate', '${loan['apr']} APR', isHighlighted: true),
            const SizedBox(height: 16),
            _buildDetailRow('Loan Limit', loan['limit']),
            const SizedBox(height: 16),
            _buildDetailRow('Max Repayment', loan['months']),
            const SizedBox(height: 24),
            const Text('Key Features', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            ...List.generate(
              (loan['features'] as List).length,
              (index) => Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Row(
                  children: [
                    const Icon(Icons.check, color: Colors.green, size: 18),
                    const SizedBox(width: 8),
                    Expanded(child: Text(loan['features'][index])),
                  ],
                ),
              ),
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context, 
                    MaterialPageRoute(builder: (_) => ApplyLoanScreen(bank: bankName, loanType: loan['title']))
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF5B21B6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text('Apply for ${loan['title'].split('(')[0].trim()}', 
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isHighlighted = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey)),
        Text(value, style: TextStyle(
          fontWeight: FontWeight.bold, 
          fontSize: 16,
          color: isHighlighted ? const Color(0xFF5B21B6) : Colors.black87
        )),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Loan Programs', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF1E293B))),
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: Color(0xFF1E293B)),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  color: Color(0xFF5B21B6),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.analytics_outlined, color: Colors.white, size: 32),
                    SizedBox(height: 16),
                    Text('Microloan\nProgram', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold, height: 1.2)),
                    SizedBox(height: 8),
                    Text('Get quick access to funds for your agricultural and business needs.', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  ],
                ),
              ),
              
              // Bank Selector
              Container(
                color: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: _banks.map((bank) {
                      final isSelected = bank['id'] == _selectedBankId;
                      return Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: ChoiceChip(
                          label: Text(bank['name']),
                          selected: isSelected,
                          onSelected: (selected) {
                            if (selected) setState(() => _selectedBankId = bank['id']);
                          },
                          selectedColor: const Color(0xFF5B21B6),
                          labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.black87, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal),
                          backgroundColor: Colors.grey[100],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
              
              // Loan List
              Expanded(
                child: RefreshIndicator(
                  onRefresh: _fetchData,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _filteredPrograms.length,
                    itemBuilder: (context, index) {
                      final loan = _filteredPrograms[index];
                      Color tagColor = Color(loan['tagColor'] ?? 0xFF4CAF50);
                      
                      return GestureDetector(
                        onTap: () => _showLoanDetails(loan),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: index == 0 ? Border.all(color: const Color(0xFF5B21B6), width: 2) : Border.all(color: Colors.grey.shade200),
                            boxShadow: [
                              BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 4))
                            ],
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(color: Colors.blue[50], shape: BoxShape.circle),
                                child: const Icon(Icons.business_center, color: Color(0xFF5B21B6)),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(loan['title'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                    const SizedBox(height: 4),
                                    Text(loan['subtitle'], style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: tagColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(loan['tag'], style: TextStyle(color: tagColor, fontSize: 10, fontWeight: FontWeight.bold)),
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
    );
  }
}
