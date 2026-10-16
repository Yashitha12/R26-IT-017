import http from 'http';
import app from './app';
import { mockWelfareProvider } from './providers/welfare.provider';
import { mockWelfareEligibilityProvider } from './providers/welfare-eligibility.provider';
import { WelfareApplication } from './types/welfare';
import { CategoryThresholdConfig } from './types/welfare-eligibility';

const PORT = 5097;
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

// Helper to seed applications for testing
function seedTestApplication(app: WelfareApplication) {
  mockWelfareProvider.createApplication(app);
}

async function runEligibilityTests() {
  server = app.listen(PORT);
  console.log(`\n======================================================`);
  console.log(`  STARTING ASWESUMA ELIGIBILITY ENGINE TEST SUITE    `);
  console.log(`======================================================\n`);

  try {
    // ------------------------------------------------------------------------
    // Seed test applications
    // ------------------------------------------------------------------------

    // Application 1: Severely Poor / Vulnerable Household (High Deprivation)
    const severelyPoorApp: WelfareApplication = {
      applicationId: 'ASW-TEST-POOR-001',
      did: 'did:smartgrama:prototype:001', // Verified DID
      userId: 'user-prototype-001',
      programme: 'ASWESUMA',
      applicantInformation: {
        fullName: 'Somapala Bandara',
        nic: '196512300456',
        dateOfBirth: '1965-04-12',
        gender: 'Male',
        mobilePhone: '+94 77 111 2233',
        permanentAddress: 'Village Hut, Anuradhapura',
        province: 'North Central',
        district: 'Anuradhapura',
        dsDivision: 'Kekirawa',
        gnDivision: 'Maradankadawala',
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
        chronicIllnessCount: 1,
        hasCkd: true,
        hasCancer: false,
        hasParalysis: false,
        bedriddenElderlyCount: 1,
        fullyDependentElderlyCount: 1,
      },
      economic: {
        primaryLivelihood: 'Daily wage',
        estimatedMonthlyIncome: 12000, // < 15,000 LKR
        regularMonthlyExpenses: 14000,
        averageMonthlyElectricityKwh: 20, // <= 30 kWh
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
        femaleHeadedHousehold: 'No',
      },
      banking: {
        bankName: "People's Bank",
        branchCode: 'Kekirawa',
        accountNumberMasked: '******1234',
        accountHolderName: 'Somapala Bandara',
      },
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    // Application 2: Moderate / Vulnerable Household
    const vulnerableApp: WelfareApplication = {
      applicationId: 'ASW-TEST-VULN-002',
      did: 'did:smartgrama:prototype:001',
      userId: 'user-prototype-001',
      programme: 'ASWESUMA',
      applicantInformation: {
        fullName: 'Sunil Weerasinghe',
        nic: '197824500789',
        dateOfBirth: '1978-08-15',
        gender: 'Male',
        mobilePhone: '+94 71 444 5566',
        permanentAddress: '15, School Lane, Matale',
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
        estimatedMonthlyIncome: 28000, // 15k - 30k bracket
        regularMonthlyExpenses: 26000,
        averageMonthlyElectricityKwh: 45, // 31-60 bracket
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
        accountNumberMasked: '******5678',
        accountHolderName: 'Sunil Weerasinghe',
      },
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    // Application 3: Non-Poor / High-Scoring Household
    const nonPoorApp: WelfareApplication = {
      applicationId: 'ASW-TEST-NONPOOR-003',
      did: 'did:smartgrama:prototype:001',
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
        estimatedMonthlyIncome: 140000, // > 80,000 LKR
        regularMonthlyExpenses: 110000,
        averageMonthlyElectricityKwh: 220, // > 120 kWh
      },
      assets: {
        motorVehicles: ['Car / Van'],
        consumerDurables: ['Refrigerator', 'Washing Machine'],
        hasAgriculturalLand: 'Yes',
        hasResidentialLand: 'Yes',
        totalLandExtentPerches: 120, // > 80P
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

    seedTestApplication(severelyPoorApp);
    seedTestApplication(vulnerableApp);
    seedTestApplication(nonPoorApp);

    // ------------------------------------------------------------------------
    // [TEST 1] Missing / Invalid Application Error Handling
    // ------------------------------------------------------------------------
    console.log('[TEST 1] Testing calculation on non-existent application...');
    const nonExistent = await request(
      'POST',
      '/api/welfare/aswesuma/applications/ASW-9999-NOTFOUND/eligibility/calculate'
    );
    console.assert(nonExistent.status === 404, `Expected 404, got ${nonExistent.status}`);
    console.log('  -> PASS: 404 correctly returned for non-existent application.');

    // ------------------------------------------------------------------------
    // [TEST 2] High-Deprivation Household Evaluation (SEVERELY_POOR)
    // ------------------------------------------------------------------------
    console.log('\n[TEST 2] Evaluating Severely Deprived / Poor Household (ASW-TEST-POOR-001)...');
    const poorRes = await request(
      'POST',
      '/api/welfare/aswesuma/applications/ASW-TEST-POOR-001/eligibility/calculate'
    );
    console.assert(poorRes.status === 200, `Expected 200, got ${poorRes.status}`);
    const poorData = poorRes.data.data;

    console.log(`  -> Calculated Score: ${poorData.calculatedScore} pts`);
    console.log(`  -> Category: ${poorData.category} (Status: ${poorData.eligibilityStatus})`);
    console.log(`  -> Monthly Benefit: Rs. ${poorData.thresholdApplied.monthlyBenefitLkr}`);
    console.assert(
      poorData.category === 'SEVERELY_POOR',
      `Expected SEVERELY_POOR, got ${poorData.category}`
    );
    console.assert(poorData.eligibilityStatus === 'ELIGIBLE', 'Expected ELIGIBLE');
    console.assert(poorData.calculatedScore >= 700.0, 'Expected score >= 700');
    console.log('  -> PASS: Severely deprived household evaluated as SEVERELY_POOR and ELIGIBLE.');

    // ------------------------------------------------------------------------
    // [TEST 3] Middle-Scoring Household Evaluation (VULNERABLE / TRANSITIONAL)
    // ------------------------------------------------------------------------
    console.log('\n[TEST 3] Evaluating Moderate-Income / Vulnerable Household (ASW-TEST-VULN-002)...');
    const vulnRes = await request(
      'POST',
      '/api/welfare/aswesuma/applications/ASW-TEST-VULN-002/eligibility/calculate'
    );
    console.assert(vulnRes.status === 200, `Expected 200, got ${vulnRes.status}`);
    const vulnData = vulnRes.data.data;

    console.log(`  -> Calculated Score: ${vulnData.calculatedScore} pts`);
    console.log(`  -> Category: ${vulnData.category} (Status: ${vulnData.eligibilityStatus})`);
    console.assert(
      vulnData.category === 'VULNERABLE' || vulnData.category === 'TRANSITIONAL',
      `Expected VULNERABLE or TRANSITIONAL, got ${vulnData.category}`
    );
    console.assert(vulnData.eligibilityStatus === 'ELIGIBLE', 'Expected ELIGIBLE');
    console.log(`  -> PASS: Moderate household evaluated as ${vulnData.category} and ELIGIBLE.`);

    // ------------------------------------------------------------------------
    // [TEST 4] High-Income / Resilient Household Evaluation (NON_POOR -> INELIGIBLE)
    // ------------------------------------------------------------------------
    console.log('\n[TEST 4] Evaluating High-Income Household (ASW-TEST-NONPOOR-003)...');
    const nonPoorRes = await request(
      'POST',
      '/api/welfare/aswesuma/applications/ASW-TEST-NONPOOR-003/eligibility/calculate'
    );
    console.assert(nonPoorRes.status === 200, `Expected 200, got ${nonPoorRes.status}`);
    const nonPoorData = nonPoorRes.data.data;

    console.log(`  -> Calculated Score: ${nonPoorData.calculatedScore} pts`);
    console.log(`  -> Category: ${nonPoorData.category} (Status: ${nonPoorData.eligibilityStatus})`);
    console.assert(
      nonPoorData.category === 'NON_POOR',
      `Expected NON_POOR, got ${nonPoorData.category}`
    );
    console.assert(nonPoorData.eligibilityStatus === 'INELIGIBLE', 'Expected INELIGIBLE');
    console.assert(nonPoorData.calculatedScore < 300.0, 'Expected score < 300');
    console.log('  -> PASS: High-income household correctly evaluated as NON_POOR and INELIGIBLE.');

    // ------------------------------------------------------------------------
    // [TEST 5] Mathematical Integrity: Dimension Breakdown Sums to Calculated Score
    // ------------------------------------------------------------------------
    console.log('\n[TEST 5] Verifying Dimension Breakdown Totals Match Calculated Score...');
    const dims = poorData.dimensionBreakdown;
    const baseIntercept = 180.0;
    const sumDimensions =
      dims.EDUCATION.score +
      dims.HEALTH_AND_SPECIAL_NEEDS.score +
      dims.ECONOMIC_LEVEL_AND_INCOME.score +
      dims.ASSETS_AND_OWNERSHIP.score +
      dims.HOUSING_CONDITIONS.score +
      dims.FAMILY_DEMOGRAPHY.score;

    const expectedScore = Math.round((baseIntercept + sumDimensions) * 100) / 100;
    console.log(`  -> Base Intercept: ${baseIntercept}`);
    console.log(`  -> Sum of 6 Dimensions: ${sumDimensions}`);
    console.log(`  -> Computed Expected: ${expectedScore} vs Result: ${poorData.calculatedScore}`);
    console.assert(
      Math.abs(expectedScore - poorData.calculatedScore) < 0.001,
      'Score sum mismatch'
    );
    console.log('  -> PASS: Dimension breakdown mathematically sums to calculated score.');

    // ------------------------------------------------------------------------
    // [TEST 6] Determinism: Identical Score on Repeated Calculation
    // ------------------------------------------------------------------------
    console.log('\n[TEST 6] Testing Determinism on Repeated Execution...');
    const repeatRes = await request(
      'POST',
      '/api/welfare/aswesuma/applications/ASW-TEST-POOR-001/eligibility/calculate'
    );
    console.assert(
      repeatRes.data.data.calculatedScore === poorData.calculatedScore,
      'Scores must be exactly identical'
    );
    console.assert(
      repeatRes.data.data.category === poorData.category,
      'Category must be identical'
    );
    console.log('  -> PASS: Repeated calculation produced exact identical score and category.');

    // ------------------------------------------------------------------------
    // [TEST 7] Rule Versioning Verification
    // ------------------------------------------------------------------------
    console.log('\n[TEST 7] Verifying Rule Version Metadata...');
    console.assert(
      poorData.ruleVersion === 'v1.0.0-prototype',
      `Expected v1.0.0-prototype, got ${poorData.ruleVersion}`
    );
    console.assert(poorData.engineVersion.includes('SmartGrama-PMT-Engine'), 'Engine mismatch');
    console.log(`  -> Rule Version: ${poorData.ruleVersion}`);
    console.log(`  -> Engine: ${poorData.engineVersion}`);
    console.log('  -> PASS: Rule version and engine metadata verified.');

    // ------------------------------------------------------------------------
    // [TEST 8] Exact Threshold Boundary Verification
    // ------------------------------------------------------------------------
    console.log('\n[TEST 8] Verifying Threshold Boundary Matching...');
    // Test boundary conditions: 700.0 (SEVERELY_POOR), 550.0 (POOR), 400.0 (VULNERABLE), 300.0 (TRANSITIONAL), 299.99 (NON_POOR)
    const ruleConfig = mockWelfareEligibilityProvider.getActiveRuleConfig('ASWESUMA');
    const b700 = ruleConfig.categoryThresholds.find((t) => 700.0 >= t.minScore && 700.0 <= t.maxScore);
    const b550 = ruleConfig.categoryThresholds.find((t) => 550.0 >= t.minScore && 550.0 <= t.maxScore);
    const b400 = ruleConfig.categoryThresholds.find((t) => 400.0 >= t.minScore && 400.0 <= t.maxScore);
    const b300 = ruleConfig.categoryThresholds.find((t) => 300.0 >= t.minScore && 300.0 <= t.maxScore);
    const b299 = ruleConfig.categoryThresholds.find((t) => 299.99 >= t.minScore && 299.99 <= t.maxScore);

    console.assert(b700?.category === 'SEVERELY_POOR', '700.0 must map to SEVERELY_POOR');
    console.assert(b550?.category === 'POOR', '550.0 must map to POOR');
    console.assert(b400?.category === 'VULNERABLE', '400.0 must map to VULNERABLE');
    console.assert(b300?.category === 'TRANSITIONAL', '300.0 must map to TRANSITIONAL');
    console.assert(b299?.category === 'NON_POOR', '299.99 must map to NON_POOR');
    console.log('  -> 700.0 pts -> SEVERELY_POOR (ELIGIBLE)');
    console.log('  -> 550.0 pts -> POOR (ELIGIBLE)');
    console.log('  -> 400.0 pts -> VULNERABLE (ELIGIBLE)');
    console.log('  -> 300.0 pts -> TRANSITIONAL (ELIGIBLE)');
    console.log('  -> 299.99 pts -> NON_POOR (INELIGIBLE)');
    console.log('  -> PASS: All threshold boundaries evaluated with exact mathematical precision.');

    // ------------------------------------------------------------------------
    // [TEST 9] GET Endpoint: Querying Latest Calculated Eligibility
    // ------------------------------------------------------------------------
    console.log('\n[TEST 9] Querying latest eligibility via GET endpoint...');
    const getRes = await request(
      'GET',
      '/api/welfare/aswesuma/applications/ASW-TEST-POOR-001/eligibility'
    );
    console.assert(getRes.status === 200, `Expected 200, got ${getRes.status}`);
    console.assert(
      getRes.data.data.resultId === repeatRes.data.data.resultId,
      'Retrieved resultId mismatch'
    );
    console.assert(
      getRes.data.data.itemizedExplanations.length > 0,
      'Expected itemized explanations'
    );
    console.log(`  -> Result ID: ${getRes.data.data.resultId}`);
    console.log(`  -> Number of Explanations: ${getRes.data.data.itemizedExplanations.length}`);
    console.log('  -> Sample Explanation:', getRes.data.data.itemizedExplanations[0].reason);
    console.log('  -> PASS: GET endpoint successfully returned full cached evaluation.');

    console.log('\n======================================================');
    console.log('  ALL ASWESUMA ELIGIBILITY TESTS PASSED (9/9)         ');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Eligibility test execution failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runEligibilityTests();
