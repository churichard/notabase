export default jest.fn(() => ({
  use: jest.fn().mockReturnThis(),
  processSync: jest.fn().mockReturnThis(),
}));
