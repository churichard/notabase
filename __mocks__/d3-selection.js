const select = jest.fn(() => ({ call: select, on: select }));

module.exports = {
  select,
};
