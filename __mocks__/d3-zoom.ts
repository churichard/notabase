module.exports = {
  zoom: jest.fn(() => ({
    scaleExtent: jest.fn().mockReturnThis(),
    extent: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
  })),
  zoomIdentity: jest.fn().mockReturnThis(),
  zoomTransform: jest.fn().mockReturnThis(),
};

export default {};
