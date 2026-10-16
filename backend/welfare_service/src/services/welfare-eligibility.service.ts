import { IWelfareProvider, mockWelfareProvider } from '../providers/welfare.provider';
import { IIdentityProvider, mockIdentityProvider } from '../providers/identity.provider';
import { IVerificationProvider, mockVerificationProvider } from '../providers/verification.provider';
import {
  IWelfareEligibilityProvider,
  mockWelfareEligibilityProvider,
} from '../providers/welfare-eligibility.provider';
import {
  EligibilityInput,
  EligibilityResult,
  EligibilityRuleConfig,
  EligibilityDimensionName,
  DimensionScoreExplanation,
  DimensionScoreSummary,
  CategoryThresholdApplied,
  WelfareCategory,
  WelfareEligibilityStatus,
} from '../types/welfare-eligibility';
import { WelfareApplication } from '../types/welfare';

export type CalculateEligibilityResult =
  | {
      status: 'SUCCESS';
      data: EligibilityResult;
    }
  | {
      status: 'NOT_FOUND';
      error: string;
    }
  | {
      status: 'UNAUTHORIZED';
      error: string;
    }
  | {
      status: 'INVALID_STATE';
      error: string;
    };

export class WelfareEligibilityService {
  private readonly welfareProvider: IWelfareProvider;
  private readonly eligibilityProvider: IWelfareEligibilityProvider;
  private readonly identityProvider: IIdentityProvider;
  private readonly verificationProvider: IVerificationProvider;

  constructor(
    welfareProvider: IWelfareProvider = mockWelfareProvider,
    eligibilityProvider: IWelfareEligibilityProvider = mockWelfareEligibilityProvider,
    identityProvider: IIdentityProvider = mockIdentityProvider,
    verificationProvider: IVerificationProvider = mockVerificationProvider
  ) {
    this.welfareProvider = welfareProvider;
    this.eligibilityProvider = eligibilityProvider;
    this.identityProvider = identityProvider;
    this.verificationProvider = verificationProvider;
  }

  public getLatestEligibilityResult(applicationId: string): EligibilityResult | null {
    return this.eligibilityProvider.getLatestEligibilityResult(applicationId);
  }

  public getEligibilityResultsByDid(did: string): EligibilityResult[] {
    return this.eligibilityProvider.getEligibilityResultsByDid(did);
  }

  /**
   * Evaluates an existing Aswesuma Application against the active or requested rule configuration.
   * Deterministic calculation: Same input + same ruleVersion produces the exact same score.
   */
  public calculateAswesumaEligibility(
    applicationId: string,
    requestedRuleVersion?: string
  ): CalculateEligibilityResult {
    // 1. Retrieve the submitted Aswesuma application
    const application = this.welfareProvider.getApplicationById(applicationId);
    if (!application) {
      return {
        status: 'NOT_FOUND',
        error: `Aswesuma application not found with ID: ${applicationId}`,
      };
    }

    if (application.programme !== 'ASWESUMA') {
      return {
        status: 'INVALID_STATE',
        error: `Application ${applicationId} is under ${application.programme}, not ASWESUMA.`,
      };
    }

    // Enforce that application must be SUBMITTED (reject DRAFT)
    if (application.status !== 'SUBMITTED') {
      return {
        status: 'INVALID_STATE',
        error: `Application ${applicationId} is in '${application.status}' status. Only officially SUBMITTED applications can be assessed for welfare eligibility.`,
      };
    }

    // 2. Verify applicant holds a valid & VERIFIED Digital Identity
    const digitalIdentity = this.identityProvider.getIdentityByDid(application.did);
    if (!digitalIdentity) {
      return {
        status: 'UNAUTHORIZED',
        error: `Digital Identity record not found for DID: ${application.did}.`,
      };
    }

    const allVerifications = this.verificationProvider.getAllRecords();
    const verificationRecord = allVerifications.find(
      (v) =>
        v.did === application.did ||
        (application.userId && v.userId === application.userId) ||
        v.userId === digitalIdentity.userId
    );

    if (!verificationRecord || verificationRecord.finalStatus !== 'VERIFIED') {
      return {
        status: 'UNAUTHORIZED',
        error: 'Access restricted: Application cannot be assessed until applicant identity is officially VERIFIED.',
      };
    }

    // 3. Load the designated rule configuration
    const config: EligibilityRuleConfig = requestedRuleVersion
      ? this.eligibilityProvider.getRuleConfigByVersion('ASWESUMA', requestedRuleVersion) ||
        this.eligibilityProvider.getActiveRuleConfig('ASWESUMA')
      : this.eligibilityProvider.getActiveRuleConfig('ASWESUMA');

    // 4. Convert application data into the standard EligibilityInput structure
    const input: EligibilityInput = this.mapApplicationToEligibilityInput(application, config.ruleVersion);

    // 5. Execute rule engine evaluation
    const result = this.evaluateEligibility(input, config);

    // 6. Persist result
    this.eligibilityProvider.saveEligibilityResult(result);

    return {
      status: 'SUCCESS',
      data: result,
    };
  }

