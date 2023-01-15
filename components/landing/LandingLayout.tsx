import { ReactNode } from 'react';
import Footer from './Footer';
import Navbar from './Navbar';

type Props = {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
};

export default function LandingLayout(props: Props) {
  const { children, showNavbar = true, showFooter = true } = props;

  return (
    <>
      {showNavbar ? <Navbar /> : null}
      {children}
      {showFooter ? <Footer /> : null}
    </>
  );
}
