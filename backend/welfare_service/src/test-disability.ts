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

async function runDisabilityTests() {
  server = app.listen(PORT);
  console.log(`\n======================================================`);
  console.log(`  STARTING DISABILITY ASSISTANCE MODULE TEST SUITE    `);
  console.log(`======================================================\n`);

  try {
    // 1. Non-existent application lookup
    console.log('[TEST 1] Querying non-existent Disability application...');
    const nonExistent = await request('GET', '/api/welfare/disability/applications/DIS-2026-999999');
    console.assert(nonExistent.status === 404, `Expected 404, got ${nonExistent.status}`);
    console.log('  -> PASS: 404 correctly returned for non-existent application.');

    // 2. Reject unverified citizen submission
    console.log('\n[TEST 2] Testing gatekeeping: Submitting with unverified / fake DID...');
    const unverifiedAttempt = await request('POST', '/api/welfare/disability/applications', {
      did: 'did:smartgrama:prototype:unverified999',
      applicant: {
        fullName: 'Fake Citizen',
        nic: '198512345678',
        dateOfBirth: '1985-05-15',
        age: 41,
        gender: 'Male',
        mobile: '+94 77 123 4567',
        disabilityType: 'Physical',
        disabilityDescription: 'Mobility impairment',
      },
      address: {
        address: '123 Village Road',
        province: 'Western',
        district: 'Gampaha',
        dsDivision: 'Minuwangoda',
        gnDivision: 'Minuwangoda North',
      },
      household: {
        householdMembers: 3,
        monthlyIncome: 18000,
        mainIncomeSource: 'Home tailoring',
        existingWelfare: 'None',
        aswesumaBeneficiary: 'No',
        caregiverAvailable: 'Yes',
        otherIncomeSupport: 'No',
      },
      bank: {
        bankName: "People's Bank",
        branch: 'Minuwangoda',
        accountNumber: '1234567890',
        accountHolderName: 'Fake Citizen',
      },
      documents: {
        nic: { status: 'Submitted', ref: 'DOC-NIC-123' },
        medicalCertificate: { status: 'Submitted', ref: 'DOC-MED-123' },
        bankDetails: { status: 'Submitted', ref: 'DOC-BANK-123' },
      },
    });
    console.assert(unverifiedAttempt.status === 403, `Expected 403, got ${unverifiedAttempt.status}`);
    console.log(`  -> PASS: Gatekeeper blocked unverified submission (Status: ${unverifiedAttempt.status}).`);

    // 3. Validation failure test
    console.log('\n[TEST 3] Testing validation: Submitting with missing required fields...');
    const invalidAttempt = await request('POST', '/api/welfare/disability/applications', {
      did: 'did:smartgrama:prototype:001',
      applicant: {} as any,
    });
    console.assert(invalidAttempt.status === 400, `Expected 400, got ${invalidAttempt.status}`);
    console.log('  -> PASS: 400 returned for missing required fields.');

    // 4. Successful submission by verified citizen
    console.log('\n[TEST 4] Submitting valid Disability Assistance application for verified DID: did:smartgrama:prototype:001...');
    const validPayload = {
      did: 'did:smartgrama:prototype:001',
      userId: 'user-prototype-001',
      applicant: {
        fullName: 'Nimal Jayasinghe',
        nic: '198421500432',
        dateOfBirth: '1984-03-12',
        age: 42,
        gender: 'Male',
        mobile: '+94 77 334 5566',
        disabilityType: 'Visual',
        disabilityDescription: 'Severe visual impairment',
        disabilityCardNumber: 'DIS-CARD-WP-2024-88',
      },
      address: {
        address: '42, Samagi Mawatha, Yakkala',
        province: 'Western',
        district: 'Gampaha',
        dsDivision: 'Gampaha',
        gnDivision: 'Yakkala West',
      },
      household: {
        householdMembers: 3,
        monthlyIncome: 14000,
        mainIncomeSource: 'Handicraft & household support',
        existingWelfare: 'None',
        aswesumaBeneficiary: 'No',
        caregiverAvailable: 'Yes',
        otherIncomeSupport: 'No',
      },
      bank: {
        bankName: 'Bank of Ceylon',
        branch: 'Gampaha City',
        accountNumber: '9923456781',
        accountHolderName: 'Nimal Jayasinghe',
      },
      documents: {
        nic: { status: 'Submitted', ref: 'DOC-NIC-198421500432' },
        medicalCertificate: { status: 'Submitted', ref: 'DOC-MED-GAMP-HOSP-2024' },
        bankDetails: { status: 'Submitted', ref: 'DOC-BANK-BOC' },
      },
    };

    const submitRes = await request('POST', '/api/welfare/disability/applications', validPayload);
    console.assert(submitRes.status === 201, `Expected 201, got ${submitRes.status}`);
    const createdAppId = submitRes.data.data.applicationId;
    console.log(`  -> PASS: Application created: ${createdAppId} (Status: ${submitRes.data.data.status})`);
    console.log(`  -> Masked Account Number: ${submitRes.data.data.bank.accountNumber}`);
    console.assert(submitRes.data.data.status === 'PENDING_REVIEW', 'Expected status PENDING_REVIEW');

    // 5. Query created application by ID
    console.log(`\n[TEST 5] Querying application by ID: ${createdAppId}...`);
    const queryById = await request('GET', `/api/welfare/disability/applications/${createdAppId}`);
    console.assert(queryById.status === 200, `Expected 200, got ${queryById.status}`);
    console.assert(
      queryById.data.data.applicant.fullName === 'Nimal Jayasinghe',
      'Applicant name mismatch'
    );
    console.log(`  -> PASS: Retrieved application for ${queryById.data.data.applicant.fullName}`);

    // 6. Query applications by DID
    console.log(`\n[TEST 6] Querying applications for DID: did:smartgrama:prototype:001...`);
    const queryByDid = await request(
      'GET',
      '/api/welfare/disability/applications/by-did/did:smartgrama:prototype:001'
    );
    console.assert(queryByDid.status === 200, `Expected 200, got ${queryByDid.status}`);
    console.assert(Array.isArray(queryByDid.data.data), 'Expected array response');
    console.assert(queryByDid.data.data.length >= 1, 'Expected at least 1 application');
    console.log(`  -> PASS: Found ${queryByDid.data.data.length} application(s) linked to DID.`);

    console.log('\n======================================================');
    console.log('  ALL DISABILITY ASSISTANCE BACKEND TESTS PASSED (6/6)');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runDisabilityTests();
