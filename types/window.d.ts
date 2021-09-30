import { Workbox } from 'workbox-window';

declare global {
  interface Window {
    workbox: Workbox;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plausible: any;
  }
}
