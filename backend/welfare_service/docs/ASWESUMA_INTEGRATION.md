# SmartGrama Aswesuma Integration Guide

## 1. Component Overview

The **SmartGrama Aswesuma Welfare Module** is a decentralized identity-gated social safety net application and eligibility calculation engine. It allows Sri Lankan citizens with verified Decentralized Identifiers (DIDs) to apply for the Aswesuma welfare scheme, evaluates their multi-dimensional deprivation index using an off-chain Proxy Means Test (PMT) algorithm across six socio-economic dimensions, enables authorized government officers to review cases, and anchors tamper-proof, zero-PII certified eligibility verdicts to a blockchain ledger.

This component is architected using a decoupled layered structure:
$$\text{Route} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Provider} \longrightarrow \text{Types}$$

The blockchain subsystem is strictly abstracted behind the `IBlockchainProvider` interface. In the current phase, an in-memory `MockBlockchainProvider` simulates the ledger. The Hyperledger Fabric / Chaincode team can integrate their live network by implementing this single provider interface without altering any off-chain scoring or intake logic.

---

## 2. Aswesuma API List

| Method | Endpoint | Purpose | Request Body | Response Body | Fabric Integration |
|:---|:---|:---|:---|:---|:---|
| `POST` | `/api/welfare/aswesuma/applications` | Submit new 10-step Aswesuma Application | Full socio-economic application payload + `did` | `{ success: true, data: { applicationId, did, status: "SUBMITTED" } }` | Off-chain only |
| `GET` | `/api/welfare/aswesuma/applications/:applicationId` | Retrieve full application details by ID | None (URL param: `applicationId`) | `{ success: true, data: WelfareApplication }` | Off-chain only |
| `GET` | `/api/welfare/aswesuma/applications/did/:did` | Retrieve all applications submitted by a citizen DID | None (URL param: `did`) | `{ success: true, data: WelfareApplication[] }` | Off-chain only |
| `POST` | `/api/welfare/aswesuma/applications/:applicationId/eligibility/calculate` | Evaluate multi-dimensional PMT eligibility score off-chain | `{ ruleVersion?: string }` | `{ success: true, data: EligibilityResult }` | Off-chain (produces data for Fabric) |
| `GET` | `/api/welfare/aswesuma/applications/:applicationId/eligibility` | Get latest off-chain calculated eligibility result | None (URL param: `applicationId`) | `{ success: true, data: EligibilityResult }` | Off-chain only |
| `POST` | `/api/welfare/aswesuma/applications/:applicationId/eligibility/blockchain` | Anchor certified eligibility result to blockchain ledger | None (URL param: `applicationId`) | `{ success: true, data: EligibilityBlockchainPayload }` | **Direct Fabric Invocation** (`recordEligibility`) |
| `GET` | `/api/welfare/aswesuma/applications/:applicationId/eligibility/blockchain` | Query active on-chain eligibility record for application | None (URL param: `applicationId`) | `{ success: true, data: EligibilityBlockchainPayload }` | **Direct Fabric Query** (`getEligibilityRecordByApplicationId`) |
| `GET` | `/api/welfare/eligibility/blockchain/:recordId` | Query specific on-chain record by primary ledger key | None (URL param: `recordId`) | `{ success: true, data: EligibilityBlockchainPayload }` | **Direct Fabric Query** (`getEligibilityRecord`) |
| `GET` | `/api/welfare/aswesuma/applications/:applicationId/eligibility/blockchain/verify` | Verify cryptographic hash integrity (Off-chain vs On-chain) | None (URL param: `applicationId`) | `{ success: true, data: BlockchainVerificationResult }` | **Direct Fabric Query** (compares stored `payloadHash`) |
| `POST` | `/api/welfare/aswesuma/applications/:applicationId/reassessment` | Reassess eligibility with updated data & chain new record | `{ officerId: string, reason: string, updatedData?: object }` | `{ success: true, data: { lifecycleState, newEligibilityResult, newBlockchainRecord } }` | **Direct Fabric Invocation** (links `previousRecordId`) |
| `POST` | `/api/welfare/aswesuma/applications/:applicationId/lifecycle` | Transition benefit lifecycle (`BENEFIT_ACTIVATED`, etc.) | `{ event: string, officerId: string, reason: string }` | `{ success: true, data: BenefitLifecycleState }` | Off-chain state machine & ledger cross-ref |
| `GET` | `/api/welfare/aswesuma/applications/:applicationId/lifecycle` | Query active benefit lifecycle state | None (URL param: `applicationId`) | `{ success: true, data: BenefitLifecycleState }` | Off-chain only |
| `GET` | `/api/welfare/aswesuma/applications/:applicationId/history` | Query complete chronological audit history | None (URL param: `applicationId`) | `{ success: true, data: { eligibilityHistory, blockchainHistory, lifecycleEvents } }` | **Direct Fabric Query** (`getAllEligibilityRecordsByApplicationId`) |

