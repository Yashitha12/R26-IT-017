import http from 'http';
import app from './app';

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

async function runAswesumaTests() {
  server = app.listen(PORT);
  console.log(`\n======================================================`);
  console.log(`  STARTING ASWESUMA APPLICATION MODULE TEST SUITE    `);
  console.log(`======================================================\n`);

  try {
    // 1. Non-existent application lookup
    console.log('[TEST 1] Querying non-existent application...');
    const nonExistent = await request('GET', '/api/welfare/aswesuma/applications/ASW-2026-999999');
    console.assert(nonExistent.status === 404, `Expected 404, got ${nonExistent.status}`);
    console.log('  -> PASS: 404 correctly returned for non-existent application.');

    // 2. Reject unverified citizen submission
    console.log('\n[TEST 2] Testing gatekeeping: Submitting with unverified / fake DID...');
    const unverifiedAttempt = await request('POST', '/api/welfare/aswesuma/applications', {
      did: 'did:smartgrama:prototype:unverified999',
      applicantInformation: {
        fullName: 'Fake Applicant',
        nic: '199000000000',
        dateOfBirth: '01/01/1990',
        gender: 'Male',
        mobilePhone: '+94 77 000 0000',
        permanentAddress: 'Unknown',
        province: 'Western',
        district: 'Colombo',
        dsDivision: 'Colombo',
        gnDivision: 'Fort',
      },
      banking: {
        bankName: 'Sampath Bank',
        branchCode: '001',
        accountNumberMasked: '12345678',
        accountHolderName: 'Fake Applicant',
      },
    });
    console.assert(unverifiedAttempt.status === 403, `Expected 403, got ${unverifiedAttempt.status}`);
    console.log(`  -> PASS: Gatekeeper blocked unverified submission (Status: ${unverifiedAttempt.status}).`);

    // 3. Validation failure test
    console.log('\n[TEST 3] Testing validation: Submitting with missing required fields...');
    const invalidAttempt = await request('POST', '/api/welfare/aswesuma/applications', {
      did: 'did:smartgrama:prototype:001',
      applicantInformation: {} as any,
    });
    console.assert(invalidAttempt.status === 400, `Expected 400, got ${invalidAttempt.status}`);
    console.log('  -> PASS: 400 returned for missing required fields.');

    // 4. Successful submission by verified citizen
    console.log('\n[TEST 4] Submitting valid 10-step Aswesuma application for verified DID: did:smartgrama:prototype:001...');
    const validPayload = {
      did: 'did:smartgrama:prototype:001',
      userId: 'user-prototype-001',
      applicantInformation: {
        fullName: 'Aravinda Kumara',
        nic: '200223003053',
        dateOfBirth: '01/12/2002',
        gender: 'Male',
        mobilePhone: '+94 78 145 3248',
        permanentAddress: '45/A, Jayawickrama Road',
        province: 'Western',
        district: 'Gampaha',
        dsDivision: 'Minuwangoda',
        gnDivision: 'Minuwangoda North',
      },
      householdInformation: {
        totalMembers: 4,
        existingWelfareProgrammes: ['Samurdhi'],
        waitingListStatus: 'No',
        applicationStatus: 'New Applicant',
      },
      education: {
        highestEducationHead: 'G.C.E. A/L',
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
        primaryLivelihood: 'Agriculture',
        secondaryLivelihood: 'Self-employment',
        estimatedMonthlyIncome: 35000,
        regularMonthlyExpenses: 30000,
        averageMonthlyElectricityKwh: 45,
      },
      assets: {
        motorVehicles: ['Motorcycle'],
        consumerDurables: ['Refrigerator', 'Television'],
        hasAgriculturalLand: 'Yes',
        hasResidentialLand: 'Yes',
        totalLandExtentPerches: 40,
      },
      housing: {
        houseOwnership: 'Owned',
        roofMaterial: 'Tile',
        wallMaterial: 'Brick',
        floorMaterial: 'Cement',
        accessSafeDrinkingWater: 'Yes',
        accessPrivateSanitaryToilet: 'Yes',
      },
      familyDemography: {
        childrenBelow15: 1,
        workingAgeMembers: 2,
        adultsOver65: 1,
        singleParentHousehold: 'No',
        femaleHeadedHousehold: 'No',
      },
      banking: {
        bankName: 'Sampath Bank',
        branchCode: '042',
        accountNumberMasked: '000123456789',
        accountHolderName: 'Aravinda Kumara',
      },
    };

    const submitRes = await request('POST', '/api/welfare/aswesuma/applications', validPayload);
    console.assert(submitRes.status === 201, `Expected 201, got ${submitRes.status}`);
    console.assert(submitRes.data?.data?.applicationId === 'ASW-2026-000001', 'Expected ID ASW-2026-000001');
    console.assert(submitRes.data?.data?.status === 'SUBMITTED', 'Expected status SUBMITTED');
    console.log(`  -> PASS: Application created: ${submitRes.data?.data?.applicationId} (Status: ${submitRes.data?.data?.status})`);

    // 5. Query created application by ID
    console.log('\n[TEST 5] Querying application by ID: ASW-2026-000001...');
    const getByIdRes = await request('GET', '/api/welfare/aswesuma/applications/ASW-2026-000001');
    console.assert(getByIdRes.status === 200, `Expected 200, got ${getByIdRes.status}`);
    console.assert(getByIdRes.data?.data?.applicantInformation?.fullName === 'Aravinda Kumara', 'Applicant name mismatch');
    console.log(`  -> PASS: Retrieved application for ${getByIdRes.data?.data?.applicantInformation?.fullName}`);

    // 6. Query applications by DID
    console.log('\n[TEST 6] Querying applications for DID: did:smartgrama:prototype:001...');
    const getByDidRes = await request('GET', '/api/welfare/aswesuma/applications/did/did:smartgrama:prototype:001');
    console.assert(getByDidRes.status === 200, `Expected 200, got ${getByDidRes.status}`);
    console.assert(Array.isArray(getByDidRes.data?.data) && getByDidRes.data.data.length === 1, 'Expected 1 application for DID');
    console.log(`  -> PASS: Found ${getByDidRes.data?.data?.length} application(s) linked to DID.`);

    console.log(`\n======================================================`);
    console.log(`  ALL ASWESUMA BACKEND TESTS PASSED (6/6)             `);
    console.log(`======================================================\n`);
  } finally {
    server.close();
  }
}

runAswesumaTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
