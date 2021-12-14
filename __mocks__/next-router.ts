const router = {
  useRouter: jest.fn(() => ({
    pathname: '/app',
    query: {},
    asPath: '',
    push: jest.fn(),
  })),
};

module.exports = router;

export default router;
