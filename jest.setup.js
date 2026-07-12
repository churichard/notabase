import '@testing-library/jest-dom/extend-expect';
import '__mocks__/ResizeObserver';
import '__mocks__/zustand/vanilla';

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  init: jest.fn(),
}));
