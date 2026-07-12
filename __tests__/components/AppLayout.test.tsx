import { render, screen, act, waitFor } from '@testing-library/react';
import AppLayout from 'components/AppLayout';
import { PlanId } from 'constants/pricing';
import { store } from 'lib/store';
import supabase from 'lib/supabase';
import supabaseMock from '__mocks__/supabase';
import { AuthContext } from 'utils/useAuth';
import notes from '__fixtures__/notes';
import { Subscription, SubscriptionStatus } from 'types/supabase';

describe('AppLayout', () => {
  const createAuth = () => ({
    isLoaded: true,
    user: {
      id: '1',
      app_metadata: {},
      user_metadata: {},
      aud: '',
      created_at: new Date().toISOString(),
    },
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  });

  const renderAppLayout = () =>
    render(
      <AuthContext.Provider value={createAuth()}>
        <AppLayout>
          <div>Test</div>
        </AppLayout>
      </AuthContext.Provider>
    );

  beforeEach(() => {
    act(() => {
      store.getState().setNotes(notes);
    });
  });

  it('renders children', async () => {
    renderAppLayout();

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(supabase.from).toHaveBeenCalledWith('notes');
    expect(supabaseMock.select).toHaveBeenCalledWith(
      'id, user_id, title, created_at, updated_at, visibility'
    );
    expect(supabaseMock.select).not.toHaveBeenCalledWith('*');

    expect(await screen.findByText('Test')).toBeInTheDocument();
  });

  describe('subscription', () => {
    let setBillingDetailsSpy: jest.SpyInstance;

    const mockSubscription = (data: Partial<Subscription>) => {
      supabaseMock.maybeSingle.mockImplementation(() => ({ data }));
    };

    beforeEach(() => {
      setBillingDetailsSpy = jest.spyOn(store.getState(), 'setBillingDetails');
    });

    it('sets basic plan by default', async () => {
      renderAppLayout();

      await waitFor(() => {
        expect(supabaseMock.maybeSingle).toHaveBeenCalled();
      });

      await waitFor(() => {
        const billingDetails = store.getState().billingDetails;
        expect(billingDetails.planId).toBe(PlanId.Basic);
      });
    });

    it("sets the pro plan if the user is on pro, their subscription is active, and they haven't passed their current period end", async () => {
      mockSubscription({
        plan_id: PlanId.Pro,
        subscription_status: SubscriptionStatus.Active,
        current_period_end: new Date(Date.now() + 1000).toISOString(),
      });

      renderAppLayout();

      await waitFor(() => {
        expect(supabaseMock.maybeSingle).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(setBillingDetailsSpy).toHaveBeenCalled();
      });
      expect(store.getState().billingDetails.planId).toBe(PlanId.Pro);
    });

    it("sets the basic plan if the user is on pro, their subscription is inactive, and they haven't passed their current period end", async () => {
      mockSubscription({
        plan_id: PlanId.Pro,
        subscription_status: SubscriptionStatus.Inactive,
        current_period_end: new Date(Date.now() + 1000).toISOString(),
      });

      renderAppLayout();

      await waitFor(() => {
        expect(supabaseMock.maybeSingle).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(setBillingDetailsSpy).toHaveBeenCalled();
      });
      expect(store.getState().billingDetails.planId).toBe(PlanId.Basic);
    });

    it("sets the basic plan if the user is on pro, their subscription is active, and they've passed their current period end", async () => {
      mockSubscription({
        plan_id: PlanId.Pro,
        subscription_status: SubscriptionStatus.Active,
        current_period_end: new Date(Date.now() - 1000).toISOString(),
      });

      renderAppLayout();

      await waitFor(() => {
        expect(supabaseMock.maybeSingle).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(setBillingDetailsSpy).toHaveBeenCalled();
      });
      expect(store.getState().billingDetails.planId).toBe(PlanId.Basic);
    });

    it('sets the basic plan if the user is on basic', async () => {
      mockSubscription({
        plan_id: PlanId.Basic,
        subscription_status: SubscriptionStatus.Active,
        current_period_end: new Date(Date.now() + 1000).toISOString(),
      });

      renderAppLayout();

      await waitFor(() => {
        expect(supabaseMock.maybeSingle).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(setBillingDetailsSpy).toHaveBeenCalled();
      });
      expect(store.getState().billingDetails.planId).toBe(PlanId.Basic);
    });

    it('keeps the app loading until billing details are available', async () => {
      let resolveSubscription: (value: { data: Partial<Subscription> }) => void;
      const subscription = new Promise<{ data: Partial<Subscription> }>(
        (resolve) => {
          resolveSubscription = resolve;
        }
      );
      supabaseMock.maybeSingle.mockImplementation(() => subscription);

      renderAppLayout();

      await waitFor(() => {
        expect(supabaseMock.maybeSingle).toHaveBeenCalled();
      });
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.queryByText('Test')).not.toBeInTheDocument();

      resolveSubscription!({
        data: {
          plan_id: PlanId.Pro,
          subscription_status: SubscriptionStatus.Active,
          current_period_end: new Date(Date.now() + 1000).toISOString(),
        },
      });

      expect(await screen.findByText('Test')).toBeInTheDocument();
      expect(store.getState().billingDetails.planId).toBe(PlanId.Pro);
    });

    it('stays rendered when the user object identity changes, e.g. on token refresh', async () => {
      mockSubscription({
        plan_id: PlanId.Pro,
        subscription_status: SubscriptionStatus.Active,
        current_period_end: new Date(Date.now() + 1000).toISOString(),
      });

      const { rerender } = renderAppLayout();
      expect(await screen.findByText('Test')).toBeInTheDocument();

      // A token refresh produces a new user object with the same id
      rerender(
        <AuthContext.Provider value={createAuth()}>
          <AppLayout>
            <div>Test</div>
          </AppLayout>
        </AuthContext.Provider>
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });
  });
});
