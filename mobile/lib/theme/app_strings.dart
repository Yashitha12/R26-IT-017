import 'package:flutter/material.dart';

class AppStrings {
  final String languageCode;

  AppStrings(this.languageCode);

  bool get isSinhala => languageCode == 'si';

  static AppStrings of(BuildContext context) {
    final code = Localizations.localeOf(context).languageCode;
    return AppStrings(code);
  }

  // Brand & Global
  String get appTitle => isSinhala ? 'ස්මාර්ට්ග්‍රාම' : 'SmartGrama';
  String get residentPortal => isSinhala ? 'පුරවැසි ද්වාරය' : 'Citizen Resident Portal';
  String get welcomeBack => isSinhala ? 'ආයුබෝවන්' : 'Welcome back';
  String get gnResident => isSinhala ? 'ග්‍රාම නිලධාරී වසම' : 'GN Division Resident';
  String get submit => isSinhala ? 'ඉදිරිපත් කරන්න' : 'Submit';
  String get cancel => isSinhala ? 'අවලංගු කරන්න' : 'Cancel';
  String get next => isSinhala ? 'මීළඟ පියවර' : 'Continue';
  String get back => isSinhala ? 'ආපසු' : 'Back';
  String get loading => isSinhala ? 'කරුණාකර රැඳී සිටින්න...' : 'Please wait...';
  String get requiredField => isSinhala ? 'අවශ්‍යයි' : 'Required field';
  String get viewAll => isSinhala ? 'සියල්ල බලන්න' : 'View All';
  String get active => isSinhala ? 'ක්‍රියාකාරී' : 'Active';
  String get approved => isSinhala ? 'අනුමතයි' : 'Approved';
  String get underReview => isSinhala ? 'සමාලෝචනයේ' : 'Under Review';
  String get pending => isSinhala ? 'පොරොත්තුවේ' : 'Pending';
  String get rejected => isSinhala ? 'ප්‍රතික්ෂේපිතයි' : 'Rejected';

  // Navigation
  String get navHome => isSinhala ? 'මුල් පිටුව' : 'Home';
  String get navWallet => isSinhala ? 'පසුම්බිය' : 'Wallet';
  String get navStatus => isSinhala ? 'තත්ත්වය' : 'Status';
  String get navProfile => isSinhala ? 'පැතිකඩ' : 'Profile';
  String get navChat => isSinhala ? 'AI සහායක' : 'AI Assistant';

  // Login & Register
  String get loginTitle => isSinhala ? 'ස්මාර්ට්ග්‍රාම පුරවැසි පිවිසුම' : 'SmartGrama Citizen Login';
  String get loginSubtitle => isSinhala ? 'ඔබගේ ඩිජිටල් හැඳුනුම්පත හෝ ජා.හැ. අංකය ඇතුළත් කරන්න' : 'Enter your Citizen DID or National Identity Card number';
  String get citizenIdOrNic => isSinhala ? 'පුරවැසි ID හෝ ජාතික හැඳුනුම්පත් අංකය (NIC)' : 'Citizen ID or National NIC Number';
  String get signIn => isSinhala ? 'පද්ධතියට පිවිසෙන්න' : 'Sign In';
  String get noAccount => isSinhala ? 'ගිණුමක් නැද්ද?' : "Don't have an account?";
  String get registerNow => isSinhala ? 'නව පුරවැසි හැඳුනුම්පතක් ලියාපදිංචි කරන්න' : 'Register New Citizen ID';
  String get quickDemoLogin => isSinhala ? 'පරීක්ෂණ පිවිසුම: 200223003053' : 'Demo Citizen: 200223003053';

  // Registration Stepper
  String get regStep1 => isSinhala ? '1. පුද්ගලික තොරතුරු' : '1. Personal Details';
  String get regStep2 => isSinhala ? '2. ලිපිනය සහ වසම' : '2. Address & Division';
  String get regStep3 => isSinhala ? '3. ආර්ථික තත්ත්වය' : '3. Socio-Economic';
  String get regStep4 => isSinhala ? '4. බැංකු තොරතුරු' : '4. Bank Account';

