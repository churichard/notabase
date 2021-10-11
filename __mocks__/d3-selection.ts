module.exports = {
  select: jest.fn(() => ({
    call: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
  })),
};

export default {};
