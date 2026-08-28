import 'package:flutter/material.dart';
import '../api_service.dart';
import 'home_screen.dart';

class IdentityKYCScreen extends StatefulWidget {
  final String identifier; // NIC or User ID passed from login/registration
  final Map<String, dynamic>? userData;

  const IdentityKYCScreen({Key? key, required this.identifier, this.userData}) : super(key: key);

  @override
  _IdentityKYCScreenState createState() => _IdentityKYCScreenState();
}

class _IdentityKYCScreenState extends State<IdentityKYCScreen> {
  int currentStep = 0;
  bool isApplying = false;
  bool isCameraActive = false;
  bool isUploadingNic = false;
  String kycStatus = 'PENDING';

  @override
  void initState() {
    super.initState();
    kycStatus = widget.userData?['kycStatus'] ?? 'PENDING';
    if (kycStatus == 'PENDING') {
      currentStep = 0; // Application needed
    }
  }

  void _applyForIdentity() async {
    setState(() => isApplying = true);
    try {
      await ApiService.applyForIdentity(widget.identifier);
      setState(() {
        currentStep = 1; // Move to Face Capture
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Application created successfully!")));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
    } finally {
      setState(() => isApplying = false);
    }
  }

  void _submitFace() async {
    setState(() => isCameraActive = true);
    try {
      // Simulating base64 image capture
      String dummyBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/"; 
      await ApiService.submitFaceEvidence(widget.identifier, dummyBase64);
      setState(() {
        currentStep = 2; // Move to NIC Upload
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Face biometrics submitted successfully!")));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
    } finally {
      setState(() => isCameraActive = false);
    }
  }

  void _submitNic() async {
    setState(() => isUploadingNic = true);
    try {
      String dummyBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/"; 
      await ApiService.submitNicEvidence(widget.identifier, dummyBase64);
      setState(() {
        currentStep = 3; // Move to Officer Review
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("NIC Document submitted successfully!")));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
    } finally {
      setState(() => isUploadingNic = false);
    }
  }

  void _proceedToDashboard() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => HomeScreen(userData: widget.userData ?? {'id': widget.identifier, 'kycStatus': kycStatus}),
      ),
    );
  }

  Widget _buildStep(int stepIndex, String title, String subtitle, Widget actionButton, IconData icon) {
    bool isCompleted = currentStep > stepIndex;
    bool isActive = currentStep == stepIndex;
    
    Color iconColor = isCompleted ? Colors.green : (isActive ? Color(0xFF1D4ED8) : Colors.grey);
    
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isActive ? Colors.blue.withOpacity(0.05) : Colors.white,
        border: Border.all(color: isActive ? Color(0xFF1D4ED8) : Colors.grey.shade200, width: 2),
        borderRadius: BorderRadius.circular(16),
        boxShadow: isActive ? [BoxShadow(color: Colors.blue.withOpacity(0.1), blurRadius: 10)] : [],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                backgroundColor: iconColor.withOpacity(0.1),
                child: Icon(isCompleted ? Icons.check : icon, color: iconColor),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isActive ? Color(0xFF1D4ED8) : Colors.black87)),
                    const SizedBox(height: 4),
                    Text(subtitle, style: TextStyle(color: Colors.grey.shade600)),
                  ],
                ),
              ),
            ],
          ),
          if (isActive) ...[
            const SizedBox(height: 16),
            actionButton
          ]
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Digital Identity KYC'),
        backgroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Complete Your Profile", style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            const SizedBox(height: 8),
            Text("Please complete the following steps to verify your identity.", style: TextStyle(fontSize: 16, color: Colors.grey.shade600)),
            const SizedBox(height: 32),
            
            _buildStep(
              0, 
              "Apply for Identity", 
              "Submit an application to create your decentralized Digital Identity (DID).",
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: isApplying ? null : _applyForIdentity,
                  icon: isApplying ? SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : Icon(Icons.description),
                  label: Text("Submit Application"),
                ),
              ),
              Icons.article
            ),

            _buildStep(
              1, 
              "Live Biometrics", 
              "Take a live selfie to verify your identity.",
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: isCameraActive ? null : _submitFace,
                  icon: isCameraActive ? SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : Icon(Icons.camera_alt),
                  label: Text("Start Live Camera"),
                ),
              ),
              Icons.face
            ),

            _buildStep(
              2, 
              "Upload NIC", 
              "Upload a clear photo of your National Identity Card (Front & Back).",
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: isUploadingNic ? null : _submitNic,
                  icon: isUploadingNic ? SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : Icon(Icons.upload_file),
                  label: Text("Upload NIC Document"),
                ),
              ),
              Icons.credit_card
            ),

            _buildStep(
              3, 
              "Officer Review", 
              "Your application is queued for manual review by a Grama Niladhari officer.",
              Container(
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.amber.shade50, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.amber.shade200)),
                child: Row(
                  children: [
                    Icon(Icons.pending_actions, color: Colors.amber.shade700),
                    SizedBox(width: 12),
                    Expanded(child: Text("Status: Pending Officer Approval", style: TextStyle(color: Colors.amber.shade900, fontWeight: FontWeight.bold))),
                  ],
                ),
              ),
              Icons.admin_panel_settings
            ),

            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 54,
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: Color(0xFF1D4ED8), width: 2),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
                ),
                onPressed: _proceedToDashboard,
                child: Text("Proceed to Dashboard", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1D4ED8))),
              ),
            )
          ],
        ),
      ),
    );
  }
}