  /**
   * Directly evaluate an EligibilityInput structure against the active or given rule config.
   */
  public evaluateEligibilityInput(
    input: EligibilityInput,
    customConfig?: EligibilityRuleConfig
  ): EligibilityResult {
    const config =
      customConfig ||
      this.eligibilityProvider.getRuleConfigByVersion(input.scheme, input.ruleVersion) ||
      this.eligibilityProvider.getActiveRuleConfig(input.scheme);

    return this.evaluateEligibility(input, config);
  }

  private mapApplicationToEligibilityInput(
    app: WelfareApplication,
    ruleVersion: string
  ): EligibilityInput {
    const totalMembers = app.householdInformation?.totalMembers || 1;
    const income = app.economic?.estimatedMonthlyIncome || 0;

    return {
      applicationId: app.applicationId,
      did: app.did,
      userId: app.userId,
      scheme: 'ASWESUMA',
      ruleVersion,
      education: { ...app.education },
      health: { ...app.health },
      economic: { ...app.economic },
      assets: { ...app.assets },
      housing: { ...app.housing },
      familyDemography: { ...app.familyDemography },
      householdSummary: {
        totalMembers,
        perCapitaIncome: Math.round(income / Math.max(1, totalMembers)),
      },
      assessmentTimestamp: new Date().toISOString(),
    };
  }

