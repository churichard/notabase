module.exports = {
  drag: jest.fn(() => ({
    subject: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
  })),
  subject: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
};

export default {};
