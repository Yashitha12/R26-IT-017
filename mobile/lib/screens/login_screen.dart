import 'package:flutter/material.dart';
import '../api_service.dart';
import 'home_screen.dart';
import 'register_screen.dart';
import 'identity_kyc_screen.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  
  String identifier = '';
  bool isLoading = false;

  void _login() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();
    
    setState(() => isLoading = true);
    
    try {
      final res = await ApiService.loginUser(identifier);
      
      // Check KYC status
      String kycStatus = res['kycStatus'] ?? 'PENDING';
      
      if (kycStatus == 'VERIFIED') {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => HomeScreen(userData: res)),
        );
      } else {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => IdentityKYCScreen(identifier: res['_id'] ?? identifier, userData: res)),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.account_balance, size: 80, color: Color(0xFF1D4ED8)),
                SizedBox(height: 16),
                Text('SmartGrama', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF1D4ED8))),
                Text('Microfinance & Welfare', style: TextStyle(fontSize: 16, color: Colors.grey)),
                SizedBox(height: 48),
                
                TextFormField(
                  decoration: InputDecoration(
                    labelText: 'Citizen ID or NIC',
                    prefixIcon: Icon(Icons.badge),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                  onSaved: (v) => identifier = v!,
                ),
                SizedBox(height: 32),
                
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Color(0xFF1D4ED8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: isLoading ? null : _login,
                    child: isLoading 
                      ? CircularProgressIndicator(color: Colors.white)
                      : Text('Access Portal', style: TextStyle(fontSize: 18)),
                  ),
                ),
                SizedBox(height: 24),
                
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => RegisterScreen()),
                    );
                  },
                  child: Text('Don\'t have an account? Register here', style: TextStyle(color: Color(0xFF1D4ED8))),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