  String get fullName => isSinhala ? 'සම්පූර්ණ නම' : 'Full Legal Name';
  String get nicNumber => isSinhala ? 'ජාතික හැඳුනුම්පත් අංකය' : 'NIC Number';
  String get dob => isSinhala ? 'උපන් දිනය (YYYY-MM-DD)' : 'Date of Birth (YYYY-MM-DD)';
  String get phone => isSinhala ? 'ජංගම දුරකථන අංකය' : 'Mobile Phone Number';
  String get emailAddress => isSinhala ? 'විද්‍යුත් තැපෑල' : 'Email Address';
  String get addressField => isSinhala ? 'ස්ථිර ලිපිනය' : 'Permanent Address';
  String get cityField => isSinhala ? 'නගරය' : 'City';
  String get districtField => isSinhala ? 'දිස්ත්‍රික්කය' : 'District';
  String get gnField => isSinhala ? 'ග්‍රාම නිලධාරී වසම' : 'Grama Niladhari Division';
  String get familySizeField => isSinhala ? 'පවුලේ සාමාජිකයින් ගණන' : 'Total Household Members';
  String get dependentsField => isSinhala ? 'යැපෙන්නන් සංඛ්‍යාව' : 'Number of Dependents';
  String get monthlyIncomeField => isSinhala ? 'මාසික ගෘහ ආදායම (රු.)' : 'Monthly Household Income (LKR)';
  String get monthlyExpensesField => isSinhala ? 'මාසික වියදම (රු.)' : 'Monthly Expenses (LKR)';
  String get employmentField => isSinhala ? 'රැකියා වර්ගය' : 'Employment Type';
  String get bankNameField => isSinhala ? 'තෝරාගත් බැංකුව' : 'Partner Bank Name';
  String get accountNumberField => isSinhala ? 'ගිණුම් අංකය' : 'Bank Account Number';
  String get branchField => isSinhala ? 'ශාඛාව' : 'Bank Branch';
  String get completeRegistration => isSinhala ? 'ලියාපදිංචිය අවසන් කර KYC වෙත යන්න' : 'Complete & Proceed to KYC';

  // Home Dashboard
  String get totalBalance => isSinhala ? 'මුළු ඉතිරිකිරීම් ශේෂය' : 'Total Savings Balance';
  String get quickActions => isSinhala ? 'ප්‍රධාන සේවාවන්' : 'Citizen Digital Services';
  String get applyLoanTitle => isSinhala ? 'ක්ෂුද්‍ර ණය පහසුකම්' : 'Microfinance Loans';
  String get applyLoanDesc => isSinhala ? 'ක්ෂණික AI අවදානම් විශ්ලේෂණය සහ සහන පොලී ණය' : 'Low-interest loans with instant AI credit assessment';
  String get applyWelfareTitle => isSinhala ? 'අස්වැසුම සුබසාධන' : 'Aswesuma Welfare';
  String get applyWelfareDesc => isSinhala ? 'මාන 6ක PMT දිළිඳුතා ලකුණු සහ මාසික දීමනා' : '6-dimension PMT poverty scoring & monthly grants';
  String get myWalletTitle => isSinhala ? 'ඩිජිටල් පසුම්බිය' : 'Digital Wallet';
  String get myWalletDesc => isSinhala ? 'බ්ලොක්චේන් ලෙජරය සහ අනුමත ගෙවීම් වාර්තා' : 'Cryptographic ledger & active loan disbursements';
  String get myProfileTitle => isSinhala ? 'පුරවැසි පැතිකඩ' : 'Citizen Profile';
  String get myProfileDesc => isSinhala ? 'තහවුරු කළ ඩිජිටල් හැඳුනුම්පත (DID) සහ තොරතුරු' : 'Verified DID credentials & household details';
  String get recentApplications => isSinhala ? 'මෑත අයදුම්පත් සහ තත්ත්වය' : 'Recent Applications';
  String get aiAssistantBannerTitle => isSinhala ? 'ස්මාර්ට්ග්‍රාම AI සහායකගෙන් විමසන්න' : 'Ask SmartGrama AI Assistant';
  String get aiAssistantBannerDesc => isSinhala ? 'ණය සහ සුබසාධන සුදුසුකම් පිළිබඳ ක්ෂණික පිළිතුරු' : 'Instant guidance on welfare & microfinance eligibility';

  // Loan Programs
  String get loanProgramsTitle => isSinhala ? 'ක්ෂුද්‍ර මූල්‍ය ණය වැඩසටහන්' : 'Microfinance Loan Programs';
  String get filterByBank => isSinhala ? 'බැංකුව අනුව තෝරන්න' : 'Select Partner Bank';
  String get aprInterest => isSinhala ? 'වාර්ෂික පොලී අනුපාතිකය' : 'Annual Interest Rate';
  String get maxLimit => isSinhala ? 'උපරිම ණය මුදල' : 'Maximum Loan Limit';
  String get maxRepayment => isSinhala ? 'උපරිම ආපසු ගෙවීමේ කාලය' : 'Max Repayment Duration';
  String get keyFeatures => isSinhala ? 'ප්‍රධාන ප්‍රතිලාභ' : 'Key Loan Features';
  String get checkAffordability => isSinhala ? 'සුදුසුකම පරීක්ෂා කර අයදුම් කරන්න' : 'Check Affordability & Apply';