---

## 3. Aswesuma Data Flow

```text
+-----------------------------------------------------------------------------------------------+
|                                  SMARTGRAMA ASWESUMA DATA FLOW                                 |
+-----------------------------------------------------------------------------------------------+
welfare management 

  [ CITIZEN / DID LAYER ]
            │
            ▼
  1. Submit Aswesuma Application (10 Steps)
     - Validates applicant holds VERIFIED DID (`did:smartgrama:prototype:...`)
     - Masks bank account details
     - Persists application as `SUBMITTED` (`ASW-2026-000001`)
            │
            ▼
  [ OFF-CHAIN ELIGIBILITY PMT ENGINE (WE-3) ]
     - Ingests 6 dimensions: Education, Health, Economic, Assets, Housing, Demography
     - Evaluates configurable rule weights (`v1.0.0-prototype`)
     - Calculates Score = Base Intercept (180.0) + Sum(Dimension Scores)
     - Applies Poverty Category thresholds & Boundary Zone tolerance (300 ± 10 pts)
     - Produces `EligibilityResult` (`ELG-2026-000001`) with itemized audit breakdown
            │
            ▼
  [ OFFICER REVIEW & BENEFIT DECISION DASHBOARD ]
     - Divisional Secretary / Officer reviews calculated poverty category
     - Officer executes `BENEFIT_ACTIVATED` or requests `REASSESSMENT`
            │
            ▼
  [ BLOCKCHAIN ADAPTER SERVICE (WE-4) ]
     - Canonicalizes full `EligibilityResult` (recursive alphabetical key sorting)
     - Generates SHA-256 cryptographic digest (`payloadHash`)
     - Strips all PII, address, NIC, raw income, and health dossiers (Zero PII)
     - Constructs `EligibilityBlockchainPayload`
            │
            ▼  ==============================================================
            │  INTEGRATION BOUNDARY: IBlockchainProvider
            ▼  ==============================================================
  [ HYPERLEDGER FABRIC / CHAINCODE LAYER ]
     - Fabric Gateway SDK submits `RecordEligibility` transaction
     - Endorsing Peers execute chaincode & validate payload
     - Commits asset to State Database (CouchDB) with Key = `recordId` (`REC-BC-2026-000001`)
            │
            ▼
  [ PUBLIC / OFFICER VERIFICATION ]
     - `GET .../verify` compares recalculation hash vs on-chain `payloadHash`
     - Returns `VALID` (Integrity confirmed) or `INVALID` (Tampering detected)
```

---

## 4. Integration Boundary

### SmartGrama Responsibilities
1. **Identity & KYC Gatekeeping**: Verifies citizen identity, ensures approved DID issuance, and restricts application intake.
2. **Socio-Economic Data Intake**: Captures, validates, and stores the 10-step Aswesuma questionnaire.
3. **Off-Chain PMT Scoring Engine**: Executes the multi-dimensional poverty scoring formula, determines beneficiary categories (`SEVERELY_POOR`, `POOR`, `VULNERABLE`, `TRANSITIONAL`, `NON_POOR`), and flags boundary cases for review.
4. **Data Sanitization & Zero-PII Enforcement**: Strips all sensitive citizen details, ensures zero personal data enters the blockchain layer.
5. **Deterministic Canonical Hashing**: Generates consistent SHA-256 digests (`payloadHash`) across off-chain evaluation models.
6. **Benefit Lifecycle State Machine**: Enforces valid status transitions (`PENDING`, `ACTIVE`, `UNDER_REVIEW`, `SUSPENDED`, `TERMINATED`).

