import {
  WelfareScheme,
  EligibilityRuleConfig,
  EligibilityResult,
} from '../types/welfare-eligibility';

export interface IWelfareEligibilityProvider {
  getActiveRuleConfig(scheme: WelfareScheme): EligibilityRuleConfig;
  getRuleConfigByVersion(scheme: WelfareScheme, version: string): EligibilityRuleConfig | null;
  setRuleConfig(config: EligibilityRuleConfig): void;
  saveEligibilityResult(result: EligibilityResult): EligibilityResult;
  getLatestEligibilityResult(applicationId: string): EligibilityResult | null;
  getAllEligibilityResultsByApplicationId(applicationId: string): EligibilityResult[];
  getEligibilityResultsByDid(did: string): EligibilityResult[];
  getNextResultSequence(): number;
}

/**
 * Prototype scoring rules for Aswesuma Proxy Means Testing (PMT).
 * DISCLAIMER: These coefficients, indicator weights, and category thresholds are
 * prototype / research values designed for simulation, evaluation, and explainability.
 * They are NOT official gazetted Welfare Benefits Board (WBB) or DCS Sri Lanka parameters.
 */
export const DEFAULT_ASWESUMA_RULE_CONFIG_V1: EligibilityRuleConfig = {
  scheme: 'ASWESUMA',
  ruleVersion: 'v1.0.0-prototype',
  description: 'SmartGrama Prototype Multi-dimensional Poverty & Vulnerability Scoring Rules v1.0.0',
  interceptScore: 180.0, // Base constant
  indicatorWeights: [
    // ------------------------------------------------------------------------
    // 1. EDUCATION
    // ------------------------------------------------------------------------
    {
      dimension: 'EDUCATION',
      indicatorKey: 'highestEducationHead_NoFormal',
      operator: 'EQUALS',
      targetValue: 'No Formal Education',
      weight: 70.0,
      reasonTemplate: 'Household head has no formal education (+70.0 pts to vulnerability)',
    },
    {
      dimension: 'EDUCATION',
      indicatorKey: 'highestEducationHead_Primary',
      operator: 'EQUALS',
      targetValue: 'Primary (Grades 1-5)',
      weight: 50.0,
      reasonTemplate: 'Household head primary education level (+50.0 pts to vulnerability)',
    },
    {
      dimension: 'EDUCATION',
      indicatorKey: 'highestEducationHead_Secondary',
      operator: 'EQUALS',
      targetValue: 'Secondary (Grades 6-11)',
      weight: 30.0,
      reasonTemplate: 'Household head secondary education level (+30.0 pts to vulnerability)',
    },
    {
      dimension: 'EDUCATION',
      indicatorKey: 'highestEducationHead_OL',
      operator: 'EQUALS',
      targetValue: 'G.C.E. O/L',
      weight: 10.0,
      reasonTemplate: 'Household head G.C.E. O/L completion (+10.0 pts to vulnerability)',
    },
    {
      dimension: 'EDUCATION',
      indicatorKey: 'highestEducationHead_HigherEdu',
      operator: 'EQUALS',
      targetValue: 'Higher Education / Degree',
      weight: -40.0,
      reasonTemplate: 'Household head holds higher education / degree (-40.0 pts from vulnerability)',
    },
    {
      dimension: 'EDUCATION',
      indicatorKey: 'schoolAttendance_None',
      operator: 'EQUALS',
      targetValue: 'None Attend',
      weight: 60.0,
      reasonTemplate: 'School-aged children do not attend school regularly (+60.0 pts to vulnerability)',
    },
    {
      dimension: 'EDUCATION',
      indicatorKey: 'schoolAttendance_Some',
      operator: 'EQUALS',
      targetValue: 'Some Attend',
      weight: 35.0,
      reasonTemplate: 'Irregular school attendance among household children (+35.0 pts to vulnerability)',
    },
    {
      dimension: 'EDUCATION',
      indicatorKey: 'schoolDropouts',
      operator: 'EQUALS',
      targetValue: 'Has Dropout Children',
      weight: 40.0,
      reasonTemplate: 'Household has documented school dropouts (+40.0 pts to vulnerability)',
    },

    // ------------------------------------------------------------------------
    // 2. HEALTH & SPECIAL NEEDS
    // ------------------------------------------------------------------------
    {
      dimension: 'HEALTH_AND_SPECIAL_NEEDS',
      indicatorKey: 'disabilityCount',
      operator: 'CUSTOM',
      weight: 45.0,
      reasonTemplate: 'Household members living with certified permanent disabilities',
    },
    {
      dimension: 'HEALTH_AND_SPECIAL_NEEDS',
      indicatorKey: 'chronicIllnessCount',
      operator: 'CUSTOM',
      weight: 30.0,
      reasonTemplate: 'Household members suffering from severe chronic illnesses',
    },
    {
      dimension: 'HEALTH_AND_SPECIAL_NEEDS',
      indicatorKey: 'hasCkd',
      operator: 'EQUALS',
      targetValue: true,
      weight: 50.0,
      reasonTemplate: 'Household member diagnosed with Chronic Kidney Disease (CKD/CKDu) (+50.0 pts)',
    },
    {
      dimension: 'HEALTH_AND_SPECIAL_NEEDS',
      indicatorKey: 'hasCancer',
      operator: 'EQUALS',
      targetValue: true,
      weight: 50.0,
      reasonTemplate: 'Household member diagnosed with Cancer (+50.0 pts)',
    },
    {
      dimension: 'HEALTH_AND_SPECIAL_NEEDS',
      indicatorKey: 'hasParalysis',
      operator: 'EQUALS',
      targetValue: true,
      weight: 40.0,
      reasonTemplate: 'Household member suffering from paralysis/stroke condition (+40.0 pts)',
    },
    {
      dimension: 'HEALTH_AND_SPECIAL_NEEDS',
      indicatorKey: 'bedriddenElderlyCount',
      operator: 'CUSTOM',
      weight: 40.0,
      reasonTemplate: 'Bedridden elderly members requiring intensive daily care',
    },
    {
      dimension: 'HEALTH_AND_SPECIAL_NEEDS',
      indicatorKey: 'fullyDependentElderlyCount',
      operator: 'CUSTOM',
      weight: 25.0,
      reasonTemplate: 'Fully dependent senior citizens in household',
    },

    // ------------------------------------------------------------------------
    // 3. ECONOMIC LEVEL & INCOME
    // ------------------------------------------------------------------------
    {
      dimension: 'ECONOMIC_LEVEL_AND_INCOME',
      indicatorKey: 'livelihood_DailyWage',
      operator: 'EQUALS',
      targetValue: 'Daily wage',
      weight: 60.0,
      reasonTemplate: 'Primary livelihood relies on daily-wage / informal labor (+60.0 pts to vulnerability)',
    },
    {
      dimension: 'ECONOMIC_LEVEL_AND_INCOME',
      indicatorKey: 'livelihood_Agriculture',
      operator: 'EQUALS',
      targetValue: 'Agriculture',
      weight: 40.0,
      reasonTemplate: 'Primary livelihood in smallholder agriculture (+40.0 pts to vulnerability)',
    },
    {
      dimension: 'ECONOMIC_LEVEL_AND_INCOME',
      indicatorKey: 'livelihood_FormalEmployment',
      operator: 'EQUALS',
      targetValue: 'Formal employment',
      weight: -40.0,
      reasonTemplate: 'Stable formal employment provides regular income (-40.0 pts from vulnerability)',
    },
    {
      dimension: 'ECONOMIC_LEVEL_AND_INCOME',
      indicatorKey: 'livelihood_Business',
      operator: 'EQUALS',
      targetValue: 'Business',
      weight: -30.0,
      reasonTemplate: 'Commercial enterprise income source (-30.0 pts from vulnerability)',
    },
    {
      dimension: 'ECONOMIC_LEVEL_AND_INCOME',
      indicatorKey: 'monthlyIncome_Below15k',
      operator: 'LESS_THAN',
      targetValue: 15000,
      weight: 90.0,
      reasonTemplate: 'Monthly income below 15,000 LKR indicates severe income poverty (+90.0 pts)',
    },
    {
      dimension: 'ECONOMIC_LEVEL_AND_INCOME',
      indicatorKey: 'monthlyIncome_15kTo30k',
      operator: 'CUSTOM',
      weight: 55.0,
      reasonTemplate: 'Monthly income between 15,000 and 30,000 LKR (+55.0 pts)',
    },
    {
      dimension: 'ECONOMIC_LEVEL_AND_INCOME',
      indicatorKey: 'monthlyIncome_30kTo50k',
      operator: 'CUSTOM',
      weight: 25.0,
      reasonTemplate: 'Monthly income between 30,000 and 50,000 LKR (+25.0 pts)',
    },
    {
      dimension: 'ECONOMIC_LEVEL_AND_INCOME',
      indicatorKey: 'monthlyIncome_Above80k',
      operator: 'GREATER_THAN',
      targetValue: 80000,
      weight: -60.0,
      reasonTemplate: 'Monthly income exceeding 80,000 LKR demonstrates adequate economic means (-60.0 pts)',
    },
    {
      dimension: 'ECONOMIC_LEVEL_AND_INCOME',
      indicatorKey: 'electricity_LowConsumption',
      operator: 'LESS_THAN',
      targetValue: 31,
      weight: 45.0,
      reasonTemplate: 'Electricity consumption <= 30 kWh indicates minimal appliance ownership (+45.0 pts)',
    },
    {
      dimension: 'ECONOMIC_LEVEL_AND_INCOME',
      indicatorKey: 'electricity_ModerateConsumption',
      operator: 'CUSTOM',
      weight: 20.0,
      reasonTemplate: 'Electricity consumption 31-60 kWh indicates modest basic appliance usage (+20.0 pts)',
    },
    {
      dimension: 'ECONOMIC_LEVEL_AND_INCOME',
      indicatorKey: 'electricity_HighConsumption',
      operator: 'GREATER_THAN',
      targetValue: 120,
      weight: -45.0,
      reasonTemplate: 'High electricity consumption > 120 kWh correlates with high durable asset ownership (-45.0 pts)',
    },

    // ------------------------------------------------------------------------
    // 4. ASSETS & OWNERSHIP
    // ------------------------------------------------------------------------
    {
      dimension: 'ASSETS_AND_OWNERSHIP',
      indicatorKey: 'vehicles_None',
      operator: 'CONTAINS',
      targetValue: 'None',
      weight: 35.0,
      reasonTemplate: 'Household owns no motorized transportation assets (+35.0 pts)',
    },
    {
      dimension: 'ASSETS_AND_OWNERSHIP',
      indicatorKey: 'vehicles_CarOrVan',
      operator: 'CONTAINS',
      targetValue: 'Car / Van',
      weight: -90.0,
      reasonTemplate: 'Ownership of four-wheel private motor vehicle (-90.0 pts)',
    },
    {
      dimension: 'ASSETS_AND_OWNERSHIP',
      indicatorKey: 'vehicles_Tractor',
      operator: 'CONTAINS',
      targetValue: 'Tractor',
      weight: -40.0,
      reasonTemplate: 'Ownership of agricultural tractor machinery (-40.0 pts)',
    },
    {
      dimension: 'ASSETS_AND_OWNERSHIP',
      indicatorKey: 'durables_None',
      operator: 'CONTAINS',
      targetValue: 'None',
      weight: 35.0,
      reasonTemplate: 'Household owns no major domestic appliances (+35.0 pts)',
    },
    {
      dimension: 'ASSETS_AND_OWNERSHIP',
      indicatorKey: 'durables_Refrigerator',
      operator: 'CONTAINS',
      targetValue: 'Refrigerator',
      weight: -20.0,
      reasonTemplate: 'Refrigerator ownership indicates moderate asset holding (-20.0 pts)',
    },
    {
      dimension: 'ASSETS_AND_OWNERSHIP',
      indicatorKey: 'durables_WashingMachine',
      operator: 'CONTAINS',
      targetValue: 'Washing Machine',
      weight: -35.0,
      reasonTemplate: 'Washing machine ownership indicates advanced domestic durable assets (-35.0 pts)',
    },
    {
      dimension: 'ASSETS_AND_OWNERSHIP',
      indicatorKey: 'land_Landless',
      operator: 'CUSTOM',
      weight: 30.0,
      reasonTemplate: 'Household owns neither residential nor agricultural land (+30.0 pts)',
    },
    {
      dimension: 'ASSETS_AND_OWNERSHIP',
      indicatorKey: 'land_LargeExtent',
      operator: 'GREATER_THAN',
      targetValue: 80,
      weight: -40.0,
      reasonTemplate: 'Land holding extent exceeds 80 perches (-40.0 pts)',
    },

    // ------------------------------------------------------------------------
    // 5. HOUSING CONDITIONS
    // ------------------------------------------------------------------------
    {
      dimension: 'HOUSING_CONDITIONS',
      indicatorKey: 'ownership_TemporaryShelter',
      operator: 'EQUALS',
      targetValue: 'Temporary shelter',
      weight: 80.0,
      reasonTemplate: 'Residence is a temporary or makeshift shelter (+80.0 pts to vulnerability)',
    },
    {
      dimension: 'HOUSING_CONDITIONS',
      indicatorKey: 'ownership_Encroached',
      operator: 'EQUALS',
      targetValue: 'Encroached',
      weight: 45.0,
      reasonTemplate: 'Unsettled / informal land tenure status (+45.0 pts to vulnerability)',
    },
    {
      dimension: 'HOUSING_CONDITIONS',
      indicatorKey: 'roof_Thatched',
      operator: 'EQUALS',
      targetValue: 'Thatched',
      weight: 50.0,
      reasonTemplate: 'Substandard thatched roofing material (+50.0 pts)',
    },
    {
      dimension: 'HOUSING_CONDITIONS',
      indicatorKey: 'roof_Tin',
      operator: 'EQUALS',
      targetValue: 'Tin',
      weight: 30.0,
      reasonTemplate: 'Corrugated sheet / tin roofing material (+30.0 pts)',
    },
    {
      dimension: 'HOUSING_CONDITIONS',
      indicatorKey: 'wall_ClayOrPlank',
      operator: 'CUSTOM',
      weight: 45.0,
      reasonTemplate: 'Unplastered clay, mud, or plank wall construction (+45.0 pts)',
    },
    {
      dimension: 'HOUSING_CONDITIONS',
      indicatorKey: 'floor_MudOrClay',
      operator: 'EQUALS',
      targetValue: 'Mud / Clay',
      weight: 50.0,
      reasonTemplate: 'Unfinished mud or clay floor construction (+50.0 pts)',
    },
    {
      dimension: 'HOUSING_CONDITIONS',
      indicatorKey: 'floor_Tile',
      operator: 'EQUALS',
      targetValue: 'Tile',
      weight: -25.0,
      reasonTemplate: 'Finished tiled flooring (-25.0 pts)',
    },
    {
      dimension: 'HOUSING_CONDITIONS',
      indicatorKey: 'water_NoSafeAccess',
      operator: 'EQUALS',
      targetValue: 'No',
      weight: 40.0,
      reasonTemplate: 'Lack of access to protected safe drinking water source (+40.0 pts)',
    },
    {
      dimension: 'HOUSING_CONDITIONS',
      indicatorKey: 'toilet_NoPrivateSanitary',
      operator: 'EQUALS',
      targetValue: 'No',
      weight: 45.0,
      reasonTemplate: 'Lack of private sanitary toilet facility (+45.0 pts)',
    },

    // ------------------------------------------------------------------------
    // 6. FAMILY DEMOGRAPHY
    // ------------------------------------------------------------------------
    {
      dimension: 'FAMILY_DEMOGRAPHY',
      indicatorKey: 'childrenCount',
      operator: 'CUSTOM',
      weight: 20.0,
      reasonTemplate: 'Dependent children below age 15 in household',
    },
    {
      dimension: 'FAMILY_DEMOGRAPHY',
      indicatorKey: 'elderlyCount',
      operator: 'CUSTOM',
      weight: 20.0,
      reasonTemplate: 'Senior citizens aged 65 and above in household',
    },
    {
      dimension: 'FAMILY_DEMOGRAPHY',
      indicatorKey: 'singleParentHousehold',
      operator: 'EQUALS',
      targetValue: 'Yes',
      weight: 45.0,
      reasonTemplate: 'Single-parent headed household (+45.0 pts)',
    },
    {
      dimension: 'FAMILY_DEMOGRAPHY',
      indicatorKey: 'femaleHeadedHousehold',
      operator: 'EQUALS',
      targetValue: 'Yes',
      weight: 35.0,
      reasonTemplate: 'Female-headed household (+35.0 pts)',
    },
    {
      dimension: 'FAMILY_DEMOGRAPHY',
      indicatorKey: 'workingAgeMembers',
      operator: 'CUSTOM',
      weight: -15.0,
      reasonTemplate: 'Economically active working-age members (ages 15-64)',
    },
  ],

  categoryThresholds: [
    {
      category: 'SEVERELY_POOR',
      minScore: 700.0,
      maxScore: 9999.0,
      eligibilityStatus: 'ELIGIBLE',
      monthlyBenefitLkr: 17500,
      description: 'Severe multi-dimensional deprivation and extreme income poverty',
    },
    {
      category: 'POOR',
      minScore: 550.0,
      maxScore: 699.99,
      eligibilityStatus: 'ELIGIBLE',
      monthlyBenefitLkr: 10000,
      description: 'Low income with significant structural and demographic vulnerabilities',
    },
    {
      category: 'VULNERABLE',
      minScore: 400.0,
      maxScore: 549.99,
      eligibilityStatus: 'ELIGIBLE',
      monthlyBenefitLkr: 5000,
      description: 'Vulnerable near-poor with moderate multi-dimensional dependency',
    },
    {
      category: 'TRANSITIONAL',
      minScore: 300.0,
      maxScore: 399.99,
      eligibilityStatus: 'ELIGIBLE',
      monthlyBenefitLkr: 2500,
      description: 'Transitional cushion for households near poverty boundary',
    },
    {
      category: 'NON_POOR',
      minScore: -9999.0,
      maxScore: 299.99,
      eligibilityStatus: 'INELIGIBLE',
      monthlyBenefitLkr: 0,
      description: 'Above welfare eligibility threshold with adequate economic resilience',
    },
  ],

  // Administrative Boundary Review Configuration
  boundaryTolerancePoints: 10.0,
  boundaryReviewEnabled: true,

  effectiveFrom: '2026-01-01T00:00:00.000Z',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-08-26T00:00:00.000Z',
};