  // Apply Loan Form
  String get applyLoanHeading => isSinhala ? 'ණය අයදුම්පත සම්පූර්ණ කරන්න' : 'Loan Affordability Assessment';
  String get applyLoanSubheading => isSinhala ? 'ඔබගේ ආදායම් සහ මූල්‍ය තොරතුරු ඇතුළත් කරන්න. අපගේ AI ආකෘතිය ක්ෂණිකව සුදුසුකම ගණනය කරයි.' : 'Enter your financial details. Our AI model evaluates your affordability and credit risk in real time.';
  String get loanAmountRequested => isSinhala ? 'අවශ්‍ය ණය මුදල (රු.)' : 'Requested Loan Amount (LKR)';
  String get repaymentMonths => isSinhala ? 'ආපසු ගෙවීමේ කාලය (මාස)' : 'Repayment Duration (Months)';
  String get estimatedEmi => isSinhala ? 'ඇස්තමේන්තුගත මාසික වාරිකය (EMI)' : 'Estimated Monthly Installment (EMI)';
  String get otherIncome => isSinhala ? 'අමතර ආදායම (රු.)' : 'Other Household Income (LKR)';
  String get savingsBalance => isSinhala ? 'වත්මන් ඉතිරිකිරීම් ශේෂය (රු.)' : 'Current Savings Balance (LKR)';
  String get existingLoansCount => isSinhala ? 'පවතින ණය සංඛ්‍යාව' : 'Existing Active Loans';
  String get guarantorCount => isSinhala ? 'ඇපකරුවන් සංඛ්‍යාව' : 'Guarantor Support Count';
  String get repaymentTrackRecord => isSinhala ? 'පෙර ණය ගෙවීමේ වාර්තාව' : 'Past Repayment Track Record';
  String get runAiAssessment => isSinhala ? 'AI ඇගයීම ධාවනය කරන්න' : 'Evaluate with AI Model';

  // Loan Result
  String get evaluationComplete => isSinhala ? 'AI ණය ඇගයීම සම්පූර්ණයි' : 'AI Credit Risk Assessment';
  String get riskProfile => isSinhala ? 'අවදානම් මට්ටම' : 'Risk Profile';
  String get lowRisk => isSinhala ? 'අඩු අවදානම (Low Risk)' : 'Low Risk';
  String get mediumRisk => isSinhala ? 'මධ්‍යම අවදානම (Medium Risk)' : 'Medium Risk';
  String get highRisk => isSinhala ? 'ඉහළ අවදානම (High Risk)' : 'High Risk';
  String get approvedTerms => isSinhala ? 'නිර්දේශිත ණය කොන්දේසි' : 'Recommended Loan Terms';
  String get recommendedAmount => isSinhala ? 'අනුමත කළ හැකි උපරිම මුදල' : 'Recommended Loan Amount';
  String get suggestedInstallment => isSinhala ? 'යෝජිත මාසික වාරිකය' : 'Suggested Monthly Installment';
  String get affordabilityNotes => isSinhala ? 'AI මූල්‍ය විශ්ලේෂණ සටහන' : 'AI Affordability Analysis';
  String get submitToOfficer => isSinhala ? 'නිලධාරී අනුමැතිය සඳහා බ්ලොක්චේන් වෙත යවන්න' : 'Submit to Officer & Anchor to Blockchain';
  String get anchorSuccess => isSinhala ? 'අයදුම්පත සාර්ථකව නිලධාරී උපකරණ පුවරුව වෙත යොමු කරන ලදී!' : 'Application successfully anchored to blockchain and sent to officer queue!';