### Hyperledger Fabric Responsibilities
1. **Immutable Asset Ledgering**: Stores `EligibilityBlockchainPayload` records immutably on the channel state database (CouchDB).
2. **Chaincode State Transitions**: Manages asset status transitions (`ACTIVE`, `SUPERSEDED`, `TERMINATED`) and links version history via `previousRecordId`.
3. **Consensus & Multi-Party Endorsement**: Ensures Divisional Secretariats, Welfare Benefits Board (WBB), and Audit Nodes reach consensus on recorded scores.
4. **CouchDB Query Indexing**: Maintains indexes on `applicationId` and `timestamp` for fast query resolution.
5. **Historical Key Queries**: Supports `GetHistoryForKey` or query-by-application-id for end-to-end auditability.

---

## 5. Blockchain Data Contract

### Exact Payload Sent to Hyperledger Fabric (`EligibilityBlockchainPayload`)

```typescript
export interface EligibilityBlockchainPayload {
  recordId: string;                // Primary Ledger Key, e.g. "REC-BC-2026-000001"
  applicationId: string;           // Secondary Index, e.g. "ASW-2026-000001"
  didReference: string;            // Citizen Pseudonymous DID, e.g. "did:smartgrama:prototype:001"
  scheme: WelfareScheme;           // Policy Scheme, e.g. "ASWESUMA"
  ruleVersion: string;             // Rule Engine Version, e.g. "v1.0.0-prototype"
  calculatedScore: number;         // Certified PMT Score, e.g. 565.0
  category: WelfareCategory;       // Beneficiary Bracket: "POOR"
  eligibilityStatus: WelfareEligibilityStatus; // Verdict: "ELIGIBLE" | "INELIGIBLE" | "REVIEW_REQUIRED"
  thresholdReference: string;      // Applied Policy Bracket: "POOR-THRESHOLD-550-699.99"
  recordStatus: BlockchainRecordStatus; // Ledger State: "ACTIVE" | "SUPERSEDED" | "TERMINATED"
  previousRecordId?: string;       // Links to prior record on re-assessment / versioning
  timestamp: string;               // ISO 8601 UTC timestamp of commit
  payloadHash?: string;            // 64-character SHA-256 digest of off-chain result
}
```

### JSON Sample Transmitted Over the Boundary

```json
{
  "recordId": "REC-BC-2026-000001",
  "applicationId": "ASW-2026-000001",
  "didReference": "did:smartgrama:prototype:001",
  "scheme": "ASWESUMA",
  "ruleVersion": "v1.0.0-prototype",
  "calculatedScore": 565,
  "category": "POOR",
  "eligibilityStatus": "ELIGIBLE",
  "thresholdReference": "POOR-THRESHOLD-550-699.99",
  "recordStatus": "ACTIVE",
  "timestamp": "2026-08-27T04:21:59.050Z",
  "payloadHash": "8430fd2160b69b57f28e2c56d7f60e2535e04fe008fd9ad0bdd443225981724b"
}
```

### Data Kept Strictly Off-Chain (NEVER Sent to Blockchain)
- **Personal Identifiers**: Full Name, NIC Number, Date of Birth, Gender, Mobile Phone, Email.
- **Location Information**: Permanent Address, Street, City, GN Division.
- **Financial Information**: Bank Name, Branch Code, Masked/Unmasked Bank Account Number.
- **Economic Figures**: Raw Monthly Income (LKR), Monthly Expenses, Electricity Units (kWh).
- **Medical / Disability Information**: Specific disease diagnoses (CKD, Cancer, Paralysis), medical certificates.
- **Household Roster**: Family member names, ages, individual educational certificates, and school dropout names.

---

## 6. Blockchain Provider Interface

All blockchain interactions pass through the `IBlockchainProvider` abstraction in `src/providers/blockchain/blockchain.provider.interface.ts`:

