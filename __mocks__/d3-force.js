const forceSimulation = jest.fn(() => ({
  force: forceSimulation,
  on: forceSimulation,
}));

module.exports = {
  forceCenter: jest.fn(),
  forceCollide: jest.fn(() => ({ radius: jest.fn() })),
  forceLink: jest.fn(() => ({ id: jest.fn() })),
  forceManyBody: jest.fn(() => ({ strength: jest.fn() })),
  forceSimulation,
  forceX: jest.fn(),
  forceY: jest.fn(),
};