  // Aswesuma Welfare
  String get welfareTitle => isSinhala ? 'අස්වැසුම සුබසාධන ප්‍රතිලාභ අයදුම්පත' : 'Aswesuma Welfare Benefit Application';
  String get pmtDescription => isSinhala ? 'සමාජ-ආර්ථික මාන 6ක් ඔස්සේ Proxy Means Test (PMT) මගින් දිළිඳුතා මට්ටම සහ සුදුසුකම් ලත් දීමනාව ගණනය කෙරේ.' : 'The 6-dimension Proxy Means Test (PMT) assesses household poverty tier and calculates exact monthly welfare entitlement.';
  String get elderlyMembers => isSinhala ? 'වැඩිහිටි සාමාජිකයින් (අවු. 60+)' : 'Elderly Members (Age 60+)';
  String get disabledMembers => isSinhala ? 'ආබාධිත සාමාජිකයින් සංඛ්‍යාව' : 'Members with Disabilities';
  String get childrenDependents => isSinhala ? 'පාසල් යන දරුවන් සංඛ්‍යාව' : 'School-going Children';
  String get calculatePmt => isSinhala ? 'PMT ලකුණු ගණනය කර ඉදිරිපත් කරන්න' : 'Calculate PMT & Submit Application';
  String get pmtResultTitle => isSinhala ? 'අස්වැසුම සුදුසුකම් තක්සේරුව' : 'Aswesuma PMT Eligibility Result';
  String get povertyTier => isSinhala ? 'සුබසාධන කාණ්ඩය' : 'Welfare Poverty Tier';
  String get monthlyStipend => isSinhala ? 'හිමිවන මාසික දීමනාව' : 'Eligible Monthly Allowance';
  String get blockchainAnchorNote => isSinhala ? 'මෙම දත්ත ප්‍රාදේශීය ලේකම් කාර්යාල නිලධාරී සත්‍යාපනයෙන් පසු බ්ලොක්චේන් මත සුරක්ෂිත කෙරේ.' : 'Cryptographic proof will be anchored to the ledger upon Divisional Secretariat verification.';

  // Wallet
  String get walletLedgerTitle => isSinhala ? 'බ්ලොක්චේන් ණය සහ දීමනා ගනුදෙනු' : 'Blockchain Ledger & Active Grants';
  String get noTransactions => isSinhala ? 'තවමත් ගනුදෙනු වාර්තා වී නොමැත' : 'No transactions recorded yet.';
  String get officerApproved => isSinhala ? 'නිලධාරියා විසින් අනුමත කරන ලදී. මුදල් ලබාදීමට සූදානම්.' : 'Officer verified & approved. Funds ready for disbursement.';

  // KYC
  String get kycTitle => isSinhala ? 'ඩිජිටල් පුරවැසි අනන්‍යතා සත්‍යාපනය (KYC)' : 'Digital Citizen Identity Verification';
  String get kycSubtitle => isSinhala ? 'ග්‍රාම නිලධාරී අනුමැතිය සහ ඩිජිටල් හැඳුනුම්පත (DID) නිකුත් කිරීම' : 'Grama Niladhari Verification & Decentralized ID (DID) Issuance';
  String get takeSelfie => isSinhala ? 'මුහුණේ සජීවී ඡායාරූපය ලබාගන්න' : 'Take Live Selfie Photo';
  String get uploadNic => isSinhala ? 'ජාතික හැඳුනුම්පතේ (NIC) ඡායාරූපය' : 'Upload National ID (NIC) Photo';
  String get submitKyc => isSinhala ? 'සත්‍යාපනය සඳහා ඉදිරිපත් කරන්න' : 'Submit for Grama Niladhari Review';

  // Profile
  String get personalInfo => isSinhala ? 'පුද්ගලික තොරතුරු' : 'Personal Information';
  String get householdInfo => isSinhala ? 'ගෘහස්ථ තොරතුරු' : 'Household Details';
  String get logout => isSinhala ? 'පද්ධතියෙන් ඉවත් වන්න' : 'Logout of Account';

  // AI Chat
  String get chatTitle => isSinhala ? 'ස්මාර්ට්ග්‍රාම පුරවැසි AI සහායක' : 'SmartGrama Citizen AI';
  String get chatSubtitle => isSinhala ? 'සිංහල සහ ඉංග්‍රීසි භාෂා දෙකෙන්ම පිළිතුරු ලබාගත හැක' : 'Available in English & Sinhala';
  String get typeMessage => isSinhala ? 'ඔබගේ ප්‍රශ්නය මෙහි ලියන්න...' : 'Ask about loans, welfare or identity...';
  String get promptAswesuma => isSinhala ? 'අස්වැසුම සඳහා සුදුසුකම් ලබන්නේ කෙසේද?' : 'How do I qualify for Aswesuma?';
  String get promptMicroloan => isSinhala ? 'ක්ෂුද්‍ර ණය පොලී අනුපාත මොනවාද?' : 'What are the microloan interest rates?';
  String get promptKyc => isSinhala ? 'මගේ ඩිජිටල් හැඳුනුම්පත සත්‍යාපනය කරන්නේ කෙසේද?' : 'How is my digital identity verified?';
}