```typescript
import { EligibilityBlockchainPayload } from '../../types/welfare-eligibility';

export interface IBlockchainProvider {
  /**
   * Commits a new immutable eligibility record to the blockchain ledger.
   */
  recordEligibility(payload: EligibilityBlockchainPayload): Promise<EligibilityBlockchainPayload>;

  /**
   * Retrieves a record by primary key (recordId).
   */
  getEligibilityRecord(recordId: string): Promise<EligibilityBlockchainPayload | null>;

  /**
   * Retrieves the active (current) record for an application.
   */
  getEligibilityRecordByApplicationId(applicationId: string): Promise<EligibilityBlockchainPayload | null>;

  /**
   * Retrieves all historical records for an application (both ACTIVE and SUPERSEDED).
   */
  getAllEligibilityRecordsByApplicationId(applicationId: string): Promise<EligibilityBlockchainPayload[]>;

  /**
   * Verifies if a record exists and is in ACTIVE status.
   */
  verifyEligibilityRecord(recordId: string): Promise<boolean>;

  /**
   * Generates a sequential record ID sequence counter.
   */
  getNextBlockchainRecordSequence(): number;
}
```

---

## 7. Integration Sequence

```text
+----------+      +-------------------+      +------------------------------+      +------------------------+      +-------------------+
|  Client  |      | Express / Router  |      | EligibilityBlockchainService |      | FabricBlockchainAdapter|      | Hyperledger Fabric|
+----+-----+      +---------+---------+      +--------------+---------------+      +-----------+------------+      +---------+---------+
     |                      |                               |                                  |                             |
     | POST .../blockchain  |                               |                                  |                             |
     |--------------------->|                               |                                  |                             |
     |                      | recordEligibility(appId)      |                                  |                             |
     |                      |------------------------------>|                                  |                             |
     |                      |                               | 1. Fetch EligibilityResult       |                             |
     |                      |                               | 2. Compute canonical SHA-256     |                             |
     |                      |                               | 3. Assemble Zero-PII Payload     |                             |
     |                      |                               |                                  |                             |
     |                      |                               | recordEligibility(payload)       |                             |
     |                      |                               |--------------------------------->|                             |
     |                      |                               |                                  | contract.submitTransaction  |
     |                      |                               |                                  |---------------------------->|
     |                      |                               |                                  |                             | 1. Endorsement
     |                      |                               |                                  |                             | 2. Ordering
     |                      |                               |                                  |                             | 3. CouchDB Commit
     |                      |                               |                                  | Asset Committed JSON        |
     |                      |                               |                                  |<----------------------------|
     |                      |                               | Return Payload                   |                             |
     |                      |                               |<---------------------------------|                             |
     |                      | HTTP 201 Created (JSON)       |                                  |                             |
     |<---------------------|-------------------------------|                                  |                             |
```

1. **Client / Officer Action**: Client calls `POST /api/welfare/aswesuma/applications/:applicationId/eligibility/blockchain`.
2. **Result Retrieval**: `EligibilityBlockchainService` loads the certified `EligibilityResult` generated by WE-3.
3. **Cryptographic Hashing**: Canonicalizes keys alphabetically and creates SHA-256 digest (`payloadHash`).
4. **Sanitization**: Strips all sensitive data and populates `EligibilityBlockchainPayload`.
5. **Chaincode Invocation**: Calls `IBlockchainProvider.recordEligibility(payload)`.
6. **Fabric Execution**: The Fabric provider connects via Gateway SDK, submits `RecordEligibility` transaction to peers, and receives block commit confirmation.
7. **Response Delivery**: Returns `201 Created` with `recordId` and `payloadHash`.

---

## 8. Re-assessment / Update Handling

```text
                          Initial Application
                                   │
                                   ▼
                      ┌─────────────────────────┐
                      │ Record: REC-BC-001      │
                      │ Status: ACTIVE          │
                      │ Score: 565 (POOR)       │
                      └────────────┬────────────┘
                                   │
           Annual Review / Income Change (POST /reassessment)
                                   │
                                   ▼
          ┌─────────────────────────────────────────────────┐
          │                                                 │
          ▼                                                 ▼
┌─────────────────────────┐                       ┌─────────────────────────┐
│ Record: REC-BC-001      │                       │ Record: REC-BC-002      │
│ Status: SUPERSEDED      │◀──────────────────────│ previousRecordId: 001   │
│ (Immutable in History)  │                       │ Status: ACTIVE          │
└─────────────────────────┘                       │ Score: 605 (POOR)       │
                                                  └─────────────────────────┘
```

