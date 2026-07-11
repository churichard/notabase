import type { PostHog } from 'posthog-js';

let posthogPromise: Promise<PostHog | null> | undefined;

const loadPostHog = () => {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return Promise.resolve(null);
  }

  if (!posthogPromise) {
    posthogPromise = import('posthog-js')
      .then(({ default: posthog }) => {
        if (!posthog.__loaded) {
          posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
            api_host:
              process.env.NEXT_PUBLIC_POSTHOG_HOST ||
              'https://us.i.posthog.com',
            defaults: '2025-05-24',
            mask_all_text: true,
            property_denylist: ['title'],
          });
        }

        return posthog;
      })
      .catch(() => null);
  }

  return posthogPromise;
};

export const initializePostHog = () => {
  void loadPostHog();
};

export const capturePostHogEvent = (eventName: string) => {
  void loadPostHog().then((posthog) => posthog?.capture(eventName));
};
