import 'package:flutter/material.dart';
import '../api_service.dart';
import 'identity_kyc_screen.dart';
import 'package:intl/intl.dart';

class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  int currentStep = 1;
  bool isLoading = false;

  // Step 1: Personal
  String fullName = '';
  String nic = '';
  String dob = '';
  String mobile = '';
  String email = '';

  // Step 2: Address
  String address = '';
  String city = '';
  String district = 'Gampaha';
  String gnDivision = '';

  // Step 3: Income
  String familySize = '';
  String dependents = '';
  String monthlyIncome = '';
  String monthlyExpenses = '';
  String employmentType = '';

  // Step 4: Bank
  String bankName = 'Samurdhi Bank';
  String accountNumber = '';
  String branch = '';

  final List<String> districts = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota',
    'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale',
    'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
    'Trincomalee', 'Vavuniya'
  ];
  final List<String> bankNames = ['Samurdhi Bank', 'Samupakara Bank', 'Sanasa Bank'];

  void _nextStep() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      setState(() {
        currentStep++;
      });
    }
  }

  void _prevStep() {
    setState(() {
      currentStep--;
    });
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
        "phone": "+94" + mobile,
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
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Registration Successful!')),
      );
      
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

  Widget _buildTextField(String label, {String? hintText, Function(String?)? onSaved, int flex = 1, String? Function(String?)? validator, TextInputType keyboardType = TextInputType.text, String? prefixText, String? suffixText, int? maxLength}) {
    return Expanded(
      flex: flex,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label.toUpperCase(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
            SizedBox(height: 8),
            TextFormField(
              keyboardType: keyboardType,
              maxLength: maxLength,
              decoration: InputDecoration(
                filled: true,
                fillColor: Colors.white,
                hintText: hintText,
                prefixText: prefixText,
                suffixText: suffixText,
                counterText: "",
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Color(0xFF0F766E))),
              ),
              validator: validator ?? (v) => v == null || v.isEmpty ? 'Required' : null,
              onSaved: onSaved,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDateField(String label, {required String value, required Function(String) onChanged, int flex = 1}) {
    return Expanded(
      flex: flex,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label.toUpperCase(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
            SizedBox(height: 8),
            InkWell(
              onTap: () async {
                DateTime? picked = await showDatePicker(
                  context: context,
                  initialDate: DateTime(2000),
                  firstDate: DateTime(1900),
                  lastDate: DateTime.now(),
                );
                if (picked != null) {
                  onChanged(DateFormat('yyyy-MM-dd').format(picked));
                }
              },
              child: InputDecorator(
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(value.isEmpty ? 'Select Date' : value, style: TextStyle(color: value.isEmpty ? Colors.black54 : Colors.black87)),
                    Icon(Icons.calendar_today, size: 16, color: Colors.grey.shade600),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDropdownField(String label, {required String value, required List<String> items, required Function(String?) onChanged, int flex = 1}) {
    return Expanded(
      flex: flex,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label.toUpperCase(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
            SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: value,
              items: items.map((i) => DropdownMenuItem(value: i, child: Text(i))).toList(),
              onChanged: onChanged,
              decoration: InputDecoration(
                filled: true,
                fillColor: Colors.white,
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(4, (index) {
          int stepNum = index + 1;
          bool isActive = stepNum <= currentStep;
          return Row(
            children: [
              Column(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isActive ? Color(0xFF0F766E) : Colors.white,
                      border: Border.all(color: isActive ? Color(0xFF0F766E) : Colors.grey.shade300, width: 2),
                    ),
                    child: Center(
                      child: isActive && stepNum < currentStep
                          ? Icon(Icons.check, color: Colors.white, size: 16)
                          : Text('$stepNum', style: TextStyle(color: isActive ? Colors.white : Colors.grey.shade500, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    ['Personal', 'Address', 'Income', 'Bank'][index],
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                      color: isActive ? Color(0xFF0F766E) : Colors.grey.shade500,
                    ),
                  )
                ],
              ),
              if (index < 3)
                Container(
                  width: 40,
                  height: 2,
                  margin: const EdgeInsets.only(bottom: 20),
                  color: stepNum < currentStep ? Color(0xFF0F766E) : Colors.grey.shade300,
                )
            ],
          );
        }),
      ),
    );
  }

  Widget _buildFormStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('PERSONAL INFORMATION', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 1.2)),
        SizedBox(height: 24),
        Row(children: [_buildTextField('Full Name', hintText: 'e.g. Aravinda Kumara', onSaved: (v) => fullName = v!)]),
        Row(children: [
          _buildTextField('NIC Number', hintText: 'e.g. 200223003053 or 983223053v', 
            validator: (v) {
              if (v == null || v.isEmpty) return 'Required';
              if (!RegExp(r'^([0-9]{9}[vVxX]|[0-9]{12})$').hasMatch(v)) return 'Invalid NIC format';
              return null;
            },
            onSaved: (v) => nic = v!)
        ]),
        Row(children: [_buildDateField('Date of Birth', value: dob, onChanged: (v) => setState(() => dob = v))]),
        Row(
          children: [
            _buildTextField('Mobile', hintText: '781453248', prefixText: '+94 ', maxLength: 9, keyboardType: TextInputType.phone,
              validator: (v) {
                if (v == null || v.isEmpty) return 'Required';
                if (!RegExp(r'^\d{9}$').hasMatch(v)) return 'Enter exactly 9 digits';
                return null;
              },
              onSaved: (v) => mobile = v!),
            SizedBox(width: 16),
            _buildTextField('Email Address', hintText: 'citizen@gmail.com', 
              validator: (v) {
                if (v == null || v.isEmpty) return 'Required';
                if (!v.contains('@gmail.com')) return 'Must be a @gmail.com address';
                return null;
              },
              onSaved: (v) => email = v!),
          ],
        ),
      ],
    );
  }

  Widget _buildFormStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('ADDRESS & GN DIVISION', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 1.2)),
        SizedBox(height: 24),
        Row(children: [_buildTextField('Home Address', hintText: 'e.g. 45/A, Jayawickrama Road', onSaved: (v) => address = v!)]),
        Row(
          children: [
            _buildTextField('City', hintText: 'e.g. Minuwangoda', 
              validator: (v) {
                if (v == null || v.isEmpty) return 'Required';
                if (!RegExp(r'^[a-zA-Z\s]+$').hasMatch(v)) return 'Text only';
                return null;
              },
              onSaved: (v) => city = v!),
            SizedBox(width: 16),
            _buildDropdownField('District', value: district, items: districts, onChanged: (v) => setState(() => district = v!)),
          ],
        ),
        Row(children: [_buildTextField('GN Division', hintText: 'e.g. Minuwangoda North', onSaved: (v) => gnDivision = v!)]),
      ],
    );
  }

  Widget _buildFormStep3() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('FAMILY & INCOME DETAILS', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 1.2)),
        SizedBox(height: 24),
        Row(
          children: [
            _buildTextField('Family Size', hintText: 'e.g. 4', keyboardType: TextInputType.number, 
              validator: (v) {
                if (v == null || v.isEmpty) return 'Required';
                if (!RegExp(r'^\d+$').hasMatch(v)) return 'Whole number only';
                return null;
              },
              onSaved: (v) => familySize = v!),
            SizedBox(width: 16),
            _buildTextField('No. of Dependents', hintText: 'e.g. 2', keyboardType: TextInputType.number,
              validator: (v) {
                if (v == null || v.isEmpty) return 'Required';
                if (!RegExp(r'^\d+$').hasMatch(v)) return 'Whole number only';
                return null;
              },
              onSaved: (v) => dependents = v!),
          ],
        ),
        Row(
          children: [
            _buildTextField('Monthly Income', hintText: '45000', suffixText: ' LKR', keyboardType: TextInputType.number,
              validator: (v) {
                if (v == null || v.isEmpty) return 'Required';
                if (!RegExp(r'^\d+$').hasMatch(v)) return 'Number only';
                return null;
              },
              onSaved: (v) => monthlyIncome = v!),
            SizedBox(width: 16),
            _buildTextField('Monthly Expenses', hintText: '25000', suffixText: ' LKR', keyboardType: TextInputType.number,
              validator: (v) {
                if (v == null || v.isEmpty) return 'Required';
                if (!RegExp(r'^\d+$').hasMatch(v)) return 'Number only';
                return null;
              },
              onSaved: (v) => monthlyExpenses = v!),
          ],
        ),
        Row(children: [_buildTextField('Employment Type', hintText: 'e.g. Daily Wage', 
          validator: (v) {
            if (v == null || v.isEmpty) return 'Required';
            if (!RegExp(r'^[a-zA-Z\s]+$').hasMatch(v)) return 'Text only';
            return null;
          },
          onSaved: (v) => employmentType = v!)]),
      ],
    );
  }

  Widget _buildFormStep4() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('BANK & WALLET DETAILS', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 1.2)),
        SizedBox(height: 24),
        Row(children: [_buildDropdownField('Bank Name', value: bankName, items: bankNames, onChanged: (v) => setState(() => bankName = v!))]),
        Row(
          children: [
            _buildTextField('Account Number', hintText: '16 digit number', maxLength: 16, keyboardType: TextInputType.number,
              validator: (v) {
                if (v == null || v.isEmpty) return 'Required';
                if (!RegExp(r'^\d{16}$').hasMatch(v)) return 'Must be exactly 16 numbers';
                return null;
              },
              onSaved: (v) => accountNumber = v!),
            SizedBox(width: 16),
            _buildTextField('Branch', hintText: 'e.g. Gampaha', 
              validator: (v) {
                if (v == null || v.isEmpty) return 'Required';
                if (!RegExp(r'^[a-zA-Z\s]+$').hasMatch(v)) return 'Text only';
                return null;
              },
              onSaved: (v) => branch = v!),
          ],
        ),
        Container(
          margin: const EdgeInsets.only(top: 8, bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Color(0xFFD1FAE5),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Color(0xFFA7F3D0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Digital Wallet Auto-Created', style: TextStyle(color: Color(0xFF065F46), fontWeight: FontWeight.bold, fontSize: 14)),
              SizedBox(height: 6),
              Text(
                'A SmartGrama Digital Wallet linked to your bank account will be set up automatically after identity verification for seamless welfare disbursements.',
                style: TextStyle(color: Color(0xFF065F46), fontSize: 12),
              ),
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    String stepTitle = ['Personal', 'Address', 'Income', 'Bank'][currentStep - 1];

    return Scaffold(
      backgroundColor: Color(0xFF1E293B),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
          child: Column(
            children: [
              Text('SmartGrama', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
              SizedBox(height: 4),
              Text('WELFARE & MICROFINANCE PLATFORM • SRI LANKA', style: TextStyle(color: Colors.grey.shade400, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.bold)),
              SizedBox(height: 32),

              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 20, offset: Offset(0, 10))],
                ),
                child: Column(
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Color(0xFF0F766E),
                        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Create Your Account', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                          SizedBox(height: 8),
                          Text('Step $currentStep of 4 – $stepTitle', style: TextStyle(color: Colors.white70, fontSize: 14)),
                          SizedBox(height: 16),
                          Stack(
                            children: [
                              Container(height: 4, width: double.infinity, color: Colors.white24),
                              AnimatedContainer(
                                duration: Duration(milliseconds: 300),
                                height: 4,
                                width: (MediaQuery.of(context).size.width - 88) * (currentStep / 4),
                                color: Color(0xFF34D399),
                              )
                            ],
                          )
                        ],
                      ),
                    ),

                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            _buildStepIndicator(),
                            
                            if (currentStep == 1) _buildFormStep1(),
                            if (currentStep == 2) _buildFormStep2(),
                            if (currentStep == 3) _buildFormStep3(),
                            if (currentStep == 4) _buildFormStep4(),

                            SizedBox(height: 24),
                            
                            Row(
                              children: [
                                if (currentStep > 1)
                                  Expanded(
                                    child: OutlinedButton(
                                      style: OutlinedButton.styleFrom(
                                        padding: EdgeInsets.symmetric(vertical: 16),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                        side: BorderSide(color: Colors.grey.shade300),
                                      ),
                                      onPressed: _prevStep,
                                      child: Text('Back', style: TextStyle(color: Colors.grey.shade700, fontSize: 16, fontWeight: FontWeight.bold)),
                                    ),
                                  ),
                                if (currentStep > 1) SizedBox(width: 16),
                                Expanded(
                                  flex: 2,
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: currentStep == 4 ? Color(0xFF1D4ED8) : Color(0xFF0F766E),
                                      padding: EdgeInsets.symmetric(vertical: 16),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      elevation: 0,
                                    ),
                                    onPressed: isLoading ? null : (currentStep < 4 ? _nextStep : _register),
                                    child: isLoading
                                        ? SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                        : Text(currentStep < 4 ? 'Continue' : 'Complete Registration', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 24),
                          ],
                        ),
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

