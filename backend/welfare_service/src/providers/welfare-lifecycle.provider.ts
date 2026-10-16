import {
  BenefitLifecycleState,
  WelfareLifecycleEvent,
} from '../types/welfare-lifecycle';

export interface IWelfareLifecycleProvider {
  getLifecycleState(applicationId: string): BenefitLifecycleState | null;
  saveLifecycleState(state: BenefitLifecycleState): BenefitLifecycleState;
  recordLifecycleEvent(event: WelfareLifecycleEvent): WelfareLifecycleEvent;
  getEventsByApplicationId(applicationId: string): WelfareLifecycleEvent[];
  getNextEventSequence(): number;
  getNextLifecycleSequence(): number;
}

export class MockWelfareLifecycleProvider implements IWelfareLifecycleProvider {
  private readonly lifecycleStatesByAppId = new Map<string, BenefitLifecycleState>();
  private readonly eventsByAppId = new Map<string, WelfareLifecycleEvent[]>();
  private readonly allEvents: WelfareLifecycleEvent[] = [];
  private eventSequence = 1;
  private lifecycleSequence = 1;

  public getLifecycleState(applicationId: string): BenefitLifecycleState | null {
    const state = this.lifecycleStatesByAppId.get(applicationId);
    return state ? { ...state, history: [...state.history] } : null;
  }

  public saveLifecycleState(state: BenefitLifecycleState): BenefitLifecycleState {
    const copy: BenefitLifecycleState = {
      ...state,
      history: [...state.history],
    };
    this.lifecycleStatesByAppId.set(state.applicationId, copy);
    return { ...copy };
  }

  public recordLifecycleEvent(event: WelfareLifecycleEvent): WelfareLifecycleEvent {
    const copy: WelfareLifecycleEvent = { ...event };
    this.allEvents.push(copy);

    const appEvents = this.eventsByAppId.get(event.applicationId) || [];
    appEvents.push(copy);
    this.eventsByAppId.set(event.applicationId, appEvents);

    return { ...copy };
  }

  public getEventsByApplicationId(applicationId: string): WelfareLifecycleEvent[] {
    const list = this.eventsByAppId.get(applicationId) || [];
    return list.map((e) => ({ ...e }));
  }

  public getNextEventSequence(): number {
    return this.eventSequence++;
  }

  public getNextLifecycleSequence(): number {
    return this.lifecycleSequence++;
  }
}

export const mockWelfareLifecycleProvider = new MockWelfareLifecycleProvider();
