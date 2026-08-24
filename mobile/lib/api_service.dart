import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:8000'; // For Android Emulator connecting to localhost

  static Future<Map<String, dynamic>> predictLoan(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/predict_loan'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to predict loan');
    }
  }

  static Future<Map<String, dynamic>> assessWelfare(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/assess_welfare'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to assess welfare');
    }
  }

  static Future<Map<String, dynamic>> recordLoanOnBlockchain(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/blockchain/record'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to record on blockchain');
    }
  }

  static Future<Map<String, dynamic>> fetchLedger() async {
    final response = await http.get(Uri.parse('$baseUrl/blockchain/ledger'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to fetch ledger');
    }
  }
}
