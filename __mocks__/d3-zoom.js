const zoom = jest.fn(() => ({ scaleExtent: zoom, extent: zoom, on: zoom }));

module.exports = {
  zoom,
  zoomIdentity: jest.fn(),
  zoomTransform: jest.fn(),
};
