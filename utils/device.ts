const SM_BREAKPOINT = 640;

export const isMobile = () => {
  return window.innerWidth <= SM_BREAKPOINT;
};
