import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_strings.dart';
import '../api_service.dart';

class WelfareScreen extends StatefulWidget {
  final bool isEmbedded;
  const WelfareScreen({super.key, this.isEmbedded = false});

  @override
  State<WelfareScreen> createState() => _WelfareScreenState();
}

class _WelfareScreenState extends State<WelfareScreen> {
  final _formKey = GlobalKey<FormState>();

  int familySize = 4;
  int childrenCount = 2;
  int elderlyCount = 0;
  int disabledCount = 0;
  double monthlyIncome = 35000;
  double monthlyExpenses = 28000;
  String housingType = 'Permanent / Concrete';
  bool hasVehicle = false;
  bool hasChronicIllness = false;

  bool isLoading = false;
  Map<String, dynamic>? pmtResult;

  void _submitApplication() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => isLoading = true);

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
        "housing_condition": housingType,
        "has_vehicle": hasVehicle,
        "has_chronic_illness": hasChronicIllness,
      };

      final prediction = await ApiService.assessWelfare(payload);

      if (!mounted) return;
      setState(() {
        pmtResult = prediction;
        isLoading = false;
      });

      _showPmtResultModal(prediction);
    } catch (e) {
      if (!mounted) return;
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error assessing welfare: $e'),
          backgroundColor: AppColors.danger,
        ),
      );
    }
  }

  void _showPmtResultModal(Map<String, dynamic> result) {
    final s = AppStrings.of(context);
    final score = result['welfare_score'] ?? result['pmt_score'] ?? 420;
    final category = result['category'] ?? result['tier'] ?? 'POOR';
    final stipend = result['monthly_stipend'] ?? result['grant_amount'] ?? 8500;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.82,
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 44,
                height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.successBg,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.successBorder),
                  ),
                  child: const Icon(Icons.verified, color: AppColors.welfare, size: 28),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        s.pmtResultTitle,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      Text(
                        'Proxy Means Test PMT Score: $score pts',
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: AppColors.textSecondary),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Poverty Tier Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF064E3B), Color(0xFF059669)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Text(
                    s.povertyTier,
                    style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    category.toString().toUpperCase(),
                    style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.18),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${s.monthlyStipend}: Rs. $stipend / month',
                      style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),
            Text('6-Dimension PMT Multi-Index Breakdown', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
            const SizedBox(height: 12),

            Expanded(
              child: ListView(
                children: [
                  _dimensionRow('1. Household Demographics', 'High Need (Family: $familySize, Dep: $childrenCount)', 0.82),
                  _dimensionRow('2. Economic & Income Tier', 'Income: Rs. ${monthlyIncome.toStringAsFixed(0)}', 0.75),
                  _dimensionRow('3. Education Head', 'G.C.E. O/L Regular Attendance', 0.60),
                  _dimensionRow('4. Health & Vulnerability', disabledCount > 0 ? 'Disability Support Priority' : 'Standard', disabledCount > 0 ? 0.90 : 0.40),
                  _dimensionRow('5. Housing & Assets', housingType, 0.50),
                  _dimensionRow('6. Regional Poverty Index', 'Gampaha - Division 542/A (Eligible)', 0.68),
                ],
              ),
            ),

            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                s.blockchainAnchorNote,
                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
              ),
            ),
            const SizedBox(height: 14),

            AppComponents.primaryButton(
              label: 'Done & Return',
              icon: Icons.check,
              backgroundColor: AppColors.welfare,
              onPressed: () => Navigator.pop(ctx),
            ),
          ],
        ),
      ),
    );
  }

  Widget _dimensionRow(String title, String subtitle, double score) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              Text('${(score * 100).toInt()}%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.welfare)),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: score,
              backgroundColor: AppColors.border,
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.welfare),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 2),
          Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final s = AppStrings.of(context);

    final content = SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top Banner
                AppComponents.card(
                  padding: const EdgeInsets.all(20),
                  color: AppColors.successBg,
                  border: Border.all(color: AppColors.successBorder, width: 1.5),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.welfare,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.volunteer_activism, color: Colors.white, size: 26),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              s.welfareTitle,
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.welfareDark),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              s.pmtDescription,
                              style: const TextStyle(fontSize: 12, color: Color(0xFF047857), height: 1.3),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Household Demographics
                AppComponents.card(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '1. Household Demographics & Dependents',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 16),

                      Row(
                        children: [
                          Expanded(
                            child: _counterInput(
                              label: s.familySizeField,
                              value: familySize,
                              onChanged: (v) => setState(() => familySize = v),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _counterInput(
                              label: s.childrenDependents,
                              value: childrenCount,
                              onChanged: (v) => setState(() => childrenCount = v),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),

                      Row(
                        children: [
                          Expanded(
                            child: _counterInput(
                              label: s.elderlyMembers,
                              value: elderlyCount,
                              onChanged: (v) => setState(() => elderlyCount = v),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _counterInput(
                              label: s.disabledMembers,
                              value: disabledCount,
                              onChanged: (v) => setState(() => disabledCount = v),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Monthly Finances
                AppComponents.card(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '2. Household Financial Needs',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 16),

                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(s.monthlyIncomeField, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                const SizedBox(height: 6),
                                TextFormField(
                                  initialValue: monthlyIncome.toStringAsFixed(0),
                                  keyboardType: TextInputType.number,
                                  decoration: const InputDecoration(prefixText: 'Rs. '),
                                  onSaved: (v) => monthlyIncome = double.tryParse(v!) ?? monthlyIncome,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(s.monthlyExpensesField, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                const SizedBox(height: 6),
                                TextFormField(
                                  initialValue: monthlyExpenses.toStringAsFixed(0),
                                  keyboardType: TextInputType.number,
                                  decoration: const InputDecoration(prefixText: 'Rs. '),
                                  onSaved: (v) => monthlyExpenses = double.tryParse(v!) ?? monthlyExpenses,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Housing & Assets
                AppComponents.card(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '3. Housing Condition & Asset Indicators',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      const SizedBox(height: 16),

                      DropdownButtonFormField<String>(
                        value: housingType,
                        decoration: const InputDecoration(labelText: 'House Construction Type'),
                        items: const [
                          DropdownMenuItem(value: 'Permanent / Concrete', child: Text('Permanent / Concrete')),
                          DropdownMenuItem(value: 'Semi-Permanent / Clay', child: Text('Semi-Permanent / Clay')),
                          DropdownMenuItem(value: 'Temporary / Improvised', child: Text('Temporary / Improvised')),
                        ],
                        onChanged: (v) => setState(() => housingType = v ?? housingType),
                      ),
                      const SizedBox(height: 12),

                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        title: const Text('Motor Vehicle / Tractor Ownership', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                        subtitle: const Text('Does the household own a car, van or tractor?', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                        value: hasVehicle,
                        activeColor: AppColors.welfare,
                        onChanged: (v) => setState(() => hasVehicle = v),
                      ),

                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        title: const Text('Chronic Medical Conditions', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                        subtitle: const Text('Includes Kidney Disease (CKD), Cancer or Paralysis', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                        value: hasChronicIllness,
                        activeColor: AppColors.welfare,
                        onChanged: (v) => setState(() => hasChronicIllness = v),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                AppComponents.primaryButton(
                  label: s.calculatePmt,
                  icon: Icons.calculate,
                  backgroundColor: AppColors.welfare,
                  isLoading: isLoading,
                  onPressed: _submitApplication,
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );

    if (widget.isEmbedded) {
      return content;
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppComponents.headerAppBar(
        context,
        title: s.applyWelfareTitle,
        subtitle: 'Aswesuma Social Safety Net Scheme',
        showBack: true,
        showLangPill: true,
      ),
      body: content,
    );
  }

  Widget _counterInput({
    required String label,
    required int value,
    required ValueChanged<int> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.surfaceSubtle,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary), maxLines: 1),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              InkWell(
                onTap: value > 0 ? () => onChanged(value - 1) : null,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const Icon(Icons.remove, size: 16, color: AppColors.textPrimary),
                ),
              ),
              Text(
                '$value',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              InkWell(
                onTap: () => onChanged(value + 1),
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const Icon(Icons.add, size: 16, color: AppColors.textPrimary),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