export class MockWelfareEligibilityProvider implements IWelfareEligibilityProvider {
  private ruleConfigs = new Map<string, EligibilityRuleConfig>();
  private resultsByAppId = new Map<string, EligibilityResult>();
  private historyByAppId = new Map<string, EligibilityResult[]>();
  private resultsByDid = new Map<string, EligibilityResult[]>();
  private resultSequence = 1;

  constructor() {
    this.seedDefaultConfigs();
  }

  private seedDefaultConfigs(): void {
    const key = `${DEFAULT_ASWESUMA_RULE_CONFIG_V1.scheme}:${DEFAULT_ASWESUMA_RULE_CONFIG_V1.ruleVersion}`;
    this.ruleConfigs.set(key, DEFAULT_ASWESUMA_RULE_CONFIG_V1);
  }

  public getActiveRuleConfig(scheme: WelfareScheme): EligibilityRuleConfig {
    // Find active config for scheme
    for (const config of this.ruleConfigs.values()) {
      if (config.scheme === scheme && config.status === 'ACTIVE') {
        return config;
      }
    }
    return DEFAULT_ASWESUMA_RULE_CONFIG_V1;
  }

  public getRuleConfigByVersion(scheme: WelfareScheme, version: string): EligibilityRuleConfig | null {
    const key = `${scheme}:${version}`;
    return this.ruleConfigs.get(key) || null;
  }