  /**
   * Pure evaluation function ensuring mathematical determinism and explainability.
   */
  public evaluateEligibility(
    input: EligibilityInput,
    config: EligibilityRuleConfig
  ): EligibilityResult {
    const allDimensions: EligibilityDimensionName[] = [
      'EDUCATION',
      'HEALTH_AND_SPECIAL_NEEDS',
      'ECONOMIC_LEVEL_AND_INCOME',
      'ASSETS_AND_OWNERSHIP',
      'HOUSING_CONDITIONS',
      'FAMILY_DEMOGRAPHY',
    ];

    const dimensionBreakdown: Record<EligibilityDimensionName, DimensionScoreSummary> = {
      EDUCATION: { dimension: 'EDUCATION', score: 0, explanationList: [] },
      HEALTH_AND_SPECIAL_NEEDS: { dimension: 'HEALTH_AND_SPECIAL_NEEDS', score: 0, explanationList: [] },
      ECONOMIC_LEVEL_AND_INCOME: { dimension: 'ECONOMIC_LEVEL_AND_INCOME', score: 0, explanationList: [] },
      ASSETS_AND_OWNERSHIP: { dimension: 'ASSETS_AND_OWNERSHIP', score: 0, explanationList: [] },
      HOUSING_CONDITIONS: { dimension: 'HOUSING_CONDITIONS', score: 0, explanationList: [] },
      FAMILY_DEMOGRAPHY: { dimension: 'FAMILY_DEMOGRAPHY', score: 0, explanationList: [] },
    };

    const itemizedExplanations: DimensionScoreExplanation[] = [];

    // Evaluate configured indicator weights against input data
    for (const rule of config.indicatorWeights) {
      const evaluation = this.evaluateRuleIndicator(rule.indicatorKey, input, rule.weight, rule.reasonTemplate);
      if (evaluation.applied) {
        const item: DimensionScoreExplanation = {
          dimension: rule.dimension,
          indicator: evaluation.indicatorLabel,
          indicatorKey: rule.indicatorKey,
          inputValue: evaluation.inputValue,
          weight: rule.weight,
          contribution: evaluation.contribution,
          reason: evaluation.reason,
        };

        dimensionBreakdown[rule.dimension].score += evaluation.contribution;
        dimensionBreakdown[rule.dimension].explanationList.push(item);
        itemizedExplanations.push(item);
      }
    }

    // Round dimension scores to 2 decimals
    let totalDimensionSum = 0;
    for (const dim of allDimensions) {
      dimensionBreakdown[dim].score = Math.round(dimensionBreakdown[dim].score * 100) / 100;
      totalDimensionSum += dimensionBreakdown[dim].score;
    }

    // Calculate final score = intercept + sum of all dimension contributions
    const calculatedScore = Math.round((config.interceptScore + totalDimensionSum) * 100) / 100;

    // Determine category and baseline status based on configured thresholds
    const thresholdApplied = this.matchCategoryThreshold(calculatedScore, config);

    // ------------------------------------------------------------------------
    // Step 3: Administrative Boundary & Tolerance Zone Handling
    // ------------------------------------------------------------------------
    let finalEligibilityStatus = thresholdApplied.eligibilityStatus;
    let reviewRequired = false;
    let reviewReason: string | undefined;
    let boundaryZone = false;

    const tolerance = config.boundaryTolerancePoints ?? 10.0;
    const boundaryReviewEnabled = config.boundaryReviewEnabled ?? true;

    if (boundaryReviewEnabled) {
      // Threshold between TRANSITIONAL (eligible) and NON_POOR (ineligible) is 300.0 pts
      const eligibilityCutoff = 300.0;
      const distFromCutoff = Math.abs(calculatedScore - eligibilityCutoff);

      if (distFromCutoff <= tolerance) {
        reviewRequired = true;
        boundaryZone = true;
        finalEligibilityStatus = 'REVIEW_REQUIRED';
        reviewReason = `Calculated score (${calculatedScore} pts) falls within the boundary tolerance zone (±${tolerance} pts) of the eligibility threshold (${eligibilityCutoff} pts). Flagged for administrative verification.`;
      }
    }

    const seq = this.eligibilityProvider.getNextResultSequence();
    const year = new Date().getFullYear();
    const resultId = `ELG-${year}-${seq.toString().padStart(6, '0')}`;

    const categoryMap: Record<string, { en: string; si: string }> = {
      SEVERELY_POOR: { en: 'Severely Impoverished (Tier 1)', si: 'අතිශය දුප්පත් කාණ්ඩය (ප්‍රමුඛතා මට්ටම 1)' },
      POOR: { en: 'Poor Household Tier (Tier 2)', si: 'දුප්පත් පවුල් කාණ්ඩය (මට්ටම 2)' },
      VULNERABLE: { en: 'Vulnerable Household Tier (Tier 3)', si: 'අවදානමට ලක්වූ කාණ්ඩය (මට්ටම 3)' },
      TRANSITIONAL: { en: 'Transitional Cushion Tier (Tier 4)', si: 'සංක්‍රාන්තික කාණ්ඩය (මට්ටම 4)' },
      NON_POOR: { en: 'Non-Poor / Self-Sufficient', si: 'දිළිඳු නොවන / ස්වයංපෝෂිත' },
    };

    const statusMap: Record<string, { en: string; si: string }> = {
      ELIGIBLE: { en: 'Eligible for Aswesuma Direct Grant', si: 'අස්වැසුම සෘජු දීමනාව සඳහා සුදුසුකම් සපුරා ඇත' },
      INELIGIBLE: { en: 'Not Eligible for Direct Cash Aid', si: 'සෘජු මුදල් ආධාර සඳහා සුදුසුකම් නොලබයි' },
      REVIEW_REQUIRED: { en: 'Flagged for Grama Niladhari Review', si: 'ග්‍රාම නිලධාරී සමාලෝචනය සඳහා යොමු කර ඇත' },
    };

    const dimensionTitles: Record<string, { en: string; si: string }> = {
      EDUCATION: { en: 'Education Level', si: 'අධ්‍යාපන මට්ටම' },
      HEALTH_AND_SPECIAL_NEEDS: { en: 'Health & Special Needs', si: 'සෞඛ්‍ය සහ විශේෂ අවශ්‍යතා' },
      ECONOMIC_LEVEL_AND_INCOME: { en: 'Economic Level & Income', si: 'ආර්ථික මට්ටම සහ ආදායම' },
      ASSETS_AND_OWNERSHIP: { en: 'Assets & Land Holdings', si: 'වත්කම් සහ ඉඩම් හිමිකාරිත්වය' },
      HOUSING_CONDITIONS: { en: 'Housing & Living Conditions', si: 'නිවාස සහ ජීවන තත්ත්වය' },
      FAMILY_DEMOGRAPHY: { en: 'Family Demography', si: 'පවුල් ජනගහන විස්තර' },
    };

    const monthlyLkr = thresholdApplied.monthlyBenefitLkr ?? 0;

    return {
      resultId,
      applicationId: input.applicationId,
      did: input.did,
      scheme: input.scheme,
      ruleVersion: config.ruleVersion,
      calculatedScore,
      category: thresholdApplied.category,
      eligibilityStatus: finalEligibilityStatus,
      thresholdApplied,
      dimensionBreakdown,
      itemizedExplanations,
      reviewRequired,
      reviewReason,
      boundaryZone,
      calculatedAt: input.assessmentTimestamp,
      engineVersion: 'SmartGrama-PMT-Engine-v1.0.0',
      isSimulated: true, // Mark as prototype simulation
      translations: {
        category: categoryMap[thresholdApplied.category] || { en: thresholdApplied.category, si: thresholdApplied.category },
        status: statusMap[finalEligibilityStatus] || { en: finalEligibilityStatus, si: finalEligibilityStatus },
        stipendFormatted: {
          en: `Rs. ${monthlyLkr.toLocaleString()} / month`,
          si: `රු. ${monthlyLkr.toLocaleString()} / මසකට`,
        },
        dimensions: dimensionTitles,
      },
    };
  }

