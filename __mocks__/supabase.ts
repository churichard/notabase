export default {
  from: jest.fn().mockReturnThis(),
  channel: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn().mockReturnThis(),
  then: jest.fn((resolve) => resolve({ data: null, error: null })),
  subscribe: jest.fn().mockReturnThis(),
  unsubscribe: jest.fn().mockReturnThis(),
};
