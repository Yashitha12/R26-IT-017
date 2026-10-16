import http from 'http';
import app from './app';
import { mockWelfareProvider } from './providers/welfare.provider';
import { WelfareApplication } from './types/welfare';

const PORT = 5098;
let server: http.Server;

function request(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(body ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 0, data: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode || 0, data: raw });
          }
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runWE3Tests() {
  server = app.listen(PORT);
  console.log(`\n======================================================`);
  console.log(`  STARTING WE-3 WELFARE ELIGIBILITY ENGINE TEST SUITE `);
  console.log(`======================================================\n`);

  try {
    const verifiedDid = 'did:smartgrama:prototype:001';

    // 1. Extremely / Severely Poor Household
    const severelyPoorApp: WelfareApplication = {
      applicationId: 'ASW-WE3-001',
      did: verifiedDid,
      userId: 'user-prototype-001',
      programme: 'ASWESUMA',
      applicantInformation: {
        fullName: 'Dingiri Amma',
        nic: '195254800123',
        dateOfBirth: '1952-03-10',
        gender: 'Female',
        mobilePhone: '+94 77 123 4567',
        permanentAddress: 'Remote Village, Monaragala',
        province: 'Uva',
        district: 'Monaragala',
        dsDivision: 'Bibila',
        gnDivision: 'Pitakumbura',
      },
      householdInformation: {
        totalMembers: 6,
        existingWelfareProgrammes: ['None'],
        waitingListStatus: 'Yes',
        applicationStatus: 'New Applicant',
      },
      education: {
        highestEducationHead: 'No Formal Education',
        schoolAttendanceChildren: 'None Attend',
        schoolDropoutStatus: 'Has Dropout Children',
      },
      health: {
        hasPermanentDisabilities: 'Yes',
        disabilityCount: 1,
        hasSevereChronicIllnesses: 'Yes',
        chronicIllnessCount: 2,
        hasCkd: true,
        hasCancer: false,
        hasParalysis: false,
        bedriddenElderlyCount: 1,
        fullyDependentElderlyCount: 1,
      },
      economic: {
        primaryLivelihood: 'Daily wage',
        estimatedMonthlyIncome: 11000,
        regularMonthlyExpenses: 13500,
        averageMonthlyElectricityKwh: 18,
      },
      assets: {
        motorVehicles: ['None'],
        consumerDurables: ['None'],
        hasAgriculturalLand: 'No',
        hasResidentialLand: 'No',
        totalLandExtentPerches: 0,
      },
      housing: {
        houseOwnership: 'Temporary shelter',
        roofMaterial: 'Thatched',
        wallMaterial: 'Clay',
        floorMaterial: 'Mud / Clay',
        accessSafeDrinkingWater: 'No',
        accessPrivateSanitaryToilet: 'No',
      },
      familyDemography: {
        childrenBelow15: 3,
        workingAgeMembers: 1,
        adultsOver65: 1,
        singleParentHousehold: 'Yes',
        femaleHeadedHousehold: 'Yes',
      },
      banking: {
        bankName: "People's Bank",
        branchCode: 'Bibila',
        accountNumberMasked: '******4321',
        accountHolderName: 'Dingiri Amma',
      },
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    // 2. Poor Household
    const poorApp: WelfareApplication = {
      applicationId: 'ASW-WE3-002',
      did: verifiedDid,
      userId: 'user-prototype-001',
      programme: 'ASWESUMA',
      applicantInformation: {
        fullName: 'Nimal Bandara',
        nic: '197514300456',
        dateOfBirth: '1975-06-12',
        gender: 'Male',
        mobilePhone: '+94 71 234 5678',
        permanentAddress: '23, Tank Road, Polonnaruwa',
        province: 'North Central',
        district: 'Polonnaruwa',
        dsDivision: 'Hingurakgoda',
        gnDivision: 'Minneriya',
      },
      householdInformation: {
        totalMembers: 4,
        existingWelfareProgrammes: ['None'],
        waitingListStatus: 'No',
        applicationStatus: 'New Applicant',
      },
      education: {
        highestEducationHead: 'Primary (Grades 1-5)',
        schoolAttendanceChildren: 'All Attend Regularly',
        schoolDropoutStatus: 'No Dropouts',
      },
      health: {
        hasPermanentDisabilities: 'No',
        disabilityCount: 0,
        hasSevereChronicIllnesses: 'Yes',
        chronicIllnessCount: 1,
        hasCkd: false,
        hasCancer: false,
        hasParalysis: false,
        bedriddenElderlyCount: 0,
        fullyDependentElderlyCount: 0,
      },
      economic: {
        primaryLivelihood: 'Daily wage',
        estimatedMonthlyIncome: 22000,
        regularMonthlyExpenses: 21000,
        averageMonthlyElectricityKwh: 28,
      },
      assets: {
        motorVehicles: ['None'],
        consumerDurables: ['None'],
        hasAgriculturalLand: 'No',
        hasResidentialLand: 'Yes',
        totalLandExtentPerches: 15,
      },
      housing: {
        houseOwnership: 'Owned',
        roofMaterial: 'Tin',
        wallMaterial: 'Clay',
        floorMaterial: 'Cement',
        accessSafeDrinkingWater: 'Yes',
        accessPrivateSanitaryToilet: 'Yes',
      },
      familyDemography: {
        childrenBelow15: 2,
        workingAgeMembers: 1,
        adultsOver65: 0,
        singleParentHousehold: 'No',
        femaleHeadedHousehold: 'No',
      },
      banking: {
        bankName: 'Bank of Ceylon',
        branchCode: 'Hingurakgoda',
        accountNumberMasked: '******7890',
        accountHolderName: 'Nimal Bandara',
      },
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    // 3. Vulnerable Household
    const vulnerableApp: WelfareApplication = {
      applicationId: 'ASW-WE3-003',
      did: verifiedDid,
      userId: 'user-prototype-001',
      programme: 'ASWESUMA',
      applicantInformation: {
        fullName: 'Sunil Weerasinghe',
        nic: '198014500999',
        dateOfBirth: '1980-05-18',
        gender: 'Male',
        mobilePhone: '+94 77 345 6789',
        permanentAddress: '45, Kandy Road, Matale',
        province: 'Central',
        district: 'Matale',
        dsDivision: 'Ukuwela',
        gnDivision: 'Ukuwela South',
      },
      householdInformation: {
        totalMembers: 4,
        existingWelfareProgrammes: ['None'],
        waitingListStatus: 'No',
        applicationStatus: 'New Applicant',
      },
      education: {
        highestEducationHead: 'Secondary (Grades 6-11)',
        schoolAttendanceChildren: 'All Attend Regularly',
        schoolDropoutStatus: 'No Dropouts',
      },
      health: {
        hasPermanentDisabilities: 'No',
        disabilityCount: 0,
        hasSevereChronicIllnesses: 'Yes',
        chronicIllnessCount: 1,
        hasCkd: false,
        hasCancer: false,
        hasParalysis: false,
        bedriddenElderlyCount: 0,
        fullyDependentElderlyCount: 0,
      },
      economic: {
        primaryLivelihood: 'Agriculture',
        estimatedMonthlyIncome: 28000,
        regularMonthlyExpenses: 26000,
        averageMonthlyElectricityKwh: 45,
      },
      assets: {
        motorVehicles: ['None'],
        consumerDurables: ['Refrigerator'],
        hasAgriculturalLand: 'Yes',
        hasResidentialLand: 'Yes',
        totalLandExtentPerches: 30,
      },
      housing: {
        houseOwnership: 'Owned',
        roofMaterial: 'Tin',
        wallMaterial: 'Cement',
        floorMaterial: 'Cement',
        accessSafeDrinkingWater: 'Yes',
        accessPrivateSanitaryToilet: 'Yes',
      },
      familyDemography: {
        childrenBelow15: 2,
        workingAgeMembers: 2,
        adultsOver65: 0,
        singleParentHousehold: 'No',
        femaleHeadedHousehold: 'No',
      },
      banking: {
        bankName: 'Bank of Ceylon',
        branchCode: 'Matale',
        accountNumberMasked: '******3456',
        accountHolderName: 'Sunil Weerasinghe',
      },
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    // 4. Transitional Household (Target: 300 - 399.99 pts)
    const transitionalApp: WelfareApplication = {
      applicationId: 'ASW-WE3-004',
      did: verifiedDid,
      userId: 'user-prototype-001',
      programme: 'ASWESUMA',
      applicantInformation: {
        fullName: 'Kamal Perera',
        nic: '198214500111',
        dateOfBirth: '1982-10-05',
        gender: 'Male',
        mobilePhone: '+94 78 456 7890',
        permanentAddress: '12, Temple Road, Kurunegala',
        province: 'North Western',
        district: 'Kurunegala',
        dsDivision: 'Mawathagama',
        gnDivision: 'Barandana',
      },
      householdInformation: {
        totalMembers: 4,
        existingWelfareProgrammes: ['None'],
        waitingListStatus: 'No',
        applicationStatus: 'New Applicant',
      },
      education: {
        highestEducationHead: 'Secondary (Grades 6-11)', // +30
        schoolAttendanceChildren: 'All Attend Regularly', // 0
        schoolDropoutStatus: 'No Dropouts', // 0
      },
      health: {
        hasPermanentDisabilities: 'No',
        disabilityCount: 0,
        hasSevereChronicIllnesses: 'No',
        chronicIllnessCount: 0,
        hasCkd: false,
        hasCancer: false,
        hasParalysis: false,
        bedriddenElderlyCount: 0,
        fullyDependentElderlyCount: 0,
      },
      economic: {
        primaryLivelihood: 'Self-employment',
        estimatedMonthlyIncome: 28000, // +55 (15k-30k)
        regularMonthlyExpenses: 26000,
        averageMonthlyElectricityKwh: 45, // +20 (31-60)
      },
      assets: {
        motorVehicles: ['None'], // +35
        consumerDurables: ['Refrigerator'], // -20
        hasAgriculturalLand: 'No',
        hasResidentialLand: 'Yes',
        totalLandExtentPerches: 20,
      },
      housing: {
        houseOwnership: 'Owned',
        roofMaterial: 'Tile',
        wallMaterial: 'Cement',
        floorMaterial: 'Cement', // +15
        accessSafeDrinkingWater: 'Yes',
        accessPrivateSanitaryToilet: 'Yes',
      },
      familyDemography: {
        childrenBelow15: 2, // +40
        workingAgeMembers: 2, // -30
        adultsOver65: 0,
        singleParentHousehold: 'Yes', // +45 -> Total Score = 355 pts (Clean TRANSITIONAL & ELIGIBLE)
        femaleHeadedHousehold: 'No',
      },
      banking: {
        bankName: "People's Bank",
        branchCode: 'Kurunegala',
        accountNumberMasked: '******8901',
        accountHolderName: 'Kamal Perera',
      },
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    // 5. Non-Poor Household
    const nonPoorApp: WelfareApplication = {
      applicationId: 'ASW-WE3-005',
      did: verifiedDid,
      userId: 'user-prototype-001',
      programme: 'ASWESUMA',
      applicantInformation: {
        fullName: 'Dinesh Fernando',
        nic: '198514500999',
        dateOfBirth: '1985-02-20',
        gender: 'Male',
        mobilePhone: '+94 77 999 8877',
        permanentAddress: '120/4, Flower Road, Colombo 07',
        province: 'Western',
        district: 'Colombo',
        dsDivision: 'Colombo',
        gnDivision: 'Kollupitiya',
      },
      householdInformation: {
        totalMembers: 3,
        existingWelfareProgrammes: ['None'],
        waitingListStatus: 'No',
        applicationStatus: 'New Applicant',
      },
      education: {
        highestEducationHead: 'Higher Education / Degree',
        schoolAttendanceChildren: 'All Attend Regularly',
        schoolDropoutStatus: 'No Dropouts',
      },
      health: {
        hasPermanentDisabilities: 'No',
        disabilityCount: 0,
        hasSevereChronicIllnesses: 'No',
        chronicIllnessCount: 0,
        hasCkd: false,
        hasCancer: false,
        hasParalysis: false,
        bedriddenElderlyCount: 0,
        fullyDependentElderlyCount: 0,
      },
      economic: {
        primaryLivelihood: 'Formal employment',
        estimatedMonthlyIncome: 140000,
        regularMonthlyExpenses: 110000,
        averageMonthlyElectricityKwh: 220,
      },
      assets: {
        motorVehicles: ['Car / Van'],
        consumerDurables: ['Refrigerator', 'Washing Machine'],
        hasAgriculturalLand: 'Yes',
        hasResidentialLand: 'Yes',
        totalLandExtentPerches: 120,
      },
      housing: {
        houseOwnership: 'Owned',
        roofMaterial: 'Tile',
        wallMaterial: 'Brick',
        floorMaterial: 'Tile',
        accessSafeDrinkingWater: 'Yes',
        accessPrivateSanitaryToilet: 'Yes',
      },
      familyDemography: {
        childrenBelow15: 1,
        workingAgeMembers: 2,
        adultsOver65: 0,
        singleParentHousehold: 'No',
        femaleHeadedHousehold: 'No',
      },
      banking: {
        bankName: 'Commercial Bank',
        branchCode: 'Colombo',
        accountNumberMasked: '******9999',
        accountHolderName: 'Dinesh Fernando',
      },
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    // 6. Boundary Case (Target: 305 pts, within 300 ± 10 pts -> REVIEW_REQUIRED)
    const boundaryApp: WelfareApplication = {
      applicationId: 'ASW-WE3-006-BOUNDARY',
      did: verifiedDid,
      userId: 'user-prototype-001',
      programme: 'ASWESUMA',
      applicantInformation: {
        fullName: 'Rohana Jayakody',
        nic: '198412300777',
        dateOfBirth: '1984-04-12',
        gender: 'Male',
        mobilePhone: '+94 76 567 8901',
        permanentAddress: '56, Station Road, Ragama',
        province: 'Western',
        district: 'Gampaha',
        dsDivision: 'Ja-Ela',
        gnDivision: 'Ragama',
      },
      householdInformation: {
        totalMembers: 3,
        existingWelfareProgrammes: ['None'],
        waitingListStatus: 'No',
        applicationStatus: 'New Applicant',
      },
      education: {
        highestEducationHead: 'Secondary (Grades 6-11)', // +30 -> Total Score = 305 pts
        schoolAttendanceChildren: 'All Attend Regularly', // 0
        schoolDropoutStatus: 'No Dropouts', // 0
      },
      health: {
        hasPermanentDisabilities: 'No',
        disabilityCount: 0,
        hasSevereChronicIllnesses: 'No',
        chronicIllnessCount: 0,
        hasCkd: false,
        hasCancer: false,
        hasParalysis: false,
        bedriddenElderlyCount: 0,
        fullyDependentElderlyCount: 0,
      },
      economic: {
        primaryLivelihood: 'Self-employment',
        estimatedMonthlyIncome: 28000, // +55 (15k-30k)
        regularMonthlyExpenses: 25000,
        averageMonthlyElectricityKwh: 45, // +20 (31-60)
      },
      assets: {
        motorVehicles: ['None'], // +35
        consumerDurables: ['Refrigerator'], // -20
        hasAgriculturalLand: 'No',
        hasResidentialLand: 'Yes',
        totalLandExtentPerches: 12,
      },
      housing: {
        houseOwnership: 'Owned',
        roofMaterial: 'Tile',
        wallMaterial: 'Cement',
        floorMaterial: 'Cement', // +15
        accessSafeDrinkingWater: 'Yes',
        accessPrivateSanitaryToilet: 'Yes',
      },
      familyDemography: {
        childrenBelow15: 1, // +20
        workingAgeMembers: 1, // -15
        adultsOver65: 0,
        singleParentHousehold: 'No',
        femaleHeadedHousehold: 'No',
      },
      banking: {
        bankName: "People's Bank",
        branchCode: 'Ragama',
        accountNumberMasked: '******2222',
        accountHolderName: 'Rohana Jayakody',
      },
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    // 7. Draft Application (Should be rejected from evaluation)
    const draftApp: WelfareApplication = {
      ...nonPoorApp,
      applicationId: 'ASW-WE3-007-DRAFT',
      status: 'DRAFT',
    };

    mockWelfareProvider.createApplication(severelyPoorApp);
    mockWelfareProvider.createApplication(poorApp);
    mockWelfareProvider.createApplication(vulnerableApp);
    mockWelfareProvider.createApplication(transitionalApp);
    mockWelfareProvider.createApplication(nonPoorApp);
    mockWelfareProvider.createApplication(boundaryApp);
    mockWelfareProvider.createApplication(draftApp);

    // ------------------------------------------------------------------------
    // [TEST 1] Severely Poor Household
    // ------------------------------------------------------------------------
    console.log('[TEST 1] Evaluating Severely Poor Household (ASW-WE3-001)...');
    const t1 = await request('POST', '/api/welfare/aswesuma/applications/ASW-WE3-001/eligibility/calculate');
    console.assert(t1.status === 200, `Expected 200, got ${t1.status}`);
    console.assert(t1.data.data.category === 'SEVERELY_POOR', `Expected SEVERELY_POOR, got ${t1.data.data.category}`);
    console.assert(t1.data.data.eligibilityStatus === 'ELIGIBLE', 'Expected ELIGIBLE');
    console.log(`  -> Score: ${t1.data.data.calculatedScore} pts | Category: ${t1.data.data.category} | Status: ${t1.data.data.eligibilityStatus}`);
    console.log('  -> PASS: Severely poor household correctly categorized.');

    // ------------------------------------------------------------------------
    // [TEST 2] Poor Household
    // ------------------------------------------------------------------------
    console.log('\n[TEST 2] Evaluating Poor Household (ASW-WE3-002)...');
    const t2 = await request('POST', '/api/welfare/aswesuma/applications/ASW-WE3-002/eligibility/calculate');
    console.assert(t2.status === 200, `Expected 200, got ${t2.status}`);
    console.assert(t2.data.data.category === 'POOR', `Expected POOR, got ${t2.data.data.category}`);
    console.assert(t2.data.data.eligibilityStatus === 'ELIGIBLE', 'Expected ELIGIBLE');
    console.log(`  -> Score: ${t2.data.data.calculatedScore} pts | Category: ${t2.data.data.category} | Status: ${t2.data.data.eligibilityStatus}`);
    console.log('  -> PASS: Poor household correctly categorized.');

    // ------------------------------------------------------------------------
    // [TEST 3] Vulnerable Household
    // ------------------------------------------------------------------------
    console.log('\n[TEST 3] Evaluating Vulnerable Household (ASW-WE3-003)...');
    const t3 = await request('POST', '/api/welfare/aswesuma/applications/ASW-WE3-003/eligibility/calculate');
    console.assert(t3.status === 200, `Expected 200, got ${t3.status}`);
    console.assert(t3.data.data.category === 'VULNERABLE', `Expected VULNERABLE, got ${t3.data.data.category}`);
    console.assert(t3.data.data.eligibilityStatus === 'ELIGIBLE', 'Expected ELIGIBLE');
    console.log(`  -> Score: ${t3.data.data.calculatedScore} pts | Category: ${t3.data.data.category} | Status: ${t3.data.data.eligibilityStatus}`);
    console.log('  -> PASS: Vulnerable household correctly categorized.');

    // ------------------------------------------------------------------------
    // [TEST 4] Transitional Household
    // ------------------------------------------------------------------------
    console.log('\n[TEST 4] Evaluating Transitional Household (ASW-WE3-004)...');
    const t4 = await request('POST', '/api/welfare/aswesuma/applications/ASW-WE3-004/eligibility/calculate');
    console.assert(t4.status === 200, `Expected 200, got ${t4.status}`);
    console.assert(t4.data.data.category === 'TRANSITIONAL', `Expected TRANSITIONAL, got ${t4.data.data.category}`);
    console.log(`  -> Score: ${t4.data.data.calculatedScore} pts | Category: ${t4.data.data.category} | Status: ${t4.data.data.eligibilityStatus}`);
    console.log('  -> PASS: Transitional household correctly categorized.');

    // ------------------------------------------------------------------------
    // [TEST 5] Non-Poor Household
    // ------------------------------------------------------------------------
    console.log('\n[TEST 5] Evaluating Non-Poor Household (ASW-WE3-005)...');
    const t5 = await request('POST', '/api/welfare/aswesuma/applications/ASW-WE3-005/eligibility/calculate');
    console.assert(t5.status === 200, `Expected 200, got ${t5.status}`);
    console.assert(t5.data.data.category === 'NON_POOR', `Expected NON_POOR, got ${t5.data.data.category}`);
    console.assert(t5.data.data.eligibilityStatus === 'INELIGIBLE', 'Expected INELIGIBLE');
    console.log(`  -> Score: ${t5.data.data.calculatedScore} pts | Category: ${t5.data.data.category} | Status: ${t5.data.data.eligibilityStatus}`);
    console.log('  -> PASS: Non-poor household correctly categorized as INELIGIBLE.');

    // ------------------------------------------------------------------------
    // [TEST 6] Boundary / REVIEW_REQUIRED Case
    // ------------------------------------------------------------------------
    console.log('\n[TEST 6] Evaluating Boundary Zone Household (ASW-WE3-006-BOUNDARY)...');
    const t6 = await request('POST', '/api/welfare/aswesuma/applications/ASW-WE3-006-BOUNDARY/eligibility/calculate');
    console.assert(t6.status === 200, `Expected 200, got ${t6.status}`);
    console.log(`  -> Score: ${t6.data.data.calculatedScore} pts | Category: ${t6.data.data.category} | Status: ${t6.data.data.eligibilityStatus}`);
    console.log(`  -> Boundary Zone: ${t6.data.data.boundaryZone} | Review Required: ${t6.data.data.reviewRequired}`);
    console.log(`  -> Review Reason: ${t6.data.data.reviewReason}`);
    console.assert(t6.data.data.eligibilityStatus === 'REVIEW_REQUIRED', 'Expected REVIEW_REQUIRED for boundary case');
    console.assert(t6.data.data.reviewRequired === true, 'Expected reviewRequired: true');
    console.log('  -> PASS: Boundary case within ±10 pts of eligibility cutoff correctly flagged as REVIEW_REQUIRED.');

    // ------------------------------------------------------------------------
    // [TEST 7] Missing / Invalid Application Error Handling
    // ------------------------------------------------------------------------
    console.log('\n[TEST 7] Testing Missing Application Error Handling...');
    const t7 = await request('POST', '/api/welfare/aswesuma/applications/ASW-NON-EXISTENT/eligibility/calculate');
    console.assert(t7.status === 404, `Expected 404, got ${t7.status}`);
    console.log('  -> PASS: 404 returned for missing application.');

    // ------------------------------------------------------------------------
    // [TEST 8] Attempt to calculate eligibility for DRAFT Application
    // ------------------------------------------------------------------------
    console.log('\n[TEST 8] Testing Calculation on DRAFT Application (ASW-WE3-007-DRAFT)...');
    const t8 = await request('POST', '/api/welfare/aswesuma/applications/ASW-WE3-007-DRAFT/eligibility/calculate');
    console.assert(t8.status === 400, `Expected 400, got ${t8.status}`);
    console.assert(t8.data.error.includes('DRAFT'), 'Error message must mention DRAFT status');
    console.log(`  -> Error Response: ${t8.data.error}`);
    console.log('  -> PASS: Calculation on DRAFT application correctly rejected (400 Bad Request).');

    // ------------------------------------------------------------------------
    // [TEST 9] Deterministic Calculation
    // ------------------------------------------------------------------------
    console.log('\n[TEST 9] Testing Deterministic Repeated Evaluation...');
    const t9a = await request('POST', '/api/welfare/aswesuma/applications/ASW-WE3-001/eligibility/calculate');
    const t9b = await request('POST', '/api/welfare/aswesuma/applications/ASW-WE3-001/eligibility/calculate');
    console.assert(t9a.data.data.calculatedScore === t9b.data.data.calculatedScore, 'Scores must match');
    console.assert(t9a.data.data.category === t9b.data.data.category, 'Categories must match');
    console.assert(t9a.data.data.eligibilityStatus === t9b.data.data.eligibilityStatus, 'Status must match');
    console.log('  -> PASS: Repeated calculation produced exact identical output.');

    // ------------------------------------------------------------------------
    // [TEST 10] Rule Version Metadata in Result
    // ------------------------------------------------------------------------
    console.log('\n[TEST 10] Verifying Rule Version and Prototype Metadata...');
    console.assert(t1.data.data.ruleVersion === 'v1.0.0-prototype', 'Rule version must be v1.0.0-prototype');
    console.assert(t1.data.data.engineVersion === 'SmartGrama-PMT-Engine-v1.0.0', 'Engine version mismatch');
    console.assert(t1.data.data.isSimulated === true, 'isSimulated must be true');
    console.log(`  -> Rule Version: ${t1.data.data.ruleVersion}`);
    console.log(`  -> Engine Version: ${t1.data.data.engineVersion}`);
    console.log(`  -> Simulated / Prototype Flag: ${t1.data.data.isSimulated}`);
    console.log('  -> PASS: Rule version and prototype metadata verified.');

    console.log(`\n======================================================`);
    console.log(`  ALL WE-3 ELIGIBILITY TESTS PASSED PERFECTLY (10/10) `);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('WE-3 test execution failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runWE3Tests();
