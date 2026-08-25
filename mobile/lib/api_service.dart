import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiService {
  // FastAPI Backend (Port 8000)
  static String get baseUrl => kIsWeb ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';

  // Flask AI Backend (Port 5000)
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

  static Future<Map<String, dynamic>> assessWelfare(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/assess-welfare'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to assess welfare');
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
