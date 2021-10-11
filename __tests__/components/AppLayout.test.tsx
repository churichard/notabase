import { render, screen, act, waitFor } from '@testing-library/react';
import AppLayout from 'components/AppLayout';
import { PlanId } from 'constants/pricing';
import { store } from 'lib/store';
import supabase from 'lib/supabase';
import supabaseMock from '__mocks__/supabase';
import { AuthContext } from 'utils/useAuth';
import notes from '__fixtures__/notes';
import { Subscription, SubscriptionStatus } from 'types/supabase';

jest.mock('next/router', () => ({
  useRouter: () => ({ query: {}, pathname: '/app' }),
}));

describe('AppLayout', () => {
  const renderAppLayout = () => {
    const auth = {
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
    };
    return render(
      <AuthContext.Provider value={auth}>
        <AppLayout>
          <div>Test</div>
        </AppLayout>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    act(() => {
      store.getState().setNotes(notes);
    });
  });

  it('renders children', async () => {
    renderAppLayout();

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(supabase.from).toHaveBeenCalledWith('notes');

    expect(await screen.findByText('Test')).toBeInTheDocument();
  });

  describe('subscription', () => {
    it('sets basic plan by default', async () => {
      renderAppLayout();

      await waitFor(() => {
        const billingDetails = store.getState().billingDetails;
        expect(billingDetails.planId).toBe(PlanId.Basic);
      });
    });

    it("sets the pro plan if the user is on pro, their subscription is active, and they haven't passed their current period end", async () => {
      const mockSupabaseData: Partial<Subscription> = {
        plan_id: PlanId.Pro,
        subscription_status: SubscriptionStatus.Active,
        current_period_end: new Date(Date.now() + 1000).toISOString(),
      };
      supabaseMock.maybeSingle.mockImplementation(() => ({
        data: mockSupabaseData,
      }));

      renderAppLayout();

      await waitFor(() => {
        const billingDetails = store.getState().billingDetails;
        expect(billingDetails.planId).toBe(PlanId.Pro);
      });
    });
  });
});
