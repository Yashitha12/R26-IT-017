import 'package:flutter/material.dart';
import '../api_service.dart';
import 'identity_kyc_screen.dart';

class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  
  // Personal Details
  String fullName = '';
  String nic = '';
  String dob = '';
  
  // Contact Details
  String mobile = '';
  String email = '';
  String address = '';
  
  // Location Details
  String district = 'Gampaha';
  String gnDivision = 'Minuwangoda North';
  
  // Bank Details
  String bankName = '';
  String bankAccount = '';

  bool isLoading = false;

  void _register() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();
    
    setState(() => isLoading = true);
    
    try {
      final payload = {
        "name": fullName,
        "nic": nic,
        "dob": dob,
        "phone": mobile,
        "email": email,
        "address": address,
        "district": district,
        "gnDivision": gnDivision,
        "bankName": bankName,
        "accountNumber": bankAccount
      };
      
      final res = await ApiService.registerUser(payload);
      
      final String identifier = res['user']?['_id'] ?? res['_id'] ?? res['id'] ?? nic;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Registration Successful!')),
      );
      
      // Navigate to KYC Screen directly
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => IdentityKYCScreen(identifier: identifier, userData: res['user'] ?? payload)),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Text(title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1D4ED8))),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: Text('Citizen Registration', style: TextStyle(color: Colors.white)), backgroundColor: Color(0xFF1D4ED8)),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              Text('Create your SmartGrama account to access microfinance, welfare, and your digital identity.', style: TextStyle(color: Colors.grey.shade700, fontSize: 16)),
              SizedBox(height: 16),
              
              _buildSectionTitle('1. Personal Information'),
              TextFormField(
                decoration: InputDecoration(labelText: 'Full Name', border: OutlineInputBorder()),
                validator: (v) => v!.isEmpty ? 'Required' : null,
                onSaved: (v) => fullName = v!,
              ),
              SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      decoration: InputDecoration(labelText: 'NIC Number', border: OutlineInputBorder()),
                      validator: (v) => v!.isEmpty ? 'Required' : null,
                      onSaved: (v) => nic = v!,
                    ),
                  ),
                  SizedBox(width: 16),
                  Expanded(
                    child: TextFormField(
                      decoration: InputDecoration(labelText: 'DOB (YYYY-MM-DD)', border: OutlineInputBorder()),
                      onSaved: (v) => dob = v!,
                    ),
                  ),
                ],
              ),
              
              _buildSectionTitle('2. Contact Details'),
              TextFormField(
                decoration: InputDecoration(labelText: 'Mobile Number', border: OutlineInputBorder()),
                validator: (v) => v!.isEmpty ? 'Required' : null,
                onSaved: (v) => mobile = v!,
              ),
              SizedBox(height: 16),
              TextFormField(
                decoration: InputDecoration(labelText: 'Email Address', border: OutlineInputBorder()),
                onSaved: (v) => email = v!,
              ),
              SizedBox(height: 16),
              TextFormField(
                decoration: InputDecoration(labelText: 'Permanent Address', border: OutlineInputBorder()),
                onSaved: (v) => address = v!,
              ),
              
              _buildSectionTitle('3. Location Details'),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      initialValue: district,
                      decoration: InputDecoration(labelText: 'District', border: OutlineInputBorder()),
                      onSaved: (v) => district = v!,
                    ),
                  ),
                  SizedBox(width: 16),
                  Expanded(
                    child: TextFormField(
                      initialValue: gnDivision,
                      decoration: InputDecoration(labelText: 'GN Division', border: OutlineInputBorder()),
                      onSaved: (v) => gnDivision = v!,
                    ),
                  ),
                ],
              ),

              _buildSectionTitle('4. Banking Details (Optional)'),
              TextFormField(
                decoration: InputDecoration(labelText: 'Bank Name', border: OutlineInputBorder()),
                onSaved: (v) => bankName = v!,
              ),
              SizedBox(height: 16),
              TextFormField(
                decoration: InputDecoration(labelText: 'Account Number', border: OutlineInputBorder()),
                onSaved: (v) => bankAccount = v!,
              ),
              
              SizedBox(height: 32),
              
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF1D4ED8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
                  ),
                  onPressed: isLoading ? null : _register,
                  child: isLoading 
                    ? CircularProgressIndicator(color: Colors.white)
                    : Text('Register Account', style: TextStyle(fontSize: 18)),
                ),
              ),
              SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }
}

