import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_strings.dart';
import '../api_service.dart';
import 'home_screen.dart';
import 'register_screen.dart';
import 'identity_kyc_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _identifierController = TextEditingController(text: '200223003053');
  bool isLoading = false;

  void _login() async {
    if (!_formKey.currentState!.validate()) return;
    final identifier = _identifierController.text.trim();

    setState(() => isLoading = true);

    try {
      final res = await ApiService.loginUser(identifier);

      // Check KYC status
      String kycStatus = res['kycStatus'] ?? 'PENDING';

      if (!mounted) return;

      if (kycStatus == 'VERIFIED') {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => HomeScreen(userData: res)),
        );
      } else {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => IdentityKYCScreen(
              identifier: res['_id'] ?? identifier,
              userData: res,
            ),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceAll('Exception: ', '')),
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
  void dispose() {
    _identifierController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final s = AppStrings.of(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppComponents.headerAppBar(
        context,
        title: s.appTitle,
        subtitle: s.residentPortal,
        showBack: false,
        showLangPill: true,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Main Auth Card
                AppComponents.card(
                  padding: const EdgeInsets.all(28),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Official Logo & Brand header
                        Center(
                          child: AppComponents.smartgramaLogo(height: 64),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          s.loginTitle,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          s.loginSubtitle,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.textSecondary,
                            height: 1.4,
                          ),
                        ),
                        const SizedBox(height: 32),

                        // Input field
                        Text(
                          s.citizenIdOrNic,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _identifierController,
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
                          decoration: InputDecoration(
                            hintText: 'e.g. 200223003053 or 981234567V',
                            prefixIcon: const Icon(Icons.badge_outlined, color: AppColors.textSecondary, size: 20),
                            suffixIcon: _identifierController.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear, size: 18, color: AppColors.textMuted),
                                    onPressed: () => _identifierController.clear(),
                                  )
                                : null,
                          ),
                          validator: (v) => (v == null || v.trim().isEmpty) ? s.requiredField : null,
                        ),

                        // Quick demo citizen autofill
                        const SizedBox(height: 12),
                        Align(
                          alignment: Alignment.centerLeft,
                          child: ActionChip(
                            avatar: const Icon(Icons.person_pin, size: 16, color: AppColors.primary),
                            label: Text(s.quickDemoLogin, style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600)),
                            backgroundColor: AppColors.primaryLight,
                            side: const BorderSide(color: Color(0xFFC7D2FE), width: 1),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                            onPressed: () {
                              setState(() {
                                _identifierController.text = '200223003053';
                              });
                            },
                          ),
                        ),

                        const SizedBox(height: 28),

                        // Primary Sign In Button
                        AppComponents.primaryButton(
                          label: s.signIn,
                          icon: Icons.login,
                          isLoading: isLoading,
                          onPressed: _login,
                        ),

                        const SizedBox(height: 20),

                        // Register Section Divider
                        Row(
                          children: const [
                            Expanded(child: Divider(color: AppColors.border, thickness: 1)),
                            Padding(
                              padding: EdgeInsets.symmetric(horizontal: 12),
                              child: Text(
                                'OR',
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textMuted),
                              ),
                            ),
                            Expanded(child: Divider(color: AppColors.border, thickness: 1)),
                          ],
                        ),

                        const SizedBox(height: 20),

                        // Secondary Register Button
                        AppComponents.secondaryButton(
                          label: s.registerNow,
                          icon: Icons.person_add_alt_1,
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => RegisterScreen()),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Platform trust footer
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Icon(Icons.shield_outlined, size: 16, color: AppColors.textMuted),
                    SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        'Government of Sri Lanka • SmartGrama 2.0',
                        style: TextStyle(fontSize: 12, color: AppColors.textMuted, fontWeight: FontWeight.w500),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
