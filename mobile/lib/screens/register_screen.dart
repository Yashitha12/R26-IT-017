import 'package:flutter/material.dart';
import '../api_service.dart';

class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  
  String name = '';
  String nic = '';
  String dob = '';
  String mobile = '';
  String username = '';
  String password = '';

  bool isLoading = false;

  void _register() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();
    
    setState(() => isLoading = true);
    
    try {
      final payload = {
        "name": name,
        "nic": nic,
        "dob": dob,
        "mobile": mobile,
        "username": username,
        "password": password
      };
      
      final res = await ApiService.registerUser(payload);
      
      // Store to blockchain stub
      await ApiService.storeOnBlockchain("member_registration", payload);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Registration Successful! ID: ${res["memberId"]}')),
      );
      Navigator.pop(context); // Go back to login
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
      appBar: AppBar(title: Text('Register'), backgroundColor: Color(0xFF1E3A8A)),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              Icon(Icons.person_add, size: 64, color: Color(0xFF1E3A8A)),
              SizedBox(height: 24),
              
              TextFormField(
                decoration: InputDecoration(labelText: 'Full Name', border: OutlineInputBorder()),
                validator: (v) => v!.isEmpty ? 'Required' : null,
                onSaved: (v) => name = v!,
              ),
              SizedBox(height: 16),
              
              TextFormField(
                decoration: InputDecoration(labelText: 'NIC Number', border: OutlineInputBorder()),
                validator: (v) => v!.isEmpty ? 'Required' : null,
                onSaved: (v) => nic = v!,
              ),
              SizedBox(height: 16),
              
              TextFormField(
                decoration: InputDecoration(labelText: 'Date of Birth (YYYY-MM-DD)', border: OutlineInputBorder()),
                validator: (v) => v!.isEmpty ? 'Required' : null,
                onSaved: (v) => dob = v!,
              ),
              SizedBox(height: 16),
              
              TextFormField(
                decoration: InputDecoration(labelText: 'Mobile Number', border: OutlineInputBorder()),
                validator: (v) => v!.isEmpty ? 'Required' : null,
                onSaved: (v) => mobile = v!,
              ),
              SizedBox(height: 32),
              
              Text('Account Security', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              SizedBox(height: 16),
              
              TextFormField(
                decoration: InputDecoration(labelText: 'Username', border: OutlineInputBorder()),
                validator: (v) => v!.isEmpty ? 'Required' : null,
                onSaved: (v) => username = v!,
              ),
              SizedBox(height: 16),
              
              TextFormField(
                decoration: InputDecoration(labelText: 'Password', border: OutlineInputBorder()),
                obscureText: true,
                validator: (v) => v!.isEmpty ? 'Required' : null,
                onSaved: (v) => password = v!,
              ),
              SizedBox(height: 32),
              
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color(0xFF1E3A8A),
                  padding: EdgeInsets.symmetric(vertical: 16),
                ),
                onPressed: isLoading ? null : _register,
                child: isLoading 
                  ? CircularProgressIndicator(color: Colors.white)
                  : Text('Register', style: TextStyle(fontSize: 18)),
              )
            ],
          ),
        ),
      ),
    );
  }
}
