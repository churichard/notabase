import { Workbox } from 'workbox-window';

declare global {
  interface Window {
    workbox: Workbox;
  }
}
