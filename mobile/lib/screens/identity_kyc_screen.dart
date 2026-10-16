import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../theme/app_theme.dart';
import '../theme/app_strings.dart';
import '../api_service.dart';
import 'home_screen.dart';

class IdentityKYCScreen extends StatefulWidget {
  final String identifier;
  final Map<String, dynamic>? userData;

  const IdentityKYCScreen({super.key, required this.identifier, this.userData});

  @override
  State<IdentityKYCScreen> createState() => _IdentityKYCScreenState();
}

class _IdentityKYCScreenState extends State<IdentityKYCScreen> {
  int currentStep = 1;
  bool isApplying = false;
  bool isCameraActive = false;

  String preferredLanguage = 'English';
  final TextEditingController emergencyContactCtrl = TextEditingController(text: '0714567890');

  String fullName = 'Aravinda Kumara';
  String nic = '200223003053';
  String mobile = '+94 78 145 3248';
  String email = 'aravinda.k@gmail.com';
  String address = '45/A, Jayawickrama Road, Minuwangoda North (Gampaha)';

  bool step1Done = false;
  bool step2Done = false;

  XFile? _faceImage;
  XFile? _nicImage;
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage(bool isFace, ImageSource source) async {
    try {
      final XFile? pickedFile = await _picker.pickImage(source: source);
      if (pickedFile != null) {
        setState(() {
          if (isFace) {
            _faceImage = pickedFile;
          } else {
            _nicImage = pickedFile;
          }
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error picking image: $e")));
      }
    }
  }

  @override
  void initState() {
    super.initState();
    if (widget.userData != null) {
      fullName = widget.userData?['name'] ?? widget.userData?['fullName'] ?? fullName;
      nic = widget.userData?['nic'] ?? nic;
      mobile = widget.userData?['phone'] ?? mobile;
      email = widget.userData?['email'] ?? email;

      String addr = widget.userData?['address'] ?? '';
      String gn = widget.userData?['gnDivision'] ?? '';
      String dist = widget.userData?['district'] ?? '';
      if (addr.isNotEmpty) {
        address = "$addr, $gn ($dist)";
      }
    }
  }

  @override
  void dispose() {
    emergencyContactCtrl.dispose();
    super.dispose();
  }

  void _showSubmitDialog() {
    final s = AppStrings.of(context);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        titlePadding: EdgeInsets.zero,
        title: Container(
          decoration: const BoxDecoration(
            color: AppColors.tealBrand,
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text(
                'Submit Identity Application?',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 6),
              Text(
                'SmartGrama Welfare & Microfinance Platform',
                style: TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ],
          ),
        ),
        contentPadding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Your profile data is encrypted and submitted for official Grama Niladhari identity verification.',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.4),
            ),
            const SizedBox(height: 16),
            _dialogBullet(1, 'Application Registered', 'A decentralized Application ID is assigned to your account.'),
            _dialogBullet(2, 'Biometric Evidence Required', 'Face selfie and clear photo of your National Identity Card.'),
            _dialogBullet(3, 'Officer Review & DID', 'Grama Niladhari approves and anchors your DID to the blockchain.'),
          ],
        ),
        actionsPadding: const EdgeInsets.all(20),
        actions: [
          Row(
            children: [
              Expanded(
                child: AppComponents.secondaryButton(
                  label: s.cancel,
                  onPressed: () => Navigator.pop(ctx),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: AppComponents.primaryButton(
                  label: 'Confirm',
                  backgroundColor: AppColors.tealBrand,
                  onPressed: () {
                    Navigator.pop(ctx);
                    _applyForIdentity();
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _dialogBullet(int num, String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 10,
            backgroundColor: AppColors.tealBrand,
            child: Text('$num', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary)),
                Text(desc, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _applyForIdentity() async {
    setState(() => isApplying = true);
    try {
      await ApiService.applyForIdentity(widget.identifier);
      if (!mounted) return;
      setState(() {
        step1Done = true;
        currentStep = 2;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e"), backgroundColor: AppColors.danger));
      }
    } finally {
      if (mounted) {
        setState(() => isApplying = false);
      }
    }
  }

  void _submitEvidence() async {
    setState(() => isCameraActive = true);
    try {
      String dummyBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/";
      await ApiService.submitFaceEvidence(widget.identifier, dummyBase64);
      await ApiService.submitNicEvidence(widget.identifier, dummyBase64);
      if (!mounted) return;
      setState(() {
        step2Done = true;
        currentStep = 3;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e"), backgroundColor: AppColors.danger));
      }
    } finally {
      if (mounted) {
        setState(() => isCameraActive = false);
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
        title: s.kycTitle,
        subtitle: 'Step $currentStep of 3',
        showBack: true,
        showLangPill: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Column(
              children: [
                // Stepper Banner
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border, width: 1.5),
                  ),
                  child: Row(
                    children: [
                      _stepPill(1, 'Profile', currentStep >= 1, step1Done),
                      _stepConnector(step1Done),
                      _stepPill(2, 'Biometrics', currentStep >= 2, step2Done),
                      _stepConnector(step2Done),
                      _stepPill(3, 'Review', currentStep == 3, false),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                if (currentStep == 1) _buildStep1(s),
                if (currentStep == 2) _buildStep2(s),
                if (currentStep == 3) _buildStep3(s),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _stepPill(int step, String label, bool active, bool done) {
    return Expanded(
      child: Column(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: done ? AppColors.welfare : (active ? AppColors.tealBrand : AppColors.surfaceSubtle),
              border: Border.all(color: active || done ? AppColors.tealBrand : AppColors.border, width: 1.5),
            ),
            child: Center(
              child: done
                  ? const Icon(Icons.check, size: 16, color: Colors.white)
                  : Text('$step', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: active ? Colors.white : AppColors.textSecondary)),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(fontSize: 11, fontWeight: active ? FontWeight.bold : FontWeight.w500, color: active ? AppColors.textPrimary : AppColors.textMuted),
          ),
        ],
      ),
    );
  }

  Widget _stepConnector(bool done) {
    return Container(
      width: 20,
      height: 2,
      margin: const EdgeInsets.only(bottom: 16),
      color: done ? AppColors.welfare : AppColors.border,
    );
  }

  Widget _buildStep1(AppStrings s) {
    return AppComponents.card(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('1. Verified Resident Profile', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
          const SizedBox(height: 4),
          const Text('Confirm your identification data before submitting for officer review.', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          const SizedBox(height: 20),

          _profileField('Full Legal Name', fullName),
          _profileField('National Identity Card (NIC)', nic),
          _profileField('Registered Phone Number', mobile),
          _profileField('Email Address', email),
          _profileField('Residential Address & Division', address),

          const SizedBox(height: 24),
          AppComponents.primaryButton(
            label: 'Submit Identity Application',
            icon: Icons.check_circle_outline,
            backgroundColor: AppColors.tealBrand,
            isLoading: isApplying,
            onPressed: _showSubmitDialog,
          ),
        ],
      ),
    );
  }

  Widget _profileField(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
        ],
      ),
    );
  }

  Widget _buildStep2(AppStrings s) {
    return Column(
      children: [
        AppComponents.card(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Step A: Live Face Selfie', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                  AppComponents.statusBadge(
                    label: _faceImage != null ? 'Captured' : 'Pending',
                    background: _faceImage != null ? AppColors.successBg : AppColors.warningBg,
                    textColor: _faceImage != null ? AppColors.successText : AppColors.warningText,
                  ),
                ],
              ),
              const SizedBox(height: 14),

              Container(
                height: 160,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                ),
                clipBehavior: Clip.antiAlias,
                child: _faceImage != null
                    ? (kIsWeb ? Image.network(_faceImage!.path, fit: BoxFit.cover) : Image.file(File(_faceImage!.path), fit: BoxFit.cover))
                    : const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.face_retouching_natural, color: Colors.white60, size: 40),
                            SizedBox(height: 8),
                            Text('No photo captured yet', style: TextStyle(color: Colors.white60, fontSize: 13)),
                          ],
                        ),
                      ),
              ),
              const SizedBox(height: 14),

              Row(
                children: [
                  Expanded(
                    child: AppComponents.primaryButton(
                      label: 'Take Selfie',
                      icon: Icons.camera_alt,
                      backgroundColor: AppColors.tealBrand,
                      onPressed: () => _pickImage(true, ImageSource.camera),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: AppComponents.secondaryButton(
                      label: 'Upload File',
                      icon: Icons.upload_file,
                      onPressed: () => _pickImage(true, ImageSource.gallery),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        AppComponents.card(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Step B: National ID (NIC) Document', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                  AppComponents.statusBadge(
                    label: _nicImage != null ? 'Uploaded' : 'Pending',
                    background: _nicImage != null ? AppColors.successBg : AppColors.warningBg,
                    textColor: _nicImage != null ? AppColors.successText : AppColors.warningText,
                  ),
                ],
              ),
              const SizedBox(height: 14),

              Container(
                height: 140,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                ),
                clipBehavior: Clip.antiAlias,
                child: _nicImage != null
                    ? (kIsWeb ? Image.network(_nicImage!.path, fit: BoxFit.cover) : Image.file(File(_nicImage!.path), fit: BoxFit.cover))
                    : const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.credit_card, color: Colors.white60, size: 36),
                            SizedBox(height: 8),
                            Text('NIC Front & Back Photo', style: TextStyle(color: Colors.white60, fontSize: 13)),
                          ],
                        ),
                      ),
              ),
              const SizedBox(height: 14),

              AppComponents.secondaryButton(
                label: 'Select NIC Document Photo',
                icon: Icons.photo_library_outlined,
                onPressed: () => _pickImage(false, ImageSource.gallery),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        AppComponents.primaryButton(
          label: 'Submit All Biometric Evidence',
          icon: Icons.cloud_upload_outlined,
          backgroundColor: AppColors.primary,
          isLoading: isCameraActive,
          onPressed: _submitEvidence,
        ),
      ],
    );
  }

  Widget _buildStep3(AppStrings s) {
    return Column(
      children: [
        AppComponents.card(
          padding: const EdgeInsets.all(24),
          border: Border.all(color: AppColors.warningBorder, width: 2),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.warningBg,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.warningBorder, width: 2),
                ),
                child: const Icon(Icons.access_time_filled, color: AppColors.warning, size: 36),
              ),
              const SizedBox(height: 16),
              const Text(
                'Identity Application Under Review',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 8),
              const Text(
                'Your biometric documents have been submitted securely. A Grama Niladhari officer will inspect and verify your citizen record.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
              ),
              const SizedBox(height: 20),

              AppComponents.statusBadge(
                label: 'Status: Pending GN Review',
                background: AppColors.warningBg,
                textColor: AppColors.warningText,
                borderColor: AppColors.warningBorder,
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        AppComponents.primaryButton(
          label: 'Continue to Resident Dashboard',
          icon: Icons.dashboard,
          onPressed: () {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (_) => HomeScreen(
                  userData: widget.userData ?? {
                    'id': widget.identifier,
                    'kycStatus': 'PENDING',
                    'name': fullName,
                    'did': 'did:smartgrama:prototype:001',
                  },
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}
