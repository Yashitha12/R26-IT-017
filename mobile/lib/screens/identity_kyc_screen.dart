import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../api_service.dart';
import 'home_screen.dart';

class IdentityKYCScreen extends StatefulWidget {
  final String identifier;
  final Map<String, dynamic>? userData;

  const IdentityKYCScreen({Key? key, required this.identifier, this.userData}) : super(key: key);

  @override
  _IdentityKYCScreenState createState() => _IdentityKYCScreenState();
}

class _IdentityKYCScreenState extends State<IdentityKYCScreen> {
  int currentStep = 1;
  bool isApplying = false;
  bool isCameraActive = false;

  String preferredLanguage = 'English';
  TextEditingController emergencyContactCtrl = TextEditingController(text: '0714567890');

  String fullName = 'Aravinda Kumara';
  String nic = '200223003053';
  String mobile = '+94 78 145 3248';
  String email = 'samankumara@gmail.com';
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
          if (isFace) _faceImage = pickedFile;
          else _nicImage = pickedFile;
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error picking image: $e")));
    }
  }

  @override
  void initState() {
    super.initState();
    if (widget.userData != null) {
      fullName = widget.userData?['name'] ?? fullName;
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

  void _showSubmitDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        titlePadding: EdgeInsets.zero,
        title: Container(
          decoration: BoxDecoration(color: Color(0xFF0F766E), borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
          padding: EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Submit Identity Application?', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
              SizedBox(height: 8),
              Text('SmartGrama Welfare & Microfinance Platform', style: TextStyle(color: Colors.white70, fontSize: 12)),
            ],
          ),
        ),
        contentPadding: EdgeInsets.fromLTRB(24, 24, 24, 0),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('You are about to submit your identity application to the SmartGrama system. Here is what happens next:', style: TextStyle(color: Colors.grey.shade700, fontSize: 14)),
              SizedBox(height: 24),
              _buildDialogStep(1, 'Application Registered', 'Your profile data is sent securely to the SmartGrama system and an Application ID is assigned to you.'),
              _buildDialogStep(2, 'Biometric Evidence Required', 'You will be asked to submit a live face photo and a clear photo of your National Identity Card (NIC).'),
              _buildDialogStep(3, 'Grama Niladhari Officer Review', 'A qualified officer will verify your identity. Once approved, your Digital Identity (DID) is issued.'),
              
              Container(
                margin: EdgeInsets.only(top: 16),
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(color: Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(8), border: Border.all(color: Color(0xFFBFDBFE))),
                child: Text('Your data is submitted only for identity verification. The SmartGrama system uses blockchain-anchored records to keep your information secure and private.', style: TextStyle(color: Color(0xFF1D4ED8), fontSize: 12)),
              )
            ],
          ),
        ),
        actionsPadding: EdgeInsets.all(24),
        actions: [
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: OutlinedButton.styleFrom(padding: EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                  child: Text('Cancel', style: TextStyle(color: Colors.grey.shade700, fontWeight: FontWeight.bold)),
                ),
              ),
              SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    _applyForIdentity();
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: Color(0xFF0F766E), padding: EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)), elevation: 0),
                  child: Text('Confirm & Submit', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildDialogStep(int num, String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(radius: 12, backgroundColor: Color(0xFF0F766E), child: Text('$num', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold))),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black87)),
                SizedBox(height: 4),
                Text(desc, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
              ],
            ),
          )
        ],
      ),
    );
  }

  void _applyForIdentity() async {
    setState(() => isApplying = true);
    try {
      await ApiService.applyForIdentity(widget.identifier);
      setState(() {
        step1Done = true;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
    } finally {
      setState(() => isApplying = false);
    }
  }

  void _submitEvidence() async {
    setState(() => isCameraActive = true);
    try {
      String dummyBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/"; 
      await ApiService.submitFaceEvidence(widget.identifier, dummyBase64);
      await ApiService.submitNicEvidence(widget.identifier, dummyBase64);
      setState(() {
        step2Done = true;
        currentStep = 3;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
    } finally {
      setState(() => isCameraActive = false);
    }
  }

  Widget _buildStepIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(5, (i) {
          if (i % 2 != 0) {
            // Connector line
            int stepIndex = i ~/ 2;
            bool isCompleted = stepIndex + 1 < currentStep || 
                               (stepIndex + 1 == 1 && step1Done) || 
                               (stepIndex + 1 == 2 && step2Done);
            return Expanded(
              child: Container(
                height: 2,
                margin: const EdgeInsets.only(bottom: 20),
                color: isCompleted ? Color(0xFF0F766E) : Colors.grey.shade300,
              ),
            );
          } else {
            // Step circle
            int index = i ~/ 2;
            int stepNum = index + 1;
            bool isActive = stepNum <= currentStep;
            bool isCompleted = stepNum < currentStep || (stepNum == 1 && step1Done) || (stepNum == 2 && step2Done);
            return Column(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isActive || isCompleted ? Color(0xFF0F766E) : Colors.white,
                    border: Border.all(color: isActive || isCompleted ? Color(0xFF0F766E) : Colors.grey.shade300, width: 2),
                  ),
                  child: Center(
                    child: isCompleted
                        ? Icon(Icons.check, color: Colors.white, size: 16)
                        : Text('$stepNum', style: TextStyle(color: isActive ? Colors.white : Colors.grey.shade500, fontWeight: FontWeight.bold)),
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  ['Profile &\nApplication', 'Biometric\nEvidence', 'Verification\nStatus'][index],
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: isActive || isCompleted ? FontWeight.bold : FontWeight.normal,
                    color: isActive || isCompleted ? Color(0xFF0F766E) : Colors.grey.shade500,
                  ),
                )
              ],
            );
          }
        }),
      ),
    );
  }

  Widget _buildReadOnlyField(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
          SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
        ],
      ),
    );
  }

  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('YOUR REGISTERED PROFILE', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 1.2)),
        SizedBox(height: 24),
        Row(
          children: [
            Expanded(child: _buildReadOnlyField('Full Name', fullName)),
            Expanded(child: _buildReadOnlyField('NIC Number', nic)),
          ],
        ),
        Row(
          children: [
            Expanded(child: _buildReadOnlyField('Mobile', mobile)),
            Expanded(child: _buildReadOnlyField('Email', email)),
          ],
        ),
        _buildReadOnlyField('Address / GN Division', address),
        SizedBox(height: 16),
        Text('APPLICATION PREFERENCES', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 1.2)),
        SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('PREFERRED LANGUAGE', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                  SizedBox(height: 8),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 2),
                    decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade300), borderRadius: BorderRadius.circular(12), color: Colors.white),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        isExpanded: true,
                        value: preferredLanguage,
                        items: ['English', 'Sinhala', 'Tamil'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                        onChanged: (v) => setState(() => preferredLanguage = v!),
                      ),
                    ),
                  )
                ],
              ),
            ),
            SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('EMERGENCY CONTACT', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                  SizedBox(height: 8),
                  TextFormField(
                    controller: emergencyContactCtrl,
                    decoration: InputDecoration(
                      filled: true, fillColor: Colors.white,
                      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
                    ),
                  )
                ],
              ),
            ),
          ],
        ),
        SizedBox(height: 32),
        if (!step1Done)
          SizedBox(
            width: double.infinity,
            height: 54,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Color(0xFF0F766E), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 0),
              onPressed: isApplying ? null : _showSubmitDialog,
              child: isApplying ? CircularProgressIndicator(color: Colors.white) : Text('Submit Identity Application', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ),
        if (step1Done)
          Column(
            children: [
              Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(color: Color(0xFFD1FAE5), borderRadius: BorderRadius.circular(12), border: Border.all(color: Color(0xFFA7F3D0))),
                child: Row(
                  children: [
                    Icon(Icons.check, color: Color(0xFF065F46)),
                    SizedBox(width: 12),
                    Expanded(child: Text('Application Registered — Pending KYC', style: TextStyle(color: Color(0xFF065F46), fontWeight: FontWeight.bold))),
                  ],
                ),
              ),
              SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: Color(0xFF0F766E), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 0),
                  onPressed: () => setState(() => currentStep = 2),
                  child: Text('Continue to Evidence', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          )
      ],
    );
  }

  Widget _buildStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: EdgeInsets.all(16),
          decoration: BoxDecoration(color: Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(12), border: Border.all(color: Color(0xFFBFDBFE))),
          child: RichText(
            text: TextSpan(
              style: TextStyle(color: Color(0xFF1D4ED8), fontSize: 14),
              children: [
                TextSpan(text: 'How it works: ', style: TextStyle(fontWeight: FontWeight.bold)),
                TextSpan(text: 'First capture or upload your face photo, then upload a clear photo of your Sri Lanka National Identity Card. Both are required for officer review.'),
              ]
            )
          ),
        ),
        SizedBox(height: 24),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('STEP A — FACE ID SELFIE', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 1.2)),
            Container(padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade300), borderRadius: BorderRadius.circular(20)), child: Text(_faceImage != null ? 'SUBMITTED' : 'NOT_SUBMITTED', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _faceImage != null ? Colors.green : Colors.grey.shade600))),
          ],
        ),
        SizedBox(height: 12),
        Container(
          height: 160,
          width: double.infinity,
          decoration: BoxDecoration(color: Color(0xFF111827), borderRadius: BorderRadius.vertical(top: Radius.circular(12))),
          clipBehavior: Clip.antiAlias,
          child: _faceImage != null 
            ? (kIsWeb ? Image.network(_faceImage!.path, fit: BoxFit.cover) : Image.file(File(_faceImage!.path), fit: BoxFit.cover))
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(padding: EdgeInsets.all(12), decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: Colors.white24, style: BorderStyle.solid)), child: Icon(Icons.person_outline, color: Colors.white54, size: 32)),
                  SizedBox(height: 12),
                  Text('No photo captured yet', style: TextStyle(color: Colors.white54, fontSize: 14)),
                ],
              ),
        ),
        Container(
          padding: EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, border: Border.all(color: Colors.grey.shade200), borderRadius: BorderRadius.vertical(bottom: Radius.circular(12))),
          child: Column(
            children: [
              SizedBox(width: double.infinity, height: 48, child: ElevatedButton(style: ElevatedButton.styleFrom(backgroundColor: Color(0xFF0F766E), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)), elevation: 0), onPressed: () => _pickImage(true, ImageSource.camera), child: Text('Open Camera', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)))),
              SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: OutlinedButton(style: OutlinedButton.styleFrom(side: BorderSide(color: Colors.grey.shade300), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))), onPressed: () => _pickImage(true, ImageSource.gallery), child: Text('Upload from Device', style: TextStyle(color: Colors.grey.shade700)))),
                  SizedBox(width: 12),
                  Expanded(child: OutlinedButton(style: OutlinedButton.styleFrom(side: BorderSide(color: Colors.grey.shade300), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))), onPressed: () {}, child: Text('Use Sample', style: TextStyle(color: Colors.grey.shade700)))),
                ],
              )
            ],
          ),
        ),

        SizedBox(height: 32),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('STEP B — NIC DOCUMENT', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 1.2)),
            Container(padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade300), borderRadius: BorderRadius.circular(20)), child: Text(_nicImage != null ? 'SUBMITTED' : 'NOT_SUBMITTED', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _nicImage != null ? Colors.green : Colors.grey.shade600))),
          ],
        ),
        SizedBox(height: 12),
        Container(
          height: 160,
          width: double.infinity,
          decoration: BoxDecoration(color: Color(0xFF111827), borderRadius: BorderRadius.vertical(top: Radius.circular(12))),
          clipBehavior: Clip.antiAlias,
          child: _nicImage != null 
            ? (kIsWeb ? Image.network(_nicImage!.path, fit: BoxFit.cover) : Image.file(File(_nicImage!.path), fit: BoxFit.cover))
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(padding: EdgeInsets.all(12), decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: Colors.white24, style: BorderStyle.solid)), child: Icon(Icons.credit_card, color: Colors.white54, size: 32)),
                  SizedBox(height: 12),
                  Text('SYN-NIC-*****3053', style: TextStyle(color: Colors.white54, fontSize: 14)),
                ],
              ),
        ),
        Container(
          padding: EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, border: Border.all(color: Colors.grey.shade200), borderRadius: BorderRadius.vertical(bottom: Radius.circular(12))),
          child: SizedBox(
            width: double.infinity, 
            height: 48, 
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Color(0xFF0F766E), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)), elevation: 0), 
              onPressed: () => _pickImage(false, ImageSource.gallery), 
              child: Text('Upload NIC Photo', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))
            )
          ),
        ),
        SizedBox(height: 32),
        SizedBox(
          width: double.infinity,
          height: 54,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Color(0xFF1D4ED8), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 0),
            onPressed: isCameraActive ? null : _submitEvidence,
            child: isCameraActive ? CircularProgressIndicator(color: Colors.white) : Text('Submit All Evidence', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    );
  }

  Widget _buildStep3() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SizedBox(height: 16),
        Container(
          width: 80, height: 80,
          decoration: BoxDecoration(shape: BoxShape.circle, color: Color(0xFFFEF3C7), border: Border.all(color: Color(0xFFFDE68A), width: 4)),
          child: Icon(Icons.access_time_filled, color: Color(0xFFD97706), size: 40),
        ),
        SizedBox(height: 24),
        Text('Under Review', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
        SizedBox(height: 16),
        Text('Your documents have been submitted and are waiting for review by a Grama Niladhari Officer. This usually takes 1-2 working days.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey.shade600, fontSize: 15, height: 1.5)),
        SizedBox(height: 24),
        OutlinedButton(onPressed: () {}, style: OutlinedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)), side: BorderSide(color: Colors.grey.shade300)), child: Text('Check Again', style: TextStyle(color: Colors.grey.shade800))),
        SizedBox(height: 32),
        
        Container(
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)]),
          child: Column(
            children: [
              _buildStatusRow(Icons.check_circle_outline, Colors.green, 'Identity Application', 'Profile submitted to SmartGrama', 'Done', Colors.green),
              Divider(height: 1),
              _buildStatusRow(Icons.check_circle_outline, Colors.green, 'Biometric Evidence', 'Face photo & NIC document uploaded', 'Done', Colors.green),
              Divider(height: 1),
              Container(
                decoration: BoxDecoration(color: Color(0xFFFFFBEB), borderRadius: BorderRadius.vertical(bottom: Radius.circular(16))),
                child: _buildStatusRow(Icons.circle_outlined, Color(0xFFD97706), 'Officer Review', 'Waiting for Grama Niladhari Officer', 'In Progress', Color(0xFFD97706), isLast: true),
              )
            ],
          ),
        ),
        SizedBox(height: 32),
        Row(
          children: [
            Expanded(child: OutlinedButton(style: OutlinedButton.styleFrom(padding: EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), side: BorderSide(color: Colors.grey.shade300)), onPressed: () {}, child: Text('Back', style: TextStyle(color: Colors.grey.shade700, fontSize: 16, fontWeight: FontWeight.bold)))),
            SizedBox(width: 16),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Color(0xFF1D4ED8), padding: EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 0),
                onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => HomeScreen(userData: widget.userData ?? {'id': widget.identifier, 'kycStatus': 'PENDING'}))),
                child: Text('Continue to Dashboard', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        )
      ],
    );
  }

  Widget _buildStatusRow(IconData icon, Color iconColor, String title, String desc, String badgeText, Color badgeColor, {bool isLast = false}) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Row(
        children: [
          Icon(icon, color: iconColor, size: 28),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF1E293B))),
                SizedBox(height: 4),
                Text(desc, style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
              ],
            ),
          ),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(color: badgeColor.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: badgeColor.withOpacity(0.3))),
            child: Text(badgeText, style: TextStyle(color: badgeColor, fontSize: 12, fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    String stepTitle = ['Profile & Application', 'Biometric Evidence', 'Verification Status'][currentStep - 1];

    return Scaffold(
      backgroundColor: Color(0xFF1E293B), // Dark slate background to mimic web backdrop
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
          child: Column(
            children: [
              // Branding Top
              Text('SmartGrama', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
              SizedBox(height: 4),
              Text('BIOMETRIC IDENTITY VERIFICATION • SRI LANKA', style: TextStyle(color: Colors.grey.shade400, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.bold)),
              SizedBox(height: 32),

              // White Card with Green Top
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 20, offset: Offset(0, 10))],
                ),
                child: Column(
                  children: [
                    // Green Header Segment
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Color(0xFF0F766E), // Teal dark
                        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Identity Verification', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                          SizedBox(height: 8),
                          Text('Step $currentStep of 3 — $stepTitle', style: TextStyle(color: Colors.white70, fontSize: 14)),
                          SizedBox(height: 16),
                          // Progress Bar Line
                          Stack(
                            children: [
                              Container(height: 4, width: double.infinity, color: Colors.white24),
                              AnimatedContainer(
                                duration: Duration(milliseconds: 300),
                                height: 4,
                                width: (MediaQuery.of(context).size.width - 88) * (currentStep / 3),
                                color: Color(0xFF34D399), // Bright green progress
                              )
                            ],
                          )
                        ],
                      ),
                    ),

                    // Content Segment
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      child: Column(
                        children: [
                          _buildStepIndicator(),
                          
                          // Dynamic Step View
                          if (currentStep == 1) _buildStep1(),
                          if (currentStep == 2) _buildStep2(),
                          if (currentStep == 3) _buildStep3(),

                          SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
