module.exports = {
  forceCenter: jest.fn().mockReturnThis(),
  forceCollide: jest.fn(() => ({
    radius: jest.fn().mockReturnThis(),
  })),
  forceLink: jest.fn(() => ({
    id: jest.fn().mockReturnThis(),
  })),
  forceManyBody: jest.fn(() => ({
    strength: jest.fn().mockReturnThis(),
  })),
  forceSimulation: jest.fn(() => ({
    force: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
  })),
  forceX: jest.fn().mockReturnThis(),
  forceY: jest.fn().mockReturnThis(),
};

export default {};