  private evaluateRuleIndicator(
    indicatorKey: string,
    input: EligibilityInput,
    weight: number,
    reasonTemplate: string
  ): { applied: boolean; indicatorLabel: string; inputValue: any; contribution: number; reason: string } {
    switch (indicatorKey) {
      // 1. Education
      case 'highestEducationHead_NoFormal':
        if (input.education.highestEducationHead === 'No Formal Education') {
          return { applied: true, indicatorLabel: 'Highest Education Level of Household Head', inputValue: input.education.highestEducationHead, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'highestEducationHead_Primary':
        if (input.education.highestEducationHead === 'Primary (Grades 1-5)') {
          return { applied: true, indicatorLabel: 'Highest Education Level of Household Head', inputValue: input.education.highestEducationHead, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'highestEducationHead_Secondary':
        if (input.education.highestEducationHead === 'Secondary (Grades 6-11)') {
          return { applied: true, indicatorLabel: 'Highest Education Level of Household Head', inputValue: input.education.highestEducationHead, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'highestEducationHead_OL':
        if (input.education.highestEducationHead === 'G.C.E. O/L') {
          return { applied: true, indicatorLabel: 'Highest Education Level of Household Head', inputValue: input.education.highestEducationHead, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'highestEducationHead_HigherEdu':
        if (input.education.highestEducationHead === 'Higher Education / Degree') {
          return { applied: true, indicatorLabel: 'Highest Education Level of Household Head', inputValue: input.education.highestEducationHead, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'schoolAttendance_None':
        if (input.education.schoolAttendanceChildren === 'None Attend') {
          return { applied: true, indicatorLabel: 'Children School Attendance', inputValue: input.education.schoolAttendanceChildren, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'schoolAttendance_Some':
        if (input.education.schoolAttendanceChildren === 'Some Attend') {
          return { applied: true, indicatorLabel: 'Children School Attendance', inputValue: input.education.schoolAttendanceChildren, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'schoolDropouts':
        if (input.education.schoolDropoutStatus === 'Has Dropout Children') {
          return { applied: true, indicatorLabel: 'School Dropout Status', inputValue: input.education.schoolDropoutStatus, contribution: weight, reason: reasonTemplate };
        }
        break;

      // 2. Health & Special Needs
      case 'disabilityCount':
        if (input.health.disabilityCount > 0) {
          const contrib = input.health.disabilityCount * weight;
          return { applied: true, indicatorLabel: 'Certified Persons with Disabilities', inputValue: input.health.disabilityCount, contribution: contrib, reason: `${input.health.disabilityCount} member(s) with disability (+${contrib} pts)` };
        }
        break;
      case 'chronicIllnessCount':
        if (input.health.chronicIllnessCount > 0) {
          const contrib = input.health.chronicIllnessCount * weight;
          return { applied: true, indicatorLabel: 'Members with Severe Chronic Illnesses', inputValue: input.health.chronicIllnessCount, contribution: contrib, reason: `${input.health.chronicIllnessCount} member(s) with chronic illness (+${contrib} pts)` };
        }
        break;
      case 'hasCkd':
        if (input.health.hasCkd) {
          return { applied: true, indicatorLabel: 'Chronic Kidney Disease (CKD/CKDu)', inputValue: true, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'hasCancer':
        if (input.health.hasCancer) {
          return { applied: true, indicatorLabel: 'Cancer Diagnosis', inputValue: true, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'hasParalysis':
        if (input.health.hasParalysis) {
          return { applied: true, indicatorLabel: 'Paralysis or Stroke Condition', inputValue: true, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'bedriddenElderlyCount':
        if (input.health.bedriddenElderlyCount > 0) {
          const contrib = input.health.bedriddenElderlyCount * weight;
          return { applied: true, indicatorLabel: 'Bedridden Senior Citizens', inputValue: input.health.bedriddenElderlyCount, contribution: contrib, reason: `${input.health.bedriddenElderlyCount} bedridden elder(s) (+${contrib} pts)` };
        }
        break;
      case 'fullyDependentElderlyCount':
        if (input.health.fullyDependentElderlyCount > 0) {
          const contrib = input.health.fullyDependentElderlyCount * weight;
          return { applied: true, indicatorLabel: 'Dependent Senior Citizens', inputValue: input.health.fullyDependentElderlyCount, contribution: contrib, reason: `${input.health.fullyDependentElderlyCount} fully dependent elder(s) (+${contrib} pts)` };
        }
        break;

      // 3. Economic Level & Income
      case 'livelihood_DailyWage':
        if (input.economic.primaryLivelihood === 'Daily wage') {
          return { applied: true, indicatorLabel: 'Primary Livelihood Source', inputValue: input.economic.primaryLivelihood, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'livelihood_Agriculture':
        if (input.economic.primaryLivelihood === 'Agriculture') {
          return { applied: true, indicatorLabel: 'Primary Livelihood Source', inputValue: input.economic.primaryLivelihood, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'livelihood_FormalEmployment':
        if (input.economic.primaryLivelihood === 'Formal employment') {
          return { applied: true, indicatorLabel: 'Primary Livelihood Source', inputValue: input.economic.primaryLivelihood, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'livelihood_Business':
        if (input.economic.primaryLivelihood === 'Business') {
          return { applied: true, indicatorLabel: 'Primary Livelihood Source', inputValue: input.economic.primaryLivelihood, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'monthlyIncome_Below15k':
        if (input.economic.estimatedMonthlyIncome < 15000) {
          return { applied: true, indicatorLabel: 'Monthly Household Income Bracket', inputValue: `Rs. ${input.economic.estimatedMonthlyIncome}`, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'monthlyIncome_15kTo30k':
        if (input.economic.estimatedMonthlyIncome >= 15000 && input.economic.estimatedMonthlyIncome <= 30000) {
          return { applied: true, indicatorLabel: 'Monthly Household Income Bracket', inputValue: `Rs. ${input.economic.estimatedMonthlyIncome}`, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'monthlyIncome_30kTo50k':
        if (input.economic.estimatedMonthlyIncome > 30000 && input.economic.estimatedMonthlyIncome <= 50000) {
          return { applied: true, indicatorLabel: 'Monthly Household Income Bracket', inputValue: `Rs. ${input.economic.estimatedMonthlyIncome}`, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'monthlyIncome_Above80k':
        if (input.economic.estimatedMonthlyIncome > 80000) {
          return { applied: true, indicatorLabel: 'Monthly Household Income Bracket', inputValue: `Rs. ${input.economic.estimatedMonthlyIncome}`, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'electricity_LowConsumption':
        if (input.economic.averageMonthlyElectricityKwh <= 30) {
          return { applied: true, indicatorLabel: 'Average Monthly Electricity Consumption', inputValue: `${input.economic.averageMonthlyElectricityKwh} kWh`, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'electricity_ModerateConsumption':
        if (input.economic.averageMonthlyElectricityKwh > 30 && input.economic.averageMonthlyElectricityKwh <= 60) {
          return { applied: true, indicatorLabel: 'Average Monthly Electricity Consumption', inputValue: `${input.economic.averageMonthlyElectricityKwh} kWh`, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'electricity_HighConsumption':
        if (input.economic.averageMonthlyElectricityKwh > 120) {
          return { applied: true, indicatorLabel: 'Average Monthly Electricity Consumption', inputValue: `${input.economic.averageMonthlyElectricityKwh} kWh`, contribution: weight, reason: reasonTemplate };
        }
        break;

      // 4. Assets & Ownership
      case 'vehicles_None':
        if (input.assets.motorVehicles.includes('None') || input.assets.motorVehicles.length === 0) {
          return { applied: true, indicatorLabel: 'Motor Vehicle Ownership', inputValue: 'None', contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'vehicles_CarOrVan':
        if (input.assets.motorVehicles.includes('Car / Van')) {
          return { applied: true, indicatorLabel: 'Motor Vehicle Ownership', inputValue: 'Car / Van', contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'vehicles_Tractor':
        if (input.assets.motorVehicles.includes('Tractor')) {
          return { applied: true, indicatorLabel: 'Motor Vehicle Ownership', inputValue: 'Tractor', contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'durables_None':
        if (input.assets.consumerDurables.includes('None') || input.assets.consumerDurables.length === 0) {
          return { applied: true, indicatorLabel: 'Consumer Durables Ownership', inputValue: 'None', contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'durables_Refrigerator':
        if (input.assets.consumerDurables.includes('Refrigerator')) {
          return { applied: true, indicatorLabel: 'Consumer Durables Ownership', inputValue: 'Refrigerator', contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'durables_WashingMachine':
        if (input.assets.consumerDurables.includes('Washing Machine')) {
          return { applied: true, indicatorLabel: 'Consumer Durables Ownership', inputValue: 'Washing Machine', contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'land_Landless':
        if (input.assets.hasAgriculturalLand === 'No' && input.assets.hasResidentialLand === 'No') {
          return { applied: true, indicatorLabel: 'Land Tenure & Ownership', inputValue: 'Landless', contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'land_LargeExtent':
        if ((input.assets.totalLandExtentPerches || 0) > 80) {
          return { applied: true, indicatorLabel: 'Land Holding Extent', inputValue: `${input.assets.totalLandExtentPerches} perches`, contribution: weight, reason: reasonTemplate };
        }
        break;

      // 5. Housing Conditions
      case 'ownership_TemporaryShelter':
        if (input.housing.houseOwnership === 'Temporary shelter') {
          return { applied: true, indicatorLabel: 'House Tenure & Ownership', inputValue: input.housing.houseOwnership, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'ownership_Encroached':
        if (input.housing.houseOwnership === 'Encroached') {
          return { applied: true, indicatorLabel: 'House Tenure & Ownership', inputValue: input.housing.houseOwnership, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'roof_Thatched':
        if (input.housing.roofMaterial === 'Thatched') {
          return { applied: true, indicatorLabel: 'Main Roof Material', inputValue: input.housing.roofMaterial, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'roof_Tin':
        if (input.housing.roofMaterial === 'Tin') {
          return { applied: true, indicatorLabel: 'Main Roof Material', inputValue: input.housing.roofMaterial, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'wall_ClayOrPlank':
        if (input.housing.wallMaterial === 'Clay' || input.housing.wallMaterial === 'Plank') {
          return { applied: true, indicatorLabel: 'Main Wall Material', inputValue: input.housing.wallMaterial, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'floor_MudOrClay':
        if (input.housing.floorMaterial === 'Mud / Clay') {
          return { applied: true, indicatorLabel: 'Main Floor Material', inputValue: input.housing.floorMaterial, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'floor_Tile':
        if (input.housing.floorMaterial === 'Tile') {
          return { applied: true, indicatorLabel: 'Main Floor Material', inputValue: input.housing.floorMaterial, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'water_NoSafeAccess':
        if (input.housing.accessSafeDrinkingWater === 'No') {
          return { applied: true, indicatorLabel: 'Safe Drinking Water Access', inputValue: input.housing.accessSafeDrinkingWater, contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'toilet_NoPrivateSanitary':
        if (input.housing.accessPrivateSanitaryToilet === 'No') {
          return { applied: true, indicatorLabel: 'Private Sanitary Toilet Access', inputValue: input.housing.accessPrivateSanitaryToilet, contribution: weight, reason: reasonTemplate };
        }
        break;

      // 6. Family Demography
      case 'childrenCount':
        if (input.familyDemography.childrenBelow15 > 0) {
          const contrib = input.familyDemography.childrenBelow15 * weight;
          return { applied: true, indicatorLabel: 'Children Below Age 15', inputValue: input.familyDemography.childrenBelow15, contribution: contrib, reason: `${input.familyDemography.childrenBelow15} child(ren) (+${contrib} pts)` };
        }
        break;
      case 'elderlyCount':
        if (input.familyDemography.adultsOver65 > 0) {
          const contrib = input.familyDemography.adultsOver65 * weight;
          return { applied: true, indicatorLabel: 'Senior Citizens (Aged 65+)', inputValue: input.familyDemography.adultsOver65, contribution: contrib, reason: `${input.familyDemography.adultsOver65} elder(s) (+${contrib} pts)` };
        }
        break;
      case 'singleParentHousehold':
        if (input.familyDemography.singleParentHousehold === 'Yes') {
          return { applied: true, indicatorLabel: 'Single Parent Household', inputValue: 'Yes', contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'femaleHeadedHousehold':
        if (input.familyDemography.femaleHeadedHousehold === 'Yes') {
          return { applied: true, indicatorLabel: 'Female-Headed Household', inputValue: 'Yes', contribution: weight, reason: reasonTemplate };
        }
        break;
      case 'workingAgeMembers':
        if (input.familyDemography.workingAgeMembers > 0) {
          const contrib = input.familyDemography.workingAgeMembers * weight;
          return { applied: true, indicatorLabel: 'Working-Age Members (15-64)', inputValue: input.familyDemography.workingAgeMembers, contribution: contrib, reason: `${input.familyDemography.workingAgeMembers} working-age member(s) (${contrib} pts)` };
        }
        break;
    }

    return { applied: false, indicatorLabel: '', inputValue: null, contribution: 0, reason: '' };
  }

  private matchCategoryThreshold(
    score: number,
    config: EligibilityRuleConfig
  ): CategoryThresholdApplied {
    for (const t of config.categoryThresholds) {
      if (score >= t.minScore && score <= t.maxScore) {
        return {
          category: t.category,
          minScore: t.minScore,
          maxScore: t.maxScore,
          eligibilityStatus: t.eligibilityStatus,
          monthlyBenefitLkr: t.monthlyBenefitLkr,
        };
      }
    }

    // Default fallback to non-poor if out of brackets
    return {
      category: 'NON_POOR',
      minScore: -9999,
      maxScore: 299.99,
      eligibilityStatus: 'INELIGIBLE',
      monthlyBenefitLkr: 0,
    };
  }
}

export const welfareEligibilityService = new WelfareEligibilityService();
