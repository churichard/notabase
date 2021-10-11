import { render, screen, act } from '@testing-library/react';
import { store } from 'lib/store';
import AppHome from 'pages/app/index';

describe('AppHome', () => {
  it('renders empty text state', () => {
    render(<AppHome />);

    const emptyText = screen.getByText(
      'Get started by clicking “Find or Create Note” in the sidebar'
    );
    expect(emptyText).toBeInTheDocument();
  });

  it('does not render open sidebar button if the sidebar is open', () => {
    render(<AppHome />);

    act(() => {
      store.getState().setIsSidebarOpen(true);
    });

    const openSidebarButton = screen.queryByRole('button', {
      name: 'Open sidebar',
    });
    expect(openSidebarButton).not.toBeInTheDocument();
  });

  it('renders open sidebar button if the sidebar is closed', () => {
    render(<AppHome />);

    act(() => {
      store.getState().setIsSidebarOpen(false);
    });

    const openSidebarButton = screen.getByRole('button', {
      name: 'Open sidebar',
    });
    expect(openSidebarButton).toBeInTheDocument();
  });
});
