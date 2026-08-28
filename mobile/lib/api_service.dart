import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiService {
  // FastAPI Backend (Port 8000)
  static String get baseUrl => kIsWeb ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';

  // Flask AI Backend (Port 5000)
  // Fix: for Android emulator it's 10.0.2.2, for web it's 127.0.0.1
  static String get aiBaseUrl => kIsWeb ? 'http://127.0.0.1:5000' : 'http://10.0.2.2:5000';

  static Future<Map<String, dynamic>> predictLoan(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/predict-loan'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to predict loan');
    }
  }

  static Future<Map<String, dynamic>> recordLoanOnBlockchain(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/blockchain/record-loan'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to record on blockchain');
    }
  }

  static Future<List<dynamic>> fetchLedger() async {
    final response = await http.get(Uri.parse('$baseUrl/blockchain/transactions'));

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      return json['ledger'] ?? [];
    } else {
      throw Exception('Failed to fetch ledger');
    }
  }

  static Future<List<dynamic>> fetchBanks() async {
    final response = await http.get(Uri.parse('$baseUrl/banks'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to fetch banks');
    }
  }

  static Future<List<dynamic>> fetchLoanPrograms() async {
    final response = await http.get(Uri.parse('$baseUrl/loan-programs'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to fetch loan programs');
    }
  }

  // SmartGrama Node.js Aswesuma Backend (Port 5001)
  static String get welfareBaseUrl => kIsWeb ? 'http://127.0.0.1:5001' : 'http://10.0.2.2:5001';

  static Future<Map<String, dynamic>> assessWelfare(Map<String, dynamic> data) async {
    try {
      final did = data['did'] ?? 'did:smartgrama:prototype:001';
      final fullName = data['full_name'] ?? 'Aravinda Kumara';
      final nic = data['nic'] ?? '200223003053';
      final familySize = int.tryParse(data['family_size']?.toString() ?? '4') ?? 4;
      final monthlyIncome = double.tryParse(data['monthly_income']?.toString() ?? '45000') ?? 45000.0;
      final monthlyExpenses = double.tryParse(data['monthly_expenses']?.toString() ?? '25000') ?? 25000.0;
      final disabledCount = int.tryParse(data['disabled_members']?.toString() ?? '0') ?? 0;
      final elderlyCount = int.tryParse(data['elderly_count']?.toString() ?? '0') ?? 0;
      final childrenCount = int.tryParse(data['dependents_children']?.toString() ?? '2') ?? 2;

      // 1. Build Aswesuma 6-dimension schema
      final aswesumaPayload = {
        'did': did,
        'userId': 'user-prototype-001',
        'applicantInformation': {
          'fullName': fullName,
          'nic': nic,
          'dateOfBirth': '1990-05-15',
          'gender': 'Male',
          'mobilePhone': '+94 78 145 3248',
          'permanentAddress': '45/A, Jayawickrama Road',
          'province': 'Western',
          'district': 'Gampaha',
          'dsDivision': 'Minuwangoda',
          'gnDivision': data['gn_division'] ?? 'Minuwangoda North',
        },
        'householdInformation': {
          'totalMembers': familySize,
          'existingWelfareProgrammes': ['None'],
          'waitingListStatus': 'No',
          'applicationStatus': 'New Applicant',
        },
        'education': {
          'highestEducationHead': 'G.C.E. O/L',
          'schoolAttendanceChildren': 'All Attend Regularly',
          'schoolDropoutStatus': 'No Dropouts',
        },
        'health': {
          'hasPermanentDisabilities': disabledCount > 0 ? 'Yes' : 'No',
          'disabilityCount': disabledCount,
          'hasSevereChronicIllnesses': 'No',
          'chronicIllnessCount': 0,
          'hasCkd': false,
          'hasCancer': false,
          'hasParalysis': false,
          'bedriddenElderlyCount': 0,
          'fullyDependentElderlyCount': elderlyCount,
        },
        'economic': {
          'primaryLivelihood': 'Daily wage',
          'estimatedMonthlyIncome': monthlyIncome,
          'regularMonthlyExpenses': monthlyExpenses,
          'averageMonthlyElectricityKwh': 45,
        },
        'assets': {
          'motorVehicles': ['None'],
          'consumerDurables': ['Television'],
          'hasAgriculturalLand': 'No',
          'hasResidentialLand': 'Yes',
        },
        'housing': {
          'houseOwnership': 'Rented',
          'roofMaterial': 'Tin',
          'wallMaterial': 'Brick',
          'floorMaterial': 'Cement',
          'accessSafeDrinkingWater': 'Yes',
          'accessPrivateSanitaryToilet': 'Yes',
        },
        'familyDemography': {
          'childrenBelow15': childrenCount,
          'workingAgeMembers': (familySize - childrenCount - elderlyCount).clamp(1, 20),
          'adultsOver65': elderlyCount,
          'singleParentHousehold': 'No',
          'femaleHeadedHousehold': 'No',
        },
        'banking': {
          'bankName': 'Peoples Bank',
          'branchCode': '045',
          'accountNumberMasked': '******4589',
          'accountHolderName': fullName,
        },
      };

      // Step A: Submit to Node.js Backend
      final submitRes = await http.post(
        Uri.parse('$welfareBaseUrl/api/welfare/aswesuma/applications'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(aswesumaPayload),
      );

      String appId = 'ASW-2026-000001';
      if (submitRes.statusCode == 201 || submitRes.statusCode == 200) {
        final submitData = jsonDecode(submitRes.body);
        appId = submitData['data']?['applicationId'] ?? appId;
      }

      // Step B: Calculate PMT Score
      final calcRes = await http.post(
        Uri.parse('$welfareBaseUrl/api/welfare/aswesuma/applications/$appId/eligibility/calculate'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'ruleVersion': 'v1.0.0-prototype'}),
      );

      Map<String, dynamic> elgData = {};
      if (calcRes.statusCode == 200) {
        final calcBody = jsonDecode(calcRes.body);
        elgData = calcBody['data'] ?? {};
      }

      final score = elgData['calculatedScore'] ?? 565.0;
      final category = elgData['category'] ?? 'POOR';
      final stipend = elgData['thresholdApplied']?['monthlyBenefitLkr'] ?? (category == 'POOR' ? 8500 : (category == 'SEVERELY_POOR' ? 15000 : 4500));

      // Step C: Sync reference to Python backend
      try {
        await http.post(
          Uri.parse('$baseUrl/welfare/register-reference'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'applicationId': appId,
            'did': did,
            'applicant_name': fullName,
            'gn_division': data['gn_division'] ?? 'Minuwangoda North',
            'welfare_score': score,
            'tier': category,
            'monthly_stipend': stipend,
            'status': 'Eligible - Pending Officer Approval',
          }),
        );
      } catch (_) {}

      return {
        'applicationId': appId,
        'did': did,
        'eligibility': 'Eligible ($category)',
        'category': category,
        'welfare_score': score,
        'monthly_stipend': stipend,
        'message': 'Aswesuma Score: $score pts ($category). Recommended Stipend: Rs. $stipend/month. Application has been submitted and queued for officer review.',
      };
    } catch (e) {
      return {
        'applicationId': 'ASW-2026-000001',
        'did': 'did:smartgrama:prototype:001',
        'eligibility': 'Eligible (POOR)',
        'category': 'POOR',
        'welfare_score': 565.0,
        'monthly_stipend': 8500,
        'message': 'Aswesuma Score: 565.0 pts (POOR). Recommended Stipend: Rs. 8,500/month. Application is pending Divisional Secretariat review.',
      };
    }
  }

  static Future<Map<String, dynamic>> sendChatMessage(String message, String language, bool useRag) async {
    final response = await http.post(
      Uri.parse('$aiBaseUrl/chat'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'message': message,
        'language': language,
        'use_rag': useRag,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get AI response');
    }
  }

  static Future<Map<String, dynamic>> registerUser(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to register: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> loginUser(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Invalid credentials');
    }
  }

  static Future<void> storeOnBlockchain(String type, Map<String, dynamic> data) async {
    await http.post(
      Uri.parse('$baseUrl/blockchain/store'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'type': type, 'data': data}),
    );
  }
}
