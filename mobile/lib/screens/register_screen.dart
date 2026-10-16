import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_strings.dart';
import '../api_service.dart';
import 'identity_kyc_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  int currentStep = 1;
  bool isLoading = false;

  // Step 1: Personal
  String fullName = 'Aravinda Kumara';
  String nic = '200223003053';
  String dob = '1998-04-12';
  String mobile = '781453248';
  String email = 'aravinda.k@gmail.com';

  // Step 2: Address
  String address = '45/A, Jayawickrama Road';
  String city = 'Minuwangoda';
  String district = 'Gampaha';
  String gnDivision = 'Minuwangoda North';

  // Step 3: Income
  String familySize = '4';
  String dependents = '2';
  String monthlyIncome = '45000';
  String monthlyExpenses = '25000';
  String employmentType = 'Self Employed';

  // Step 4: Bank
  String bankName = 'Samurdhi Bank';
  String accountNumber = '100456789012';
  String branch = 'Minuwangoda';

  final List<String> districts = const [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota',
    'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale',
    'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
    'Trincomalee', 'Vavuniya'
  ];

  final List<String> bankNames = const [
    'Samurdhi Bank', 'Samupakara Bank', 'Sanasa Bank', 'People\'s Bank', 'Bank of Ceylon'
  ];

  final List<String> employmentTypes = const [
    'Self Employed', 'Farmer / Agriculture', 'Private Sector', 'Public Sector', 'Daily Wage', 'Unemployed'
  ];

  void _nextStep() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      if (currentStep < 4) {
        setState(() => currentStep++);
      } else {
        _register();
      }
    }
  }

  void _prevStep() {
    if (currentStep > 1) {
      setState(() => currentStep--);
    } else {
      Navigator.pop(context);
    }
  }

  void _register() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => isLoading = true);

    try {
      final payload = {
        "name": fullName,
        "nic": nic,
        "dob": dob,
        "phone": "+94$mobile",
        "email": email,
        "address": address,
        "city": city,
        "district": district,
        "gnDivision": gnDivision,
        "familySize": familySize,
        "dependents": dependents,
        "monthlyIncome": monthlyIncome,
        "monthlyExpenses": monthlyExpenses,
        "employmentType": employmentType,
        "bankName": bankName,
        "accountNumber": accountNumber,
        "branch": branch,
      };

      final res = await ApiService.registerUser(payload);
      final String identifier = res['user']?['_id'] ?? res['_id'] ?? res['id'] ?? nic;

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Registration Successful! Proceeding to Biometric Identity Verification.'),
          backgroundColor: AppColors.welfare,
        ),
      );

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => IdentityKYCScreen(
            identifier: identifier,
            userData: res['user'] ?? payload,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Registration error: $e'), backgroundColor: AppColors.danger),
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

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppComponents.headerAppBar(
        context,
        title: s.registerNow,
        subtitle: 'Step $currentStep of 4',
        showBack: true,
        onBack: _prevStep,
        showLangPill: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Stepper indicator header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: AppColors.surface,
              child: Row(
                children: [
                  _stepIndicator(1, s.regStep1.split('. ').last),
                  _stepDivider(1),
                  _stepIndicator(2, s.regStep2.split('. ').last),
                  _stepDivider(2),
                  _stepIndicator(3, s.regStep3.split('. ').last),
                  _stepDivider(3),
                  _stepIndicator(4, s.regStep4.split('. ').last),
                ],
              ),
            ),
            const Divider(height: 1, color: AppColors.border),

            // Step Content Form
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 600),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          if (currentStep == 1) _buildStep1(s),
                          if (currentStep == 2) _buildStep2(s),
                          if (currentStep == 3) _buildStep3(s),
                          if (currentStep == 4) _buildStep4(s),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Bottom Action Footer
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: AppColors.surface,
                border: Border(top: BorderSide(color: AppColors.border, width: 1)),
              ),
              child: Row(
                children: [
                  if (currentStep > 1) ...[
                    Expanded(
                      flex: 1,
                      child: AppComponents.secondaryButton(
                        label: s.back,
                        icon: Icons.arrow_back,
                        onPressed: _prevStep,
                      ),
                    ),
                    const SizedBox(width: 12),
                  ],
                  Expanded(
                    flex: 2,
                    child: AppComponents.primaryButton(
                      label: currentStep == 4 ? s.completeRegistration : s.next,
                      icon: currentStep == 4 ? Icons.check_circle : Icons.arrow_forward,
                      isLoading: isLoading,
                      onPressed: _nextStep,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _stepIndicator(int step, String label) {
    final isDone = currentStep > step;
    final isActive = currentStep == step;

    return Expanded(
      child: Column(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isDone
                  ? AppColors.welfare
                  : (isActive ? AppColors.primary : AppColors.surfaceSubtle),
              border: Border.all(
                color: isActive ? AppColors.primary : (isDone ? AppColors.welfare : AppColors.borderSubtle),
                width: 1.5,
              ),
            ),
            child: Center(
              child: isDone
                  ? const Icon(Icons.check, size: 16, color: Colors.white)
                  : Text(
                      '$step',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: isActive ? Colors.white : AppColors.textSecondary,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
              color: isActive ? AppColors.primary : AppColors.textMuted,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _stepDivider(int step) {
    final isDone = currentStep > step;
    return Container(
      width: 16,
      height: 2,
      margin: const EdgeInsets.only(bottom: 14),
      color: isDone ? AppColors.welfare : AppColors.border,
    );
  }

  // STEP 1: Personal Details
  Widget _buildStep1(AppStrings s) {
    return AppComponents.card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(s.regStep1, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
          const SizedBox(height: 4),
          const Text('Enter your legal identification data as per the National Identity Card.', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          const SizedBox(height: 20),

          _buildField(
            label: s.fullName,
            initialValue: fullName,
            icon: Icons.person_outline,
            onSaved: (v) => fullName = v!,
          ),
          const SizedBox(height: 16),

          _buildField(
            label: s.nicNumber,
            initialValue: nic,
            icon: Icons.badge_outlined,
            onSaved: (v) => nic = v!,
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: _buildField(
                  label: s.dob,
                  initialValue: dob,
                  icon: Icons.calendar_today_outlined,
                  onSaved: (v) => dob = v!,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildField(
                  label: s.phone,
                  initialValue: mobile,
                  prefixText: '+94 ',
                  icon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                  onSaved: (v) => mobile = v!,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          _buildField(
            label: s.emailAddress,
            initialValue: email,
            icon: Icons.email_outlined,
            keyboardType: TextInputType.emailAddress,
            onSaved: (v) => email = v!,
          ),
        ],
      ),
    );
  }

  // STEP 2: Address & GN Division
  Widget _buildStep2(AppStrings s) {
    return AppComponents.card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(s.regStep2, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
          const SizedBox(height: 4),
          const Text('Provide your residential address and Grama Niladhari administrative division.', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          const SizedBox(height: 20),

          _buildField(
            label: s.addressField,
            initialValue: address,
            icon: Icons.home_outlined,
            onSaved: (v) => address = v!,
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: _buildField(
                  label: s.cityField,
                  initialValue: city,
                  icon: Icons.location_city,
                  onSaved: (v) => city = v!,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(s.districtField, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: district,
                      decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12)),
                      items: districts.map((d) => DropdownMenuItem(value: d, child: Text(d, style: const TextStyle(fontSize: 14)))).toList(),
                      onChanged: (v) => setState(() => district = v!),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          _buildField(
            label: s.gnField,
            initialValue: gnDivision,
            icon: Icons.map_outlined,
            onSaved: (v) => gnDivision = v!,
          ),
        ],
      ),
    );
  }

  // STEP 3: Socio-Economic Profile
  Widget _buildStep3(AppStrings s) {
    return AppComponents.card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(s.regStep3, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
          const SizedBox(height: 4),
          const Text('Financial data used for automated Aswesuma PMT scoring and microfinance affordability.', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          const SizedBox(height: 20),

          Row(
            children: [
              Expanded(
                child: _buildField(
                  label: s.familySizeField,
                  initialValue: familySize,
                  icon: Icons.people_outline,
                  keyboardType: TextInputType.number,
                  onSaved: (v) => familySize = v!,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildField(
                  label: s.dependentsField,
                  initialValue: dependents,
                  icon: Icons.child_care_outlined,
                  keyboardType: TextInputType.number,
                  onSaved: (v) => dependents = v!,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: _buildField(
                  label: s.monthlyIncomeField,
                  initialValue: monthlyIncome,
                  prefixText: 'Rs. ',
                  icon: Icons.attach_money,
                  keyboardType: TextInputType.number,
                  onSaved: (v) => monthlyIncome = v!,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildField(
                  label: s.monthlyExpensesField,
                  initialValue: monthlyExpenses,
                  prefixText: 'Rs. ',
                  icon: Icons.shopping_bag_outlined,
                  keyboardType: TextInputType.number,
                  onSaved: (v) => monthlyExpenses = v!,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(s.employmentField, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: employmentType,
                decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12)),
                items: employmentTypes.map((e) => DropdownMenuItem(value: e, child: Text(e, style: const TextStyle(fontSize: 14)))).toList(),
                onChanged: (v) => setState(() => employmentType = v!),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // STEP 4: Bank Account
  Widget _buildStep4(AppStrings s) {
    return AppComponents.card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(s.regStep4, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
          const SizedBox(height: 4),
          const Text('Designated account for direct welfare allowances and loan disbursements.', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          const SizedBox(height: 20),

          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(s.bankNameField, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: bankName,
                decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12)),
                items: bankNames.map((b) => DropdownMenuItem(value: b, child: Text(b, style: const TextStyle(fontSize: 14)))).toList(),
                onChanged: (v) => setState(() => bankName = v!),
              ),
            ],
          ),
          const SizedBox(height: 16),

          _buildField(
            label: s.accountNumberField,
            initialValue: accountNumber,
            icon: Icons.account_balance_wallet_outlined,
            keyboardType: TextInputType.number,
            onSaved: (v) => accountNumber = v!,
          ),
          const SizedBox(height: 16),

          _buildField(
            label: s.branchField,
            initialValue: branch,
            icon: Icons.location_on_outlined,
            onSaved: (v) => branch = v!,
          ),
        ],
      ),
    );
  }

  Widget _buildField({
    required String label,
    required String initialValue,
    required FormFieldSetter<String> onSaved,
    IconData? icon,
    String? prefixText,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
        const SizedBox(height: 8),
        TextFormField(
          initialValue: initialValue,
          keyboardType: keyboardType,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
          decoration: InputDecoration(
            prefixText: prefixText,
            prefixIcon: icon != null ? Icon(icon, size: 18, color: AppColors.textSecondary) : null,
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          ),
          validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
          onSaved: onSaved,
        ),
      ],
    );
  }
}