1. **Reassessment Trigger (`POST .../reassessment`)**:
   - Updates circumstances and recalculates score off-chain &rarr; produces new `EligibilityResult` (`ELG-2026-000002`).
   - The prior `EligibilityResult` (`ELG-2026-000001`) remains stored in history.
2. **Blockchain Version Chaining**:
   - Fabric creates a new record asset `REC-BC-2026-000002` with `recordStatus: 'ACTIVE'` and `previousRecordId: 'REC-BC-2026-000001'`.
   - The existing record `REC-BC-2026-000001` is updated to `recordStatus: 'SUPERSEDED'`.
3. **Beneficiary Death / Administrative Termination**:
   - Submitting `BENEFICIARY_DEATH_RECORDED` records the death certificate number in off-chain audit logs and transitions the benefit status to `TERMINATED`.
   - On-chain records are **never deleted**, maintaining an unbroken historical audit trail.

---

## 9. Important Integration Rules

1. **Zero PII on Blockchain**: Never add citizen names, NIC numbers, addresses, bank accounts, or health conditions to the chaincode payload.
2. **Preserve `applicationId`**: The application identifier (`ASW-YYYY-XXXXXX`) is the primary link between off-chain records and on-chain assets.
3. **Preserve `didReference`**: The decentralized identity string (`did:smartgrama:prototype:...`) must be preserved for citizen credential correlation.
4. **Preserve `ruleVersion`**: The scoring rule tag (`v1.0.0-prototype`) must be recorded to enable historical auditability if policy rules change.
5. **Preserve Calculated Score & Category**: `calculatedScore` and `category` must match the certified off-chain evaluation exactly.
6. **Preserve `previousRecordId`**: When superseding a prior record, the new record must reference the previous record ID.
7. **Preserve `payloadHash`**: The 64-character SHA-256 hash must be stored on-chain to support tamper detection.
8. **Do Not Break `IBlockchainProvider`**: The Fabric implementation must conform exactly to `IBlockchainProvider` method signatures and return types.

---

## 10. Environment & Configuration Requirements

Add the following environment variables to `.env` when deploying Hyperledger Fabric:

```ini
# Application Server
PORT=5000
NODE_ENV=development

# Hyperledger Fabric Network Configuration
FABRIC_CONNECTION_PROFILE_PATH=./config/connection-org1.json
FABRIC_CHANNEL_NAME=welfarechannel
FABRIC_CHAINCODE_NAME=aswesuma_eligibility
FABRIC_MSP_ID=Org1MSP
FABRIC_WALLET_PATH=./wallet
FABRIC_USER_IDENTITY=officerAppUser
FABRIC_DISCOVERY_ENABLED=true
FABRIC_AS_LOCALHOST=true
```

---

## 11. Integration Checklist

- [ ] **1. Create Fabric Adapter**: Implement `FabricBlockchainProvider` in `src/providers/blockchain/fabric-blockchain.provider.ts` satisfying `IBlockchainProvider`.
- [ ] **2. Install Fabric SDK**: Install `fabric-network` and `@hyperledger/fabric-gateway` in `package.json`.
- [ ] **3. Match Chaincode Struct**: Ensure the chaincode asset structure in Go/TypeScript matches `EligibilityBlockchainPayload` field names.
- [ ] **4. Configure Connection Profile**: Place `connection-org1.json` and credentials in `config/` or `wallet/`.
- [ ] **5. Deploy CouchDB Indexes**: Create and deploy CouchDB index on `applicationId` and `timestamp`.
- [ ] **6. Wire Export**: In `src/providers/blockchain/index.ts`, replace `mockBlockchainProvider` with `fabricBlockchainProvider`.
- [ ] **7. Execute Integration Tests**: Run `npm run build` and test suites (`test-we4.ts`, `test-we5.ts`) against the live channel.
