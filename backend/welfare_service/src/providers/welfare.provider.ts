import { WelfareApplication, ElderlyAssistanceApplication, DisabilityAssistanceApplication } from '../types/welfare';

export interface IWelfareProvider {
  // Aswesuma
  createApplication(application: WelfareApplication): WelfareApplication;
  getApplicationById(applicationId: string): WelfareApplication | null;
  getApplicationsByDid(did: string): WelfareApplication[];
  updateApplication(application: WelfareApplication): WelfareApplication;
  getNextApplicationSequence(): number;

  // Elderly Assistance (Phase W4)
  createElderlyApplication(application: ElderlyAssistanceApplication): ElderlyAssistanceApplication;
  getElderlyApplicationById(applicationId: string): ElderlyAssistanceApplication | null;
  getElderlyApplicationsByDid(did: string): ElderlyAssistanceApplication[];
  getNextElderlySequence(): number;

  // Disability Assistance (Phase W5)
  createDisabilityApplication(application: DisabilityAssistanceApplication): DisabilityAssistanceApplication;
  getDisabilityApplicationById(applicationId: string): DisabilityAssistanceApplication | null;
  getDisabilityApplicationsByDid(did: string): DisabilityAssistanceApplication[];
  getNextDisabilitySequence(): number;
}

export class MockWelfareProvider implements IWelfareProvider {
  private applicationsById = new Map<string, WelfareApplication>();
  private applicationsByDid = new Map<string, WelfareApplication[]>();
  private sequenceCounter = 1;

  private elderlyAppsById = new Map<string, ElderlyAssistanceApplication>();
  private elderlyAppsByDid = new Map<string, ElderlyAssistanceApplication[]>();
  private elderlySequenceCounter = 1;

  private disabilityAppsById = new Map<string, DisabilityAssistanceApplication>();
  private disabilityAppsByDid = new Map<string, DisabilityAssistanceApplication[]>();
  private disabilitySequenceCounter = 1;

  constructor() {
    this.seedInitialApplications();
  }

  private seedInitialApplications(): void {
    // We start with an empty or prototype seed if needed
  }

  public getNextApplicationSequence(): number {
    return this.sequenceCounter++;
  }

  public createApplication(application: WelfareApplication): WelfareApplication {
    this.applicationsById.set(application.applicationId, application);

    const existingForDid = this.applicationsByDid.get(application.did) || [];
    existingForDid.push(application);
    this.applicationsByDid.set(application.did, existingForDid);

    return application;
  }

  public getApplicationById(applicationId: string): WelfareApplication | null {
    return this.applicationsById.get(applicationId) || null;
  }

  public getApplicationsByDid(did: string): WelfareApplication[] {
    return this.applicationsByDid.get(did) || [];
  }

  public updateApplication(application: WelfareApplication): WelfareApplication {
    this.applicationsById.set(application.applicationId, application);

    const existingForDid = this.applicationsByDid.get(application.did) || [];
    const idx = existingForDid.findIndex((a) => a.applicationId === application.applicationId);
    if (idx >= 0) {
      existingForDid[idx] = application;
      this.applicationsByDid.set(application.did, existingForDid);
    }

    return application;
  }

  // -------------------------------------------------------------
  // Phase W4: Elderly Assistance Provider Methods
  // -------------------------------------------------------------

  public getNextElderlySequence(): number {
    return this.elderlySequenceCounter++;
  }

  public createElderlyApplication(application: ElderlyAssistanceApplication): ElderlyAssistanceApplication {
    this.elderlyAppsById.set(application.applicationId, application);

    const existingForDid = this.elderlyAppsByDid.get(application.did) || [];
    existingForDid.push(application);
    this.elderlyAppsByDid.set(application.did, existingForDid);

    return application;
  }

  public getElderlyApplicationById(applicationId: string): ElderlyAssistanceApplication | null {
    return this.elderlyAppsById.get(applicationId) || null;
  }

  public getElderlyApplicationsByDid(did: string): ElderlyAssistanceApplication[] {
    return this.elderlyAppsByDid.get(did) || [];
  }

  // -------------------------------------------------------------
  // Phase W5: Disability Assistance Provider Methods
  // -------------------------------------------------------------

  public getNextDisabilitySequence(): number {
    return this.disabilitySequenceCounter++;
  }

  public createDisabilityApplication(application: DisabilityAssistanceApplication): DisabilityAssistanceApplication {
    this.disabilityAppsById.set(application.applicationId, application);

    const existingForDid = this.disabilityAppsByDid.get(application.did) || [];
    existingForDid.push(application);
    this.disabilityAppsByDid.set(application.did, existingForDid);

    return application;
  }

  public getDisabilityApplicationById(applicationId: string): DisabilityAssistanceApplication | null {
    return this.disabilityAppsById.get(applicationId) || null;
  }

  public getDisabilityApplicationsByDid(did: string): DisabilityAssistanceApplication[] {
    return this.disabilityAppsByDid.get(did) || [];
  }
}

export const mockWelfareProvider = new MockWelfareProvider();
