import { toast } from 'react-toastify';
import { uploadImage } from 'editor/plugins/withImages';
import { store } from 'lib/store';
import supabase from 'lib/supabase';
import { BillingFrequency, PlanId } from 'constants/pricing';

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    info: jest.fn(() => 'toast-id'),
    dismiss: jest.fn(),
  },
}));

const upload = jest.fn();
const createSignedUrl = jest.fn();

jest.mock('lib/supabase', () => ({
  auth: {
    getSession: jest.fn(),
  },
  storage: {
    from: () => ({
      upload: (...args: unknown[]) => upload(...args),
      createSignedUrl: (...args: unknown[]) => createSignedUrl(...args),
    }),
  },
}));

describe('uploadImage', () => {
  const file = new File(['test'], 'test.png', { type: 'image/png' });

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
    });
    upload.mockResolvedValue({ error: null });
    createSignedUrl.mockResolvedValue({
      data: { signedUrl: 'https://example.com/signed-url' },
      error: null,
    });
    store.setState({
      billingDetails: { planId: PlanId.Basic },
      isUpgradeModalOpen: false,
    });
  });

  it('blocks uploads on the basic plan', async () => {
    const result = await uploadImage(file);

    expect(result).toBeNull();
    expect(upload).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      'Image uploads are only available on the Pro plan. Upgrade to upload images.'
    );
    expect(store.getState().isUpgradeModalOpen).toBe(true);
  });

  it('uploads images on the pro plan', async () => {
    store.setState({
      billingDetails: {
        planId: PlanId.Pro,
        frequency: BillingFrequency.Monthly,
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
      },
    });

    const result = await uploadImage(file);

    expect(result).toBe('https://example.com/signed-url');
    expect(upload).toHaveBeenCalled();
    expect(store.getState().isUpgradeModalOpen).toBe(false);
  });

  it('rejects images over 20 MB on the pro plan', async () => {
    store.setState({
      billingDetails: {
        planId: PlanId.Pro,
        frequency: BillingFrequency.Monthly,
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
      },
    });
    const largeFile = new File([''], 'large.png', { type: 'image/png' });
    Object.defineProperty(largeFile, 'size', { value: 20 * 1024 * 1024 + 1 });

    const result = await uploadImage(largeFile);

    expect(result).toBeNull();
    expect(upload).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      'Your image is over the 20 MB limit. Please upload a smaller image.'
    );
  });
});