  public setRuleConfig(config: EligibilityRuleConfig): void {
    const key = `${config.scheme}:${config.ruleVersion}`;
    this.ruleConfigs.set(key, config);
  }

  public getNextResultSequence(): number {
    return this.resultSequence++;
  }

  public saveEligibilityResult(result: EligibilityResult): EligibilityResult {
    const immutableCopy = { ...result };
    this.resultsByAppId.set(result.applicationId, immutableCopy);

    const history = this.historyByAppId.get(result.applicationId) || [];
    history.push(immutableCopy);
    this.historyByAppId.set(result.applicationId, history);

    const existingForDid = this.resultsByDid.get(result.did) || [];
    const idx = existingForDid.findIndex((r) => r.applicationId === result.applicationId);
    if (idx >= 0) {
      existingForDid[idx] = immutableCopy;
    } else {
      existingForDid.push(immutableCopy);
    }
    this.resultsByDid.set(result.did, existingForDid);

    return immutableCopy;
  }

  public getLatestEligibilityResult(applicationId: string): EligibilityResult | null {
    const result = this.resultsByAppId.get(applicationId);
    return result ? { ...result } : null;
  }

  public getAllEligibilityResultsByApplicationId(applicationId: string): EligibilityResult[] {
    const list = this.historyByAppId.get(applicationId) || [];
    return list.map((r) => ({ ...r }));
  }

  public getEligibilityResultsByDid(did: string): EligibilityResult[] {
    return (this.resultsByDid.get(did) || []).map((r) => ({ ...r }));
  }
}

export const mockWelfareEligibilityProvider = new MockWelfareEligibilityProvider();
